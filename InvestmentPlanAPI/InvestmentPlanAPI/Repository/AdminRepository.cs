using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Repository
{
    public class AdminRepository : IAdminRepo
    {
        private readonly DBContext _context;

        public AdminRepository(DBContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Investor>> GetAllUnverifiedInvestorsAsync()
        {
            return await _context.Investors
                .Include(i => i.InvestorDetail)
                .Where(i => i.VerificationStatus == VerificationStatus.Pending && i.RoleId == 2)
                .ToListAsync();
        }


        public async Task<IEnumerable<MutualFund>> GetAllUnverifiedFundsAsync()
        {
            return await _context.MutualFunds
                .Where(f => f.Status == VerificationStatus.Pending)
                .ToListAsync();
        }

        public async Task<bool> ToggleUserStatus(Guid id, VerificationStatus status)
        {
            var user = await _context.Investors.FirstOrDefaultAsync(i => i.PublicInvestorId == id);
            if (user == null) return false;

            user.VerificationStatus = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MutualFund> UpdateFundStatus(int fundId, VerificationStatus status)
        {
            var fund = await _context.MutualFunds.FindAsync(fundId);
            if (fund == null) return null;

            fund.Status = status;
            await _context.SaveChangesAsync();
            return fund;
        }

    }
}
