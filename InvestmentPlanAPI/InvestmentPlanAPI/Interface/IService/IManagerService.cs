using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.ManagerDTO;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface IManagerService
    {
        Task<bool> SettleFundAsync(int fundID);
        Task<IEnumerable<AllFundReportsDTO>> GetAllFundReportsAsync();

        Task<bool> RedeemInvestorFundAsync(RedeemFundDTO dto);
        
        }
}
