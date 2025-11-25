using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface ITransactionService
    {
        Task<string> HandleTransactionAsync(TransactionRequestDTO dto);
        Task<IEnumerable<InvestorsTransactions>> GetAllTransactionsAsync();
        Task<IEnumerable<StockTransactionsResponseDTO>> GetStockTransactionsByInvestorAsync(Guid investorId);
        Task<bool> InvestorsFundPurchase(FundInvestDTO dto);

        Task<IEnumerable<FundTransaction>> FetchAllFundTransactionAsync();
        Task<IEnumerable<FundTransactionResponseDTO>> GetFundTransactionsByInvestorAsync(Guid investorId);

    }
}
