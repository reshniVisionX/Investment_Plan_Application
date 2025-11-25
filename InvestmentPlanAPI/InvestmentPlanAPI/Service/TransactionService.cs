using InvestmentPlanAPI.DTOs;
using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Hubs;
using InvestmentPlanAPI.Interface;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using InvestmentPlanAPI.Models.Enums;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace InvestmentPlanAPI.Service
    {
        public class TransactionService:ITransactionService
        {
        private readonly ITransactionRepo _repo;
        private readonly IInvestorService _invser;
        private readonly ILogger<TransactionService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly IInvestorRepo _investorRepo;
        private readonly IFundRepo _fundRepo;
        private readonly IFundRepo _investmentRepo;
        private readonly ITransactionRepo _fundTransactionRepo;
        private readonly INotificationService _notificationService;
        private readonly HubBroadCastService _broadcastService;

        public TransactionService(ITransactionRepo repo, ILogger<TransactionService> logger, IInvestorService _inv, INotificationService notificationService, IHubContext<NotificationHub> hubContext, IInvestorRepo investorRepo, IFundRepo fundRepo, IFundRepo investmentRepo, ITransactionRepo fundTransactionRepo, HubBroadCastService broadcastService)  
            {
                _repo = repo;
                _logger = logger;
                _invser = _inv;
                _hubContext = hubContext;
            _investorRepo = investorRepo;
            _fundRepo = fundRepo;
            _investmentRepo = investmentRepo;
            _fundTransactionRepo = fundTransactionRepo;
            _notificationService = notificationService;
            _broadcastService = broadcastService;
        }

        public async Task<string> HandleTransactionAsync(TransactionRequestDTO dto)
        {
            await _repo.BeginTransactionAsync();
            try
            {
                var investor = await _invser.GetInvestorById(dto.PublicInvestorId);
                if (investor == null)
                    throw new Exception("Investor doesn't exist");

                if (investor.Status == UserStatus.Inactive)
                    throw new Exception("Investor is not active");

                if (investor.VerificationStatus != VerificationStatus.Verified)
                    throw new Exception("Investor is not verified");

                if (dto.Quantity > 10000)
                    throw new Exception("You can buy more than 10000 quantity at a time");
                

                // 🔹 1. Fetch and validate stock
                var stock = await _repo.GetStockByIdAsync(dto.StockId);
                if (stock == null)
                    throw new Exception("Stock not found.");

                // 🔹 2. Fetch existing portfolio record for the investor and stock
                var portfolio = await _repo.GetPortfolioByInvestorAndStockAsync(dto.PublicInvestorId, dto.StockId);

                // 🔹 3. Prepare a new transaction record
                var cur_price = stock.CurrentMarketPrice;
                var tot_price = cur_price * dto.Quantity;

                var transaction = new InvestorsTransactions
                {
                    PublicInvestorId = dto.PublicInvestorId,
                    StockId = dto.StockId,
                    TransactionType = dto.TransactionType,
                    Price = cur_price,
                    Quantity = dto.Quantity,
                    TotalValue = tot_price,
                    TransactionDate = DateTime.UtcNow
                };

                // =====================================================================
                // 🔹 BUY LOGIC
                // =====================================================================
                if (dto.TransactionType == TransactionType.BUY)
                {
                    if (investor.InvestorDetail.Fund < (dto.Quantity * stock.CurrentMarketPrice))
                        throw new Exception("You don't enough fund to buy.");
                    if(stock.VolumeTraded == stock.TotalShares)
                    {
                        throw new Exception("Stock has no volume left to buy");
                    }
                    // ✅ Stock availability check
                    if (!stock.Status)
                        throw new Exception("Stock is no longer approved for buying");

                    // ✅ Check if enough shares are left to buy
                    int remaining = stock.TotalShares - (int)stock.VolumeTraded;
                    if (dto.Quantity > remaining)
                        throw new Exception($"Only {remaining} shares left to buy");

                    // ✅ Update or create portfolio entry
                    if (portfolio == null)
                    {
                        portfolio = new PortFolio
                        {
                            PublicInvestorId = dto.PublicInvestorId,
                            StockId = dto.StockId,
                            Quantity = dto.Quantity,
                            TotalShares = dto.Quantity,
                            AvgBuyPrice = cur_price,
                            BoughtAt = DateTime.UtcNow
                        };
                        _logger.LogInformation($" New stock added to portfolio for Investor {dto.PublicInvestorId}. Bought {dto.Quantity} shares of {stock.StockSymbol} at ₹{cur_price} each.");
                    }
                    else
                    {
                        // Weighted average for AvgBuyPrice when adding more shares
                        var totalCostBefore = portfolio.AvgBuyPrice * portfolio.Quantity;
                        var newCost = cur_price * dto.Quantity;
                        var totalQty = portfolio.Quantity + dto.Quantity;

                        portfolio.AvgBuyPrice = (totalCostBefore + newCost) / totalQty;
                        portfolio.Quantity = totalQty;
                        portfolio.TotalShares = totalQty;
                        portfolio.BoughtAt = DateTime.UtcNow;
                        _logger.LogInformation($"🟢 Investor {dto.PublicInvestorId} bought {dto.Quantity} more shares of {stock.StockSymbol}. New total quantity: {portfolio.Quantity}.");
                    }

                    // ✅ Deduct funds from investor
                    investor.InvestorDetail.Fund -= tot_price;
                    await _repo.UpdateInvestorFundAsync(investor.PublicInvestorId, investor.InvestorDetail.Fund);
                    _logger.LogInformation($"💸 Deducted ₹{tot_price} from Investor {dto.PublicInvestorId}. Remaining Fund: ₹{investor.InvestorDetail.Fund:F2}");

                    // ✅ Update traded volume
                    stock.VolumeTraded += dto.Quantity;

                    if (stock.VolumeTraded >= stock.TotalShares)
                        stock.Status = false;

                    // ✅ Demand-based price adjustment
                    decimal demandFactor = (decimal)dto.Quantity / stock.TotalShares;
                    decimal priceIncreasePercent = Math.Min(demandFactor * 2.0m, 0.10m);
                    stock.CurrentMarketPrice += stock.CurrentMarketPrice * priceIncreasePercent;


                    _logger.LogInformation($"📈 Investor {dto.PublicInvestorId} bought {dto.Quantity} shares of {stock.StockSymbol}. Price increased by {priceIncreasePercent:P}. New price: ₹{stock.CurrentMarketPrice:F2}");
                }

                // =====================================================================
                // 🔹 SELL LOGIC
                // =====================================================================
                else if (dto.TransactionType == TransactionType.SELL)
                {
                    if (portfolio == null || dto.Quantity > portfolio.Quantity)
                        throw new Exception("You do not own enough shares to sell");

                    // ✅ Reduce portfolio quantity
                    portfolio.Quantity -= dto.Quantity;
                    portfolio.TotalShares = portfolio.Quantity;

                    // ✅ Add funds
                    investor.InvestorDetail.Fund += tot_price;
                    await _repo.UpdateInvestorFundAsync(investor.PublicInvestorId, investor.InvestorDetail.Fund);
                    _logger.LogInformation($"💰 Added ₹{tot_price} to Investor {dto.PublicInvestorId} after selling. New Fund Balance: ₹{investor.InvestorDetail.Fund:F2}");

                    // ✅ Update stock volume
                    stock.VolumeTraded -= dto.Quantity;
                    if (stock.VolumeTraded < stock.TotalShares)
                        stock.Status = true;

                    // ✅ Supply-based price adjustment
                    decimal supplyFactor = (decimal)dto.Quantity / stock.TotalShares;
                    decimal priceDropPercent = Math.Min(supplyFactor * 4.0m, 0.15m);
                    stock.CurrentMarketPrice -= stock.CurrentMarketPrice * priceDropPercent;


                    _logger.LogInformation($"🔴 Investor {dto.PublicInvestorId} sold {dto.Quantity} shares of {stock.StockSymbol}. Price dropped by {priceDropPercent:P}. New price: ₹{stock.CurrentMarketPrice:F2}");

                    // ✅ If quantity is now 0, delete portfolio safely
                    if (portfolio.Quantity <= 0)
                    {
                        await _repo.DeletePortfolioAsync(portfolio.PortfolioId);
                        _logger.LogInformation($"🗑️ All shares of {stock.StockSymbol} sold. Portfolio entry removed for Investor {dto.PublicInvestorId}.");
                        portfolio = null; // Important: prevent EF from re-updating a deleted entity later
                    }
                }

                // =====================================================================
                // 🔹 Portfolio Metrics Update
                // =====================================================================
                if (portfolio != null)
                {
                    portfolio.CurrentValue = portfolio.Quantity * stock.CurrentMarketPrice;
                    portfolio.ProfitLoss = (stock.CurrentMarketPrice - portfolio.AvgBuyPrice) * portfolio.Quantity;

                    if (portfolio.ProfitLoss > 0)
                        _logger.LogInformation($"✅ Portfolio Profit: +₹{portfolio.ProfitLoss:F2} for {stock.StockSymbol}");
                    else if (portfolio.ProfitLoss < 0)
                        _logger.LogWarning($"⚠️ Portfolio Loss: ₹{portfolio.ProfitLoss:F2} for {stock.StockSymbol}");
                    else
                        _logger.LogInformation($"ℹ️ No profit/loss for {stock.StockSymbol} (breakeven).");

                    await _repo.UpdatePortfolioAsync(portfolio);
                }

                // Update stock timestamp
                stock.UpdatedAt = DateTime.UtcNow;

                // =====================================================================
                // 🔹 Commit all DB changes (Transaction, Portfolio, Stock)
                // =====================================================================
                await _repo.AddTransactionAsync(transaction);
                await _repo.UpdateStockAsync(stock);

                await _repo.CommitTransactionAsync();
                _logger.LogInformation($"✅ Transaction completed successfully for Investor {dto.PublicInvestorId} on {stock.StockSymbol}.");

                // 🔹 Broadcast stock update via SignalR
                await _broadcastService.BroadcastStockAsync(new BroadCastStockUpdDTO
                {
                    StockId = stock.StockId,
                    Sector = stock.Sector,
                    CurrentMarketPrice = stock.CurrentMarketPrice,
                    TotalShares = stock.TotalShares,
                    VolumeTraded = stock.VolumeTraded,
                    UpdatedAt = stock.UpdatedAt
                });


                await _notificationService.CreateNotificationAsync(
                    dto.PublicInvestorId,
                    $"You successfully completed a {dto.TransactionType} for {stock.StockSymbol} at market price {stock.CurrentMarketPrice:F2} of qty: {dto.Quantity}."
                );

                _logger.LogInformation($"📢 Stock Update Broadcasted to [Stock-{stock.StockId}] Group.");

                return "Transaction successful";
            }
            catch (Exception ex)
            {
                await _repo.RollbackTransactionAsync();
                _logger.LogError($"❌ Transaction failed for Investor {dto.PublicInvestorId}: {ex.Message}");
                throw new Exception($"Transaction failed: {ex.Message}");
            }
        }

        public async Task<IEnumerable<InvestorsTransactions>> GetAllTransactionsAsync()
        {
            return await _repo.GetAllTransactionsAsync();
        }

        public async Task<IEnumerable<StockTransactionsResponseDTO>> GetStockTransactionsByInvestorAsync(Guid investorId)
        {
            var transactions = await _repo.GetTransactionsByInvestorIdAsync(investorId);

            var response = transactions.Select(t => new StockTransactionsResponseDTO
            {
                TransactionId=t.TransactionId,
                StockSymbol = t.Stock?.StockSymbol ?? "N/A",
                TransactionType = t.TransactionType,
                Price = t.Price,
                TotalValue = t.TotalValue,
                Quantity = t.Quantity,
                TransactionDate = t.TransactionDate
            }).ToList();

            _logger.LogInformation("✅ Mapped {Count} stock transactions for InvestorId: {InvestorId}", response.Count, investorId);
            return response;
        }



        public async Task<bool> InvestorsFundPurchase(FundInvestDTO dto)
        {
            _logger.LogInformation("🎯 [START] Investor Fund Purchase initiated for InvestorId: {InvestorId}, FundId: {FundId}, Amount: {Amount}",
                dto.PublicInvestorId, dto.FundId, dto.TransactionAmount);

            try
            {
                // 1️⃣ Validate Investor
                var investor = await _investorRepo.GetInvestorById(dto.PublicInvestorId);
                if (investor == null)
                {
                    _logger.LogWarning("❌ Investor not found: {InvestorId}", dto.PublicInvestorId);
                    throw new KeyNotFoundException("Investor not found.");
                }

                if (investor.VerificationStatus != VerificationStatus.Verified)
                {
                    _logger.LogWarning("⚠️ Investor not approved: {InvestorId}", dto.PublicInvestorId);
                    throw new InvalidOperationException("Investor is not approved to invest.");
                }

                if (investor.InvestorDetail == null)
                {
                    _logger.LogError("🚫 Investor details missing for {InvestorId}", dto.PublicInvestorId);
                    throw new InvalidOperationException("Investor details (wallet) not found.");
                }

                if (investor.InvestorDetail.Fund < dto.TransactionAmount)
                {
                    _logger.LogWarning("💰 Insufficient wallet balance. Available: {Available}, Required: {Required}",
                        investor.InvestorDetail.Fund, dto.TransactionAmount);
                    throw new InvalidOperationException("Insufficient wallet balance to make this purchase.");
                }

                // 2️⃣ Validate Mutual Fund
                var fund = await _fundRepo.GetFundByIdAsync(dto.FundId);
                if (fund == null)
                {
                    _logger.LogWarning("❌ Mutual fund not found: {FundId}", dto.FundId);
                    throw new KeyNotFoundException("Mutual fund not found.");
                }

                if (fund.Status != VerificationStatus.Verified)
                {
                    _logger.LogWarning("⚠️ Fund not approved for investment: {FundName}", fund.FundName);
                    throw new InvalidOperationException("Mutual fund is not approved for investment.");
                }

                if (dto.TransactionAmount < fund.MinInvestmentAmount)
                {
                    _logger.LogWarning("⚠️ Investment below minimum requirement. Required: {Min}, Given: {Amount}",
                        fund.MinInvestmentAmount, dto.TransactionAmount);
                    throw new ArgumentException($"Minimum investment amount is {fund.MinInvestmentAmount}.");
                }

                if (fund.NAV <= 0)
                {
                    _logger.LogError("📉 Invalid NAV for Fund: {FundName}, NAV: {NAV}", fund.FundName, fund.NAV);
                    throw new InvalidOperationException("Invalid NAV value for this fund.");
                }

                // 3️⃣ Compute units
                var nav = fund.NAV;
                var unitsPurchased = Math.Round(dto.TransactionAmount / nav, 4);
                _logger.LogInformation("📊 Computed Units: {Units} for Amount: {Amount} at NAV: {NAV}",
                    unitsPurchased, dto.TransactionAmount, nav);

                // 4️⃣ Fetch existing investment if any
                var existingInvestment = await _investmentRepo.GetInvestmentByInvestorAndFundAsync(dto.PublicInvestorId, dto.FundId);
                if (existingInvestment == null)
                {
                    _logger.LogInformation("🆕 New investment. Creating entry for investor {InvestorId} in fund {FundName}.",
                        dto.PublicInvestorId, fund.FundName);
                }
                else
                {
                    _logger.LogInformation("🔁 Existing investment found (InvestId: {InvestId}). Updating totals.",
                        existingInvestment.InvestId);
                }

                // 5️⃣ Create transaction record
                var transaction = new FundTransaction
                {
                    InvestId = existingInvestment?.InvestId ?? 0, // Repo will handle if new
                    TransactionAmount = dto.TransactionAmount,
                    NAVAtTransaction = nav,
                    UnitsTransacted = unitsPurchased,
                    FundTransactionType = FundTransactionType.Purchase,
                    TransactionDate = DateTime.UtcNow
                };

                _logger.LogInformation("🧾 Transaction object prepared for InvestorId: {InvestorId}, FundId: {FundId}, Amount: {Amount}",
                    dto.PublicInvestorId, dto.FundId, dto.TransactionAmount);

                // 6️⃣ Perform DB operation atomically
                var success = await _fundTransactionRepo.PerformFundPurchaseAsync(investor, fund, existingInvestment, transaction);

                if (success)
                {
                    _logger.LogInformation("✅ Investment transaction completed successfully for InvestorId: {InvestorId}, FundId: {FundId}. Amount: {Amount}",
                        dto.PublicInvestorId, dto.FundId, dto.TransactionAmount);

                    var fundUpdateDto = new BroadCastFundUpdDTO
                    {
                        FundId = fund.FundId,
                        FundName = fund.FundName,
                        NAV = fund.NAV,
                        MinInvestmentAmount = fund.MinInvestmentAmount,
                        UpdatedAt = DateTime.UtcNow
                    };

                    // Broadcast to all subscribed investors
                    await _hubContext.Clients.Group($"Fund-{fund.FundId}")
                        .SendAsync("FundUpdated", fundUpdateDto);
                    _logger.LogInformation($"💹 Broadcasted Fund Update for [Fund-{fund.FundId}].");

                    await _notificationService.CreateNotificationAsync(
                   dto.PublicInvestorId,
                $"Your Investment on {fund.FundName} is successful at {fund.NAV:F2} ."
               );

                }
                else
                {
                    _logger.LogWarning("⚠️ Transaction repo returned false for InvestorId: {InvestorId}, FundId: {FundId}.", dto.PublicInvestorId, dto.FundId);
                }

                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Exception during Fund Purchase for InvestorId: {InvestorId}, FundId: {FundId}", dto.PublicInvestorId, dto.FundId);
                throw; // Let middleware handle it
            }
            finally
            {
                _logger.LogInformation("🏁 [END] Fund Purchase operation for InvestorId: {InvestorId}, FundId: {FundId}", dto.PublicInvestorId, dto.FundId);
            }
        }
        public async Task<IEnumerable<FundTransaction>> FetchAllFundTransactionAsync()
        {
            

            var transactions = await _fundTransactionRepo.FetchAllFundTransactionsAsync();

            if (transactions == null || !transactions.Any())
            {
                
                throw new KeyNotFoundException("No fund transactions found.");
            }

         
            return transactions;
        }

        public async Task<IEnumerable<FundTransactionResponseDTO>> GetFundTransactionsByInvestorAsync(Guid investorId)
        {
            var transactions = await _repo.FetchFundTransactionsByInvestorIdAsync(investorId);

            var response = transactions.Select(t => new FundTransactionResponseDTO
            {
                TransactionId = t.TransactionId,
                FundName = t.MutualFundInvestment?.MutualFund?.FundName ?? "N/A",
                TransactionAmount = t.TransactionAmount,
                NAVAtTransaction = t.NAVAtTransaction,
                UnitsTransacted = t.UnitsTransacted,
                FundTransactionType = t.FundTransactionType,
                TransactionDate = t.TransactionDate
            }).ToList();

            _logger.LogInformation("✅ Mapped {Count} fund transactions for InvestorId: {InvestorId}", response.Count, investorId);
            return response;
        }


    }
}
