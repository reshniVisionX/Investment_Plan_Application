using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using System.Text.Json;

namespace InvestmentPlanAPI.Service
{
    public class FundsService : IFundService
    {
        private readonly IFundRepo _fundRepo;
        private readonly IStockRepo _Stockrepo;

       
        public FundsService(IFundRepo fundRepo, IStockRepo _repo)
        {
            _fundRepo = fundRepo;
            _Stockrepo = _repo;
        }

        public async Task<bool> CreateFundPlanAsync(CreateFundPlanDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (string.IsNullOrWhiteSpace(dto.FundName))
                throw new ArgumentException("Fund name is required.");

            // ✅ Deserialize stocks JSON from string
            var stockList = string.IsNullOrWhiteSpace(dto.Stocks)
       ? new List<MutualFundCreateStockDTO>()
       : JsonSerializer.Deserialize<List<MutualFundCreateStockDTO>>(dto.Stocks,
           new JsonSerializerOptions
           {
               PropertyNameCaseInsensitive = true,
               NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString// converts "80" to 80
           });
            Console.WriteLine("Raw Stocks JSON: " + dto.Stocks);
            Console.WriteLine("Parsed Stocks: " + JsonSerializer.Serialize(stockList));


            if (stockList == null || !stockList.Any())
                throw new ArgumentException("At least one stock must be provided.");

            if (stockList.Any(s => s.AllocationPercentage < 10))
                throw new ArgumentException("Each stock allocation percentage must be at least 10%.");

            if (stockList.GroupBy(s => s.StockId).Any(g => g.Count() > 1))
                throw new ArgumentException("Duplicate stocks are not allowed.");

            decimal totalAllocation = stockList.Sum(s => s.AllocationPercentage);
            if (totalAllocation > 100)
                throw new ArgumentException("Total allocation percentage cannot exceed 100%.");

            // ✅ Build fund entity
            var fund = new MutualFund
            {
                FundName = dto.FundName,
                Description = dto.Description,
                ExpenseRatio = dto.ExpenseRatio,
                AUM = dto.AUM,
                NAV = dto.NAV,
                TotalUnits = dto.TotalUnits,
                MinInvestmentAmount = dto.MinInvestmentAmount,
                AnnualReturnRate = dto.AnnualReturnRate,
                CreatedAt = DateTime.UtcNow,
                Status = VerificationStatus.Pending
            };

            // ✅ Convert uploaded logo
            if (dto.Logo != null && dto.Logo.Length > 0)
            {
                using var ms = new MemoryStream();
                await dto.Logo.CopyToAsync(ms);
                fund.Logo = ms.ToArray();
            }

            // ✅ Save to DB
            var createdFund = await _fundRepo.CreateMutualFundAsync(fund);

            var stockEntities = stockList.Select(s => new MutualFundStock
            {
                FundId = createdFund.FundId,
                StockId = s.StockId,
                AllocationPercentage = s.AllocationPercentage
            }).ToList();

            await _fundRepo.AddStocksAsync(createdFund.FundId, stockEntities);

            return true;
        }

        public async Task<bool> UpdateFundPlanAsync(UpdateFundPlanDTO dto)
        {
            var existingFund = await _fundRepo.GetFundByIdAsync(dto.FundId);
            if (existingFund == null)
                throw new KeyNotFoundException($"Fund with ID {dto.FundId} not found.");



            // Update only allowed fields, retain everything else
            existingFund.ExpenseRatio = dto.ExpenseRatio ?? existingFund.ExpenseRatio;
            existingFund.AUM = dto.AUM ?? existingFund.AUM;
            existingFund.NAV = dto.NAV ?? existingFund.NAV;
            existingFund.TotalUnits = dto.TotalUnits ?? existingFund.TotalUnits;
            existingFund.MinInvestmentAmount = dto.MinInvestmentAmount ?? existingFund.MinInvestmentAmount;
            existingFund.AnnualReturnRate = dto.AnnualReturnRate ?? existingFund.AnnualReturnRate;
            existingFund.AmountReceived = dto.AmountReceived ?? existingFund.AmountReceived;
            existingFund.AmountPending = dto.AmountPending ?? existingFund.AmountPending;
            var result = await _fundRepo.UpdateFundPlanAsync(existingFund);
            return result;
        }

 
        public async Task<MutualFund> GetFundByIdAsync(int fundId)
        {
            return await _fundRepo.GetFundByIdAsync(fundId);
        }

        public async Task<IEnumerable<MutualFund>> GetAllFundsAsync()
        {
            return await _fundRepo.GetAllFundsAsync();
        }

        public async Task<IEnumerable<FundsOfInvestorDTO>> GetFundsByInvestorIdAsync(Guid publicInvestorId)
        {
            var investments = await _fundRepo.GetFundsByInvestorIdAsync(publicInvestorId);


            var result = investments.Select(i => new FundsOfInvestorDTO
            {
                InvestId = i.InvestId,
                FundId = i.MutualFund.FundId,
                FundName = i.MutualFund.FundName,
                NAV = i.MutualFund?.NAV ?? 0,
                TotalInvested = i.TotalInvested,
                CurrentValue = i.CurrentValue,
                ProfitLoss = i.ProfitLoss,
                StartDate = i.StartDate,
                UpdatedAt = i.UpdatedAt
            }).ToList();


            return result;
        }
    }
}
