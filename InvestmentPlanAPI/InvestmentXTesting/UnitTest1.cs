using Moq;
using Xunit;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using InvestmentPlanAPI.Service;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.DTOs.InvestorsDTO;

namespace InvestmentPlanTests
{
    public class StocksServiceTests
    {
        private readonly Mock<IStockRepo> _mockRepo;
        private readonly StocksService _service;

        public StocksServiceTests()
        {
            _mockRepo = new Mock<IStockRepo>();
            _service = new StocksService(_mockRepo.Object);
        }

        // --------------------- INSERT STOCK ---------------------

        [Fact]
        public async Task InsertIntoStock_ThrowsException_WhenSymbolIsEmpty()
        {
            var dto = new CreateStockDTO { StockSymbol = "", BasePrice = 100 };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.InsertIntoStock(dto));

            Assert.Equal("Stock symbol cannot be empty", ex.Message);
        }

        [Fact]
        public async Task InsertIntoStock_ThrowsException_WhenBasePriceZero()
        {
            var dto = new CreateStockDTO { StockSymbol = "TCS", BasePrice = 0 };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.InsertIntoStock(dto));

            Assert.Equal("Base price must be greater than zero", ex.Message);
        }

        [Fact]
        public async Task InsertIntoStock_ReturnsStock_WhenValid()
        {
            var dto = new CreateStockDTO
            {
                StockSymbol = "TCS",
                BasePrice = 500,
                CurrentMarketPrice = 510,
                TotalShares = 1000
            };

            var expected = new Stock
            {
                StockSymbol = "TCS",
                BasePrice = 500,
                CurrentMarketPrice = 510,
                TotalShares = 1000
            };

            _mockRepo.Setup(r => r.InsertIntoStock(It.IsAny<Stock>()))
                .ReturnsAsync(expected);

            var result = await _service.InsertIntoStock(dto);

            Assert.NotNull(result);
            Assert.Equal("TCS", result.StockSymbol);
            Assert.Equal(500, result.BasePrice);
        }

        // --------------------- UPDATE STOCK ---------------------

        [Fact]
        public async Task UpdateStock_ThrowsException_WhenStockNotFound()
        {
            var dto = new UpdateStockDTO { StockId = 1 };

            _mockRepo.Setup(r => r.GetStockById(1))
                     .ReturnsAsync((Stock)null);

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.UpdateStock(dto));

            Assert.Equal("Stock not found", ex.Message);
        }

        [Fact]
        public async Task UpdateStock_ReturnsTrue_WhenValid()
        {
            var existing = new Stock { StockId = 1, CompanyName = "Old" };

            _mockRepo.Setup(r => r.GetStockById(1)).ReturnsAsync(existing);
            _mockRepo.Setup(r => r.UpdateStock(existing)).ReturnsAsync(true);

            var dto = new UpdateStockDTO { StockId = 1, CompanyName = "New Co" };

            var result = await _service.UpdateStock(dto);

            Assert.True(result);
            Assert.Equal("New Co", existing.CompanyName);
        }

        // --------------------- DELETE STOCK ---------------------

        [Fact]
        public async Task DeleteStock_ThrowsException_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetStockById(5))
                     .ReturnsAsync((Stock)null);

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.DeleteStock(5));

            Assert.Equal("Stock not found", ex.Message);
        }

        [Fact]
        public async Task DeleteStock_ReturnsTrue_WhenDeleted()
        {
            _mockRepo.Setup(r => r.GetStockById(1)).ReturnsAsync(new Stock());
            _mockRepo.Setup(r => r.DeleteStock(1)).ReturnsAsync(true);

            var result = await _service.DeleteStock(1);

            Assert.True(result);
        }

        // --------------------- GET STOCK BY ID ---------------------

        [Fact]
        public async Task GetStockById_ThrowsException_WhenNotFound()
        {
            _mockRepo.Setup(r => r.GetStockById(99))
                     .ReturnsAsync((Stock)null);

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetStockById(99));

            Assert.Equal("Stock not found", ex.Message);
        }

        [Fact]
        public async Task GetStockById_ReturnsStock()
        {
            var stock = new Stock { StockId = 1, StockSymbol = "INFY" };

            _mockRepo.Setup(r => r.GetStockById(1)).ReturnsAsync(stock);

            var result = await _service.GetStockById(1);

            Assert.NotNull(result);
            Assert.Equal("INFY", result.StockSymbol);
        }

        // --------------------- GET ALL STOCKS ---------------------

        [Fact]
        public async Task GetAllStocks_ReturnsList()
        {
            var stocks = new List<Stock>
            {
                new Stock{ StockId = 1 },
                new Stock{ StockId = 2 }
            };

            _mockRepo.Setup(r => r.GetAllStocks()).ReturnsAsync(stocks);

            var result = await _service.GetAllStocks();

            Assert.Equal(2, result.Count());
        }

        // --------------------- INSERT PORTFOLIO ---------------------

        [Fact]
        public async Task InsertIntoPortfolio_ThrowsException_WhenQuantityZero()
        {
            var dto = new CreatePortFolioDTO { Quantity = 0 };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.InsertIntoPortfolio(dto));

            Assert.Equal("Quantity must be greater than 0", ex.Message);
        }

        [Fact]
        public async Task InsertIntoPortfolio_ReturnsPortfolio_WhenValid()
        {
            var dto = new CreatePortFolioDTO
            {
                PublicInvestorId = Guid.NewGuid(),
                StockId = 1,
                Quantity = 10,
                AvgBuyPrice = 100
            };

            var expected = new PortFolio
            {
                PublicInvestorId = dto.PublicInvestorId,
                StockId = 1,
                Quantity = 10
            };

            _mockRepo.Setup(r => r.InsertIntoPortfolio(It.IsAny<PortFolio>()))
                     .ReturnsAsync(expected);

            var result = await _service.InsertIntoPortfolio(dto);

            Assert.NotNull(result);
            Assert.Equal(10, result.Quantity);
        }

        // --------------------- UPDATE PORTFOLIO ---------------------

        [Fact]
        public async Task UpdatePortfolio_ThrowsException_WhenPortfolioNotFound()
        {
            Guid investorId = Guid.NewGuid();
            _mockRepo.Setup(r => r.GetAllPortfolioForInvestor(investorId))
                     .ReturnsAsync(new List<PortFolio>());

            var dto = new UpdPortFolioDTO { PortfolioId = 5 };

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.UpdatePortfolio(investorId, dto));

            Assert.Equal("Portfolio not found", ex.Message);
        }

        [Fact]
        public async Task UpdatePortfolio_ReturnsUpdatedPortfolio()
        {
            Guid investorId = Guid.NewGuid();

            var existing = new PortFolio
            {
                PortfolioId = 10,
                Quantity = 5
            };

            _mockRepo.Setup(r => r.GetAllPortfolioForInvestor(investorId))
                     .ReturnsAsync(new List<PortFolio> { existing });

            _mockRepo.Setup(r => r.UpdatePortfolio(investorId, existing))
                     .ReturnsAsync(existing);

            var dto = new UpdPortFolioDTO
            {
                PortfolioId = 10,
                Quantity = 20
            };

            var result = await _service.UpdatePortfolio(investorId, dto);

            Assert.NotNull(result);
            Assert.Equal(20, result.Quantity);
        }

        // --------------------- DELETE PORTFOLIO ---------------------

        [Fact]
        public async Task DeletePortfolio_ThrowsException_WhenNotFound()
        {
            _mockRepo.Setup(r => r.DeletePortfolio(7))
                     .ReturnsAsync((PortFolio)null);

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.DeletePortfolio(7));

            Assert.Equal("Portfolio not found", ex.Message);
        }

        [Fact]
        public async Task DeletePortfolio_ReturnsDeletedPortfolio()
        {
            var deleted = new PortFolio { PortfolioId = 1 };

            _mockRepo.Setup(r => r.DeletePortfolio(1)).ReturnsAsync(deleted);

            var result = await _service.DeletePortfolio(1);

            Assert.Equal(1, result.PortfolioId);
        }

        // --------------------- GET ALL PORTFOLIO FOR INVESTOR ---------------------

        [Fact]
        public async Task GetAllPortfolioForInvestor_ThrowsException_WhenEmpty()
        {
            _mockRepo.Setup(r => r.GetAllPortfolioForInvestor(It.IsAny<Guid>()))
                     .ReturnsAsync(new List<PortFolio>());

            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                _service.GetAllPortfolioForInvestor(Guid.NewGuid()));

            Assert.Equal("No portfolio found for investor", ex.Message);
        }

        [Fact]
        public async Task GetAllPortfolioForInvestor_ReturnsMappedDTOList()
        {
            var stock = new Stock
            {
                StockId = 1,
                StockSymbol = "INFY",
                CompanyName = "Infosys",
                CurrentMarketPrice = 2000
            };

            var portfolio = new PortFolio
            {
                PortfolioId = 1,
                StockId = 1,
                Quantity = 5,
                AvgBuyPrice = 1500,
                Stock = stock
            };

            _mockRepo.Setup(r => r.GetAllPortfolioForInvestor(It.IsAny<Guid>()))
                     .ReturnsAsync(new List<PortFolio> { portfolio });

            var result = await _service.GetAllPortfolioForInvestor(Guid.NewGuid());

            var dto = result.First();

            Assert.Equal("INFY", dto.StockSymbol);
            Assert.Equal(5 * 2000, dto.CurrentValue);
            Assert.Equal((2000 - 1500) * 5, dto.ProfitLoss);
        }
    }
}
