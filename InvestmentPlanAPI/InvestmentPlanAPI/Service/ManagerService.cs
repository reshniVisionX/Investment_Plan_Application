using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.ManagerDTO;
using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Service
{
    public class ManagerService: IManagerService
    {
        private readonly IManagerRepo _repo;
        private readonly IInvestorRepo _invrepo;
        private readonly IFundRepo _fundrepo;
        private readonly IStockRepo _stockrepo;
        private readonly ITransactionRepo _transrepo;
        private readonly INotificationService _notificationService;
        private readonly HubBroadCastService _hub;


        public ManagerService(IManagerRepo repo, IInvestorRepo invrepo, IFundRepo fundrepo, IStockRepo stockrepo, ITransactionRepo transrepo, HubBroadCastService hub, INotificationService notificationService)
        {
            _repo = repo;
            _invrepo = invrepo;
            _fundrepo = fundrepo;
            _stockrepo = stockrepo;
            _transrepo = transrepo;
            _hub = hub;
            _notificationService = notificationService;
           
        }

        public async Task<IEnumerable<AllFundReportsDTO>> GetAllFundReportsAsync()
        {
            var funds = await _repo.GetAllFundsWithAllDataAsync();

            return funds.Select(f =>
            {
                var totalInvested = f.MutualFundInvestments?.Sum(i => i.TotalInvested) ?? 0;
                var currentValue = f.MutualFundInvestments?.Sum(i => i.CurrentValue) ?? 0;
                var profitLoss = f.MutualFundInvestments?.Sum(i => i.ProfitLoss) ?? 0;

                var stockDtos = f.MutualFundStocks?.Select(fs => new StockAllocations
                {
                    stockId = fs.StockId,
                    stockName = fs.Stock?.StockSymbol ?? "",
                    sector = fs.Stock!.Sector,
                    allocationPercentage = fs.AllocationPercentage, 
                    marketPrice = fs.Stock!.CurrentMarketPrice,

                    totalAmountInvested = (totalInvested * fs.AllocationPercentage) / 100M
                }).ToList() ?? new List<StockAllocations>();


                return new AllFundReportsDTO
                {
                    FundName = f.FundName,
                    NAV = f.NAV,
                    AUM = f.AUM,
                    TotalInvested = totalInvested,
                    CurrentValue = currentValue,
                    ProfitLoss = profitLoss,
                    noOfInvestors = f.MutualFundInvestments?.Count ?? 0,
                    Stocks = stockDtos
                };
            }).ToList();
        }


        public async Task<bool> SettleFundAsync(int fundId)
        {
            await _repo.BeginTransactionAsync();
            try
            {
                var fund = await _repo.GetFundByIdAsync(fundId);
                if (fund == null)
                    throw new Exception("Fund not found.");

                var stocks = await _repo.GetStocksByFundIdAsync(fundId);
                if (!stocks.Any())
                    throw new Exception("No stock allocations found for this fund.");

                var investments = await _repo.GetInvestmentsByFundIdAsync(fundId);
                if (!investments.Any())
                    throw new Exception("No investors linked to this fund.");

                decimal totalToInvest = fund.AmountReceived + fund.AmountPending;
                decimal remainingPending = 0;

                foreach (var fs in stocks)
                {
                    var stock = fs.Stock!;
                    decimal allocatedAmount = totalToInvest * (fs.AllocationPercentage / 100);

                    // Buy shares based on current price
                    decimal quantity = Math.Floor(allocatedAmount / stock.CurrentMarketPrice);
                    decimal usedAmount = quantity * stock.CurrentMarketPrice;
                    remainingPending += allocatedAmount - usedAmount;

                    // Update fund stock quantity
                    fs.QuantityHeld += quantity;

                    // DEMAND PRICE CHANGE (BUSINESS LOGIC)
                    stock.VolumeTraded += (int)quantity;

                    decimal demandFactor = (decimal)quantity / stock.TotalShares;
                    decimal priceIncreasePercent = Math.Min(demandFactor * 2.0m, 0.10m);

                    stock.CurrentMarketPrice += stock.CurrentMarketPrice * priceIncreasePercent;
                    stock.Status = stock.VolumeTraded < stock.TotalShares;
                    stock.UpdatedAt = DateTime.UtcNow;

                    await _repo.UpdateStockAsync(stock);
                    await _fundrepo.UpdateMutualFundStockAsync(fs);
                }

                // UPDATE FUND NAV & AUM
                decimal oldNAV = fund.NAV;
                fund.AUM = stocks.Sum(s => s.QuantityHeld * s.Stock!.CurrentMarketPrice);

                decimal newUnits = (totalToInvest - remainingPending) / oldNAV;
                fund.TotalUnits += newUnits;

                fund.AmountPending = remainingPending;
                fund.AmountReceived = 0;

                fund.NAV = fund.TotalUnits > 0 ? fund.AUM / fund.TotalUnits : oldNAV;

                await _repo.UpdateFundAsync(fund);

                // UPDATE EACH INVESTOR VALUE
                foreach (var inv in investments)
                {
                    inv.CurrentValue = inv.TotalUnits * fund.NAV;
                    inv.ProfitLoss = inv.CurrentValue - inv.TotalInvested;
                    inv.UpdatedAt = DateTime.UtcNow;

                    await _repo.UpdateMutualFundInvestmentAsync(inv);
                }

                // COMMIT
                await _repo.CommitTransactionAsync();

                // BROADCAST
                var stockDtos = stocks.Select(s => new BroadCastStockUpdDTO
                {
                    StockId = s.StockId,
                    Sector = s.Stock!.Sector,
                    CurrentMarketPrice = s.Stock!.CurrentMarketPrice,
                    TotalShares = s.Stock!.TotalShares,
                    VolumeTraded = s.Stock!.VolumeTraded,
                    UpdatedAt = s.Stock!.UpdatedAt
                }).ToList();

                var fundDto = new BroadCastFundUpdDTO
                {
                    FundId = fund.FundId,
                    FundName = fund.FundName,
                    NAV = fund.NAV,
                    AUM = fund.AUM,
                    TotalUnits = fund.TotalUnits,
                    MinInvestmentAmount = fund.MinInvestmentAmount,
                    UpdatedAt = DateTime.UtcNow
                };

                await _hub.BroadcastFundAndStocksAsync(fundDto, stockDtos);

                return true;
            }
            catch
            {
                await _repo.RollbackTransactionAsync();
                throw;
            }
        }


     

        public async Task<bool> RedeemInvestorFundAsync(RedeemFundDTO dto)
        {
            if (dto.redeemAmount <= 0)
                throw new Exception("Redeem amount must be greater than zero.");

            await _repo.BeginTransactionAsync();
            try
            {
                // -------------------------
                // STEP 1: VALIDATIONS
                // -------------------------
                var investor = await _invrepo.GetInvestorById(dto.investorId);
                if (investor == null)
                    throw new Exception("Investor not found.");

                var invDetails = await _invrepo.GetInvestorDetailsById(dto.investorId);

                var fund = await _fundrepo.GetFundByIdAsync(dto.fundId);
                if (fund == null)
                    throw new Exception("Fund not found.");

                var mfInvestment = await _fundrepo.GetInvestmentByInvestorAndFundAsync(dto.investorId, dto.fundId);
                if (mfInvestment == null)
                    throw new Exception("You have not invested in this fund.");

                if (mfInvestment.CurrentValue < dto.redeemAmount)
                    throw new Exception("Redeem amount exceeds your current investment value.");

                var mfStocks = await _fundrepo.GetStocksByFundIdAsync(dto.fundId);
                if (!mfStocks.Any())
                    throw new Exception("Fund has no stock allocations.");

                // -------------------------
                // STEP 2: CONVERT AMOUNT → UNITS
                // -------------------------
                decimal unitsToSell = dto.redeemAmount / fund.NAV;
                if (unitsToSell > mfInvestment.TotalUnits)


                    throw new Exception("You do not have enough units to sell.");

                decimal remainingPending = 0m;

                // -------------------------
                // STEP 3: SELL STOCKS BASED ON ALLOCATION
                // -------------------------
                foreach (var fs in mfStocks)
                {
                    var stock = fs.Stock!;
                    decimal stockSellValue = dto.redeemAmount * (fs.AllocationPercentage / 100);

                    decimal qtyToSell = Math.Floor(stockSellValue / stock.CurrentMarketPrice);

                    if (qtyToSell <= 0)
                        continue;

                    // Cannot sell more than fund holds
                    qtyToSell = Math.Min(qtyToSell, fs.QuantityHeld);

                    decimal redeemedValue = qtyToSell * stock.CurrentMarketPrice;

                    remainingPending += stockSellValue - redeemedValue;

                    // Update fund stock quantity
                    fs.QuantityHeld -= qtyToSell;

                    // -----------------------------
                    // APPLY MARKET IMPACT
                    // -----------------------------
                    stock.VolumeTraded -= (int)qtyToSell;
                    if (stock.VolumeTraded < stock.TotalShares)
                        stock.Status = true;

                    decimal supplyFactor = (decimal)qtyToSell / stock.TotalShares;
                    decimal priceDropPercent = Math.Min(supplyFactor * 4.0m, 0.15m);

                    stock.CurrentMarketPrice -= stock.CurrentMarketPrice * priceDropPercent;
                    stock.UpdatedAt = DateTime.UtcNow;

                    await _repo.UpdateStockAsync(stock);
                    await _fundrepo.UpdateMutualFundStockAsync(fs);
                }

                // -------------------------
                // STEP 4: UPDATE FUND AUM + NAV
                // -------------------------
                fund.AUM = mfStocks.Sum(s => s.QuantityHeld * s.Stock!.CurrentMarketPrice);
                fund.TotalUnits -= unitsToSell;

                if (fund.TotalUnits <= 0)
                    fund.TotalUnits = 1; // avoid division by zero

                fund.AmountPending += remainingPending;

                fund.NAV = fund.AUM / fund.TotalUnits;

                await _fundrepo.UpdateFundAsync(fund);

                // -------------------------
                // STEP 5: UPDATE USER INVESTMENT
                // -------------------------
                mfInvestment.TotalUnits -= unitsToSell;
                mfInvestment.CurrentValue = mfInvestment.TotalUnits * fund.NAV;
                mfInvestment.ProfitLoss = mfInvestment.CurrentValue - mfInvestment.TotalInvested;
                mfInvestment.UpdatedAt = DateTime.UtcNow;

                await _fundrepo.UpdateMutualFundInvestmentAsync(mfInvestment);

                // -------------------------
                // STEP 6: CREDIT MONEY TO USER WALLET/FUND BALANCE
                // -------------------------
                invDetails.Fund += dto.redeemAmount - remainingPending;
                await _invrepo.UpdateInvestorDetailsAsync(invDetails);

                // -------------------------
                // STEP 7: ADD FUND TRANSACTION ENTRY
                // -------------------------
                var transaction = new FundTransaction
                {
                    InvestId = mfInvestment.InvestId,
                    TransactionAmount = dto.redeemAmount,
                    NAVAtTransaction = fund.NAV,
                    UnitsTransacted = unitsToSell,
                    FundTransactionType = FundTransactionType.Redemption,
                    TransactionDate = DateTime.UtcNow
                };

                await _transrepo.AddFundTransactionAsync(transaction);

                await _repo.CommitTransactionAsync();

                await _notificationService.CreateNotificationAsync(dto.investorId,"Your redeem on " + fund.FundName + " of "+dto.redeemAmount +" has been processed.");
                // -------------------------
                // STEP 8: BROADCAST CHANGES
                // -------------------------
                var stockDtos = mfStocks.Select(s => new BroadCastStockUpdDTO
                {
                    StockId = s.StockId,
                    Sector = s.Stock!.Sector,
                    CurrentMarketPrice = s.Stock!.CurrentMarketPrice,
                    TotalShares = s.Stock!.TotalShares,
                    VolumeTraded = s.Stock!.VolumeTraded,
                    UpdatedAt = s.Stock!.UpdatedAt
                }).ToList();

                var fundDto = new BroadCastFundUpdDTO
                {
                    FundId = fund.FundId,
                    FundName = fund.FundName,
                    NAV = fund.NAV,
                    AUM = fund.AUM,
                    TotalUnits = fund.TotalUnits,
                    MinInvestmentAmount = fund.MinInvestmentAmount,
                    UpdatedAt = DateTime.UtcNow
                };

                await _hub.BroadcastFundAndStocksAsync(fundDto, stockDtos);

                return true;
            }
            catch
            {
                await _repo.RollbackTransactionAsync();
                throw;
            }
        }

    }
}
