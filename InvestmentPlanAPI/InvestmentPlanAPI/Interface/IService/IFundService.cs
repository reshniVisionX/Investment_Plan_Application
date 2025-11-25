using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface IFundService
    {
        Task<bool> CreateFundPlanAsync(CreateFundPlanDTO createFundPlanDTO);

        Task<bool> UpdateFundPlanAsync(UpdateFundPlanDTO updateFundPlanDTO);

        Task<MutualFund> GetFundByIdAsync(int fundId);
        Task<IEnumerable<MutualFund>> GetAllFundsAsync();
        Task<IEnumerable<FundsOfInvestorDTO>> GetFundsByInvestorIdAsync(Guid publicInvestorId);

    }
}
