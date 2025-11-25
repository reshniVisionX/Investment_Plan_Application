using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Repository
{
    public class FundRepository : IFundRepo
    {
        private readonly DBContext _context;

        public FundRepository(DBContext context)
        {
            _context = context;
        }

        public async Task<MutualFund> CreateMutualFundAsync(MutualFund fund)
        {
            await _context.MutualFunds.AddAsync(fund);
            await _context.SaveChangesAsync();
            return fund;
        }

        public async Task AddStocksAsync(int fundId, IEnumerable<MutualFundStock> stocks)
        {
            foreach (var stock in stocks)
            {
                stock.FundId = fundId; // ensure foreign key is set
            }

            await _context.MutualFundStocks.AddRangeAsync(stocks);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateFundPlanAsync(MutualFund updatedFund)
        {
            var existingFund = await _context.MutualFunds
                .FirstOrDefaultAsync(f => f.FundId == updatedFund.FundId);

            if (existingFund == null)
                return false;

            _context.Entry(existingFund).CurrentValues.SetValues(updatedFund);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MutualFund> GetFundByIdAsync(int fundId)
        {
            return await _context.MutualFunds
                .Include(f => f.MutualFundStocks)
                .ThenInclude(s => s.Stock)
                .FirstOrDefaultAsync(f => f.FundId == fundId);
        }
        public async Task<List<MutualFundStock>> GetStocksByFundIdAsync(int fundId)
        {
            return await _context.MutualFundStocks
                .Include(s => s.Stock) // include Stock details
                .Where(s => s.FundId == fundId)
                .ToListAsync();
        }


        public async Task<IEnumerable<MutualFund>> GetAllFundsAsync()
        {
            return await _context.MutualFunds
                .Include(f => f.MutualFundStocks)
                .ThenInclude(s => s.Stock)
                .ToListAsync();
        }
        public async Task<MutualFundInvestment?> GetInvestmentByInvestorAndFundAsync(Guid investorId, int fundId)
        {
            return await _context.MutualFundInvestments
                .FirstOrDefaultAsync(i => i.PublicInvestorId == investorId && i.FundId == fundId);
        }

        public async Task<MutualFundInvestment> CreateInvestmentAsync(MutualFundInvestment investment)
        {
            await _context.MutualFundInvestments.AddAsync(investment);
            await _context.SaveChangesAsync();
            return investment;
        }

        public async Task UpdateInvestmentAsync(MutualFundInvestment investment)
        {
            _context.MutualFundInvestments.Update(investment);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<MutualFundInvestment>> GetFundsByInvestorIdAsync(Guid publicInvestorId)
        {
          

            var investments = await _context.MutualFundInvestments
                .Include(i => i.MutualFund)
                .Where(i => i.PublicInvestorId == publicInvestorId)
                .ToListAsync();

            return investments;
        }
        public async Task UpdateFundAsync(MutualFund fund)
        {
            _context.MutualFunds.Update(fund);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMutualFundStockAsync(MutualFundStock stock)
        {
            _context.MutualFundStocks.Update(stock);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateMutualFundInvestmentAsync(MutualFundInvestment investment)
        {
            _context.MutualFundInvestments.Update(investment);
            await _context.SaveChangesAsync();
        }
    }
}
