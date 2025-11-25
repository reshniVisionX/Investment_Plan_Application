using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface IManagerRepo
    {
        // ------------ Transaction Control ------------
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();

        // ------------ Fund Operations ------------
        Task<MutualFund?> GetFundByIdAsync(int fundId);
        Task<IEnumerable<MutualFund>> GetAllFundsAsync();
        Task UpdateFundAsync(MutualFund fund);

        // ------------ Stocks ------------
        Task<IEnumerable<MutualFundStock>> GetStocksByFundIdAsync(int fundId);
        Task<Stock?> GetStockByIdAsync(int stockId);
        Task UpdateStockAsync(Stock stock);

        // ------------ Mutual Fund Investments ------------
        Task<IEnumerable<MutualFundInvestment>> GetInvestmentsByFundIdAsync(int fundId);
        Task UpdateMutualFundInvestmentAsync(MutualFundInvestment investment);


        Task<IEnumerable<MutualFund>> GetAllFundsWithAllDataAsync();

    }
}
