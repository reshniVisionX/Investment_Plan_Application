using InvestmentPlanAPI.DTOs;
using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface IFundRepo
    {
        Task<MutualFund> CreateMutualFundAsync(MutualFund fund);
        Task AddStocksAsync(int fundId , IEnumerable<MutualFundStock> stocks);

        Task<bool> UpdateFundPlanAsync(MutualFund fund);


        Task<MutualFund> GetFundByIdAsync(int fundId);
        Task<IEnumerable<MutualFund>> GetAllFundsAsync();

        Task<MutualFundInvestment?> GetInvestmentByInvestorAndFundAsync(Guid investorId, int fundId);
        Task<MutualFundInvestment> CreateInvestmentAsync(MutualFundInvestment investment);
        Task UpdateInvestmentAsync(MutualFundInvestment investment);
        Task<IEnumerable<MutualFundInvestment>> GetFundsByInvestorIdAsync(Guid publicInvestorId);
        Task UpdateFundAsync(MutualFund fund);

        Task UpdateMutualFundStockAsync(MutualFundStock stock);

        Task UpdateMutualFundInvestmentAsync(MutualFundInvestment investment);
        Task<List<MutualFundStock>> GetStocksByFundIdAsync(int fundId);


    }
}
