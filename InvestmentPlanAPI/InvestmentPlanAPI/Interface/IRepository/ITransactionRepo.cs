using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface ITransactionRepo
    {
        Task<Stock> GetStockByIdAsync(int stockId);
        Task<PortFolio> GetPortfolioByInvestorAndStockAsync(Guid investorId, int stockId);
        Task<bool> UpdateStockAsync(Stock stock);
        Task<bool> UpdatePortfolioAsync(PortFolio portfolio);
        Task<bool> AddTransactionAsync(InvestorsTransactions transaction);
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync(); 
        Task<IEnumerable<InvestorsTransactions>>GetAllTransactionsAsync();
        Task<IEnumerable<InvestorsTransactions>> GetTransactionsByInvestorIdAsync(Guid investorId);

        Task CreateFundTransactionAsync(FundTransaction transaction);
        Task<bool> PerformFundPurchaseAsync(Investor investor, MutualFund fund, MutualFundInvestment investment, FundTransaction transaction);


        Task<IEnumerable<FundTransaction>> FetchAllFundTransactionsAsync();
        Task<IEnumerable<FundTransaction>> FetchFundTransactionsByInvestorIdAsync(Guid investorId);
        Task UpdateInvestorFundAsync(Guid publicInvestorId, decimal newFund);

        Task DeletePortfolioAsync(int id);

        Task AddFundTransactionAsync(FundTransaction txn);
       


    }
}
