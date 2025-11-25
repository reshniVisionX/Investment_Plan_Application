
using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
    using InvestmentPlanAPI.Models;
    using Microsoft.EntityFrameworkCore;
    using System;

    namespace InvestmentPlanAPI.Repository
    {
        public class StockRepository : IStockRepo
        {
            private readonly DBContext _context;

            public StockRepository(DBContext context)
            {
                _context = context;
            }

            //---------------- STOCK ------------------
            public async Task<Stock> InsertIntoStock(Stock stock)
            {
                _context.Stocks.Add(stock);
                await _context.SaveChangesAsync();
                return stock;
            }

            public async Task<bool> UpdateStock(Stock stock)
            {
                _context.Stocks.Update(stock);
                return await _context.SaveChangesAsync() > 0;
            }

            public async Task<bool> DeleteStock(int id)
            {
                var stock = await _context.Stocks.FindAsync(id);
                if (stock == null) return false;

                _context.Stocks.Remove(stock);
                return await _context.SaveChangesAsync() > 0;
            }

            public async Task<IEnumerable<Stock>> GetAllStocks()
            {
                return await _context.Stocks.ToListAsync();
            }

            public async Task<Stock> GetStockById(int id)
            {
                return await _context.Stocks.FindAsync(id);
            }

            //---------------- PORTFOLIO ------------------
            public async Task<PortFolio> InsertIntoPortfolio(PortFolio port)
            {
                _context.Portfolios.Add(port);
                await _context.SaveChangesAsync();
                return port;
            }

            public async Task<PortFolio> UpdatePortfolio(Guid id, PortFolio port)
            {
                var existing = await _context.Portfolios
                    .FirstOrDefaultAsync(p => p.PublicInvestorId == id && p.PortfolioId == port.PortfolioId);
                if (existing == null) return null;

                existing.Quantity = port.Quantity;
                existing.TotalShares = port.TotalShares;
                existing.AvgBuyPrice = port.AvgBuyPrice;
                existing.StockId = port.StockId;

                await _context.SaveChangesAsync();
                return existing;
            }

            public async Task<PortFolio> DeletePortfolio(int id)
            {
                var existing = await _context.Portfolios.FindAsync(id);
                if (existing == null) return null;

                _context.Portfolios.Remove(existing);
                await _context.SaveChangesAsync();
                return existing;
            }

            public async Task<IEnumerable<PortFolio>> GetAllPortfolioForInvestor(Guid id)
            {
                return await _context.Portfolios
                    .Where(p => p.PublicInvestorId == id)
                    .Include(p => p.Stock)
                    .ToListAsync();
            }
        }
    }
