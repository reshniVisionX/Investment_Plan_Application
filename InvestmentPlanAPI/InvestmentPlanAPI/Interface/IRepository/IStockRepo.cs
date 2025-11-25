using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface IStockRepo
    {
        //---------------Stocks -----------------
        Task<Stock> InsertIntoStock(Stock stock);
        Task<bool> UpdateStock(Stock stock);

        Task<bool> DeleteStock(int id);

        Task<IEnumerable<Stock>> GetAllStocks();
        Task<Stock> GetStockById(int id);
        // ----------------- Portfolio -----------

        Task<PortFolio> InsertIntoPortfolio(PortFolio port);
        Task<PortFolio> UpdatePortfolio(Guid id,PortFolio port);
        Task<PortFolio> DeletePortfolio(int id);
        Task<IEnumerable<PortFolio>> GetAllPortfolioForInvestor(Guid id); 

    }
}
