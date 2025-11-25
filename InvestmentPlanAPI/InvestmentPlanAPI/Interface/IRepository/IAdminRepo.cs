using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface IAdminRepo
    {
        Task<IEnumerable<Investor>> GetAllUnverifiedInvestorsAsync();
        Task<IEnumerable<MutualFund>> GetAllUnverifiedFundsAsync();
        Task<bool> ToggleUserStatus(Guid id, VerificationStatus status);
        Task<MutualFund> UpdateFundStatus(int fundId, VerificationStatus status);

    }
}
