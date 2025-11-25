using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Service
{
    public class StocksService : IStockService
    {
        private readonly IStockRepo _repo;

        public StocksService(IStockRepo repo)
        {
            _repo = repo;
        }

        //---------------- STOCK ------------------
        public async Task<Stock> InsertIntoStock(CreateStockDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.StockSymbol))
                throw new ArgumentException("Stock symbol cannot be empty");

            if (dto.BasePrice <= 0)
                throw new ArgumentException("Base price must be greater than zero");

            var stock = new Stock
            {
                StockSymbol = dto.StockSymbol.ToUpper(),
                CompanyName = dto.CompanyName,
                Sector = dto.Sector,
                BasePrice = dto.BasePrice,
                CurrentMarketPrice = dto.CurrentMarketPrice,
                TotalShares = dto.TotalShares,
                VolumeTraded = dto.VolumeTraded ?? 0,
                ListedDate = dto.ListedDate
            };

            return await _repo.InsertIntoStock(stock);
        }

        public async Task<bool> UpdateStock(UpdateStockDTO dto)
        {
            var stock = await _repo.GetStockById(dto.StockId);
            if (stock == null)
                throw new KeyNotFoundException("Stock not found");

            if (dto.CompanyName != null)
                stock.CompanyName = dto.CompanyName;
            if (dto.Sector.HasValue)
                stock.Sector = dto.Sector.Value;
            if (dto.BasePrice.HasValue && dto.BasePrice > 0)
                stock.BasePrice = dto.BasePrice.Value;
            if (dto.TotalShares.HasValue && dto.TotalShares > 0)
                stock.TotalShares = dto.TotalShares.Value;
            stock.UpdatedAt = DateTime.UtcNow;
            return await _repo.UpdateStock(stock);
        }

        public async Task<bool> DeleteStock(int id)
        {
            var stock = await _repo.GetStockById(id);
            if (stock == null)
                throw new KeyNotFoundException("Stock not found");

            return await _repo.DeleteStock(id);
        }

        public async Task<IEnumerable<Stock>> GetAllStocks() => await _repo.GetAllStocks();

        public async Task<Stock> GetStockById(int id)
        {
            var stock = await _repo.GetStockById(id);
            if (stock == null)
                throw new KeyNotFoundException("Stock not found");
            return stock;
        }

        //---------------- PORTFOLIO ------------------
        public async Task<PortFolio> InsertIntoPortfolio(CreatePortFolioDTO dto)
        {
            if (dto.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0");

            var port = new PortFolio
            {
                PublicInvestorId = dto.PublicInvestorId,
                StockId = dto.StockId,
                Quantity = dto.Quantity,
                TotalShares = dto.TotalShares,
                AvgBuyPrice = dto.AvgBuyPrice,
                CurrentValue = dto.CurrentValue ?? 0,
                ProfitLoss = dto.ProfitLoss ?? 0
            };

            return await _repo.InsertIntoPortfolio(port);
        }

        public async Task<PortFolio> UpdatePortfolio(Guid id, UpdPortFolioDTO dto)
        {
            // Step 1: Fetch existing portfolio from DB
            var existingPort = (await _repo.GetAllPortfolioForInvestor(id))
                .FirstOrDefault(p => p.PortfolioId == dto.PortfolioId);

            if (existingPort == null)
                throw new KeyNotFoundException("Portfolio not found");

            // Step 2: Update only provided fields
            if (dto.StockId != 0)
                existingPort.StockId = dto.StockId;

            if (dto.Quantity.HasValue)
                existingPort.Quantity = dto.Quantity.Value;

            if (dto.TotalShares.HasValue)
                existingPort.TotalShares = dto.TotalShares.Value;

            if (dto.AvgBuyPrice.HasValue)
                existingPort.AvgBuyPrice = dto.AvgBuyPrice.Value;

            if (dto.BoughtAt.HasValue)
                existingPort.BoughtAt = dto.BoughtAt.Value;

            // Step 3: Save updated record
            var updated = await _repo.UpdatePortfolio(id, existingPort);

            if (updated == null)
                throw new Exception("Failed to update portfolio");

            return updated;
        }


        public async Task<PortFolio> DeletePortfolio(int id)
        {
            var result = await _repo.DeletePortfolio(id);
            if (result == null)
                throw new KeyNotFoundException("Portfolio not found");

            return result;
        }

        public async Task<IEnumerable<InvestorPortfolioDTO>> GetAllPortfolioForInvestor(Guid id)
        {
            var data = await _repo.GetAllPortfolioForInvestor(id);

            if (!data.Any())
                   return Enumerable.Empty<InvestorPortfolioDTO>();

            var result = data.Select(p => new InvestorPortfolioDTO
            {
                PortfolioId = p.PortfolioId,
                PublicInvestorId = p.PublicInvestorId,
                StockId = p.StockId,
                Quantity = p.Quantity,
                AvgBuyPrice = p.AvgBuyPrice,
                BoughtAt = p.BoughtAt,

                StockSymbol = p.Stock.StockSymbol,
                CompanyName = p.Stock.CompanyName,
                Sector = p.Stock.Sector,
                CurrentMarketPrice = p.Stock.CurrentMarketPrice,

                CurrentValue = p.Quantity * p.Stock.CurrentMarketPrice,
                ProfitLoss = (p.Stock.CurrentMarketPrice - p.AvgBuyPrice) * p.Quantity
            });

            return result;
        }

    }
}
