using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Service
{
    public class AdminService: IAdminService
    {
        private readonly IAdminRepo _adminRepo;

        public AdminService(IAdminRepo adminRepo)
        {
            _adminRepo = adminRepo;
        }


        public async Task<IEnumerable<Investor>> FetchAllUnverifiedInvestors()
        {
            return await _adminRepo.GetAllUnverifiedInvestorsAsync();
        }

        public async Task<IEnumerable<MutualFund>> FetchAllUnverifiedFunds()
        {
            return await _adminRepo.GetAllUnverifiedFundsAsync();
        }

        public async Task<bool> ToggleUserStatus(Guid id, VerificationStatus status)
        {
            return await _adminRepo.ToggleUserStatus(id, status);
        }
        public async Task<MutualFund> UpdateStatus(int fundId, VerificationStatus status)
        {
            return await _adminRepo.UpdateFundStatus(fundId, status);
        }
    }
}
