using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface IAdminService
    {

        Task<IEnumerable<Investor>> FetchAllUnverifiedInvestors();
        Task<IEnumerable<MutualFund>> FetchAllUnverifiedFunds();
        Task<bool> ToggleUserStatus(Guid id, VerificationStatus status);
        Task<MutualFund> UpdateStatus(int fundId, VerificationStatus status);
    }
}
