using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.Stocks;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface IStockService
    {
        //---------------Stocks -----------------
        Task<Stock> InsertIntoStock(CreateStockDTO stock);
        Task<bool> UpdateStock(UpdateStockDTO stock);

        Task<bool> DeleteStock(int id);

        Task<IEnumerable<Stock>> GetAllStocks();
        Task<Stock> GetStockById(int id);
        // ----------------- Portfolio -----------

        Task<PortFolio> InsertIntoPortfolio(CreatePortFolioDTO port);
        Task<PortFolio> UpdatePortfolio(Guid id, UpdPortFolioDTO port);
        Task<PortFolio> DeletePortfolio(int id);
        Task<IEnumerable<InvestorPortfolioDTO>> GetAllPortfolioForInvestor(Guid id);
    }
}
