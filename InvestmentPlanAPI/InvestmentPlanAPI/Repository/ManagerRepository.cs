using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Hubs;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace InvestmentPlanAPI.Repository
{
    public class ManagerRepository : IManagerRepo
    {
        private readonly DBContext _context;
        private readonly ILogger<ManagerRepository> _logger;
        private IDbContextTransaction? _transaction;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly HubBroadCastService _broadcastService;

        public ManagerRepository(DBContext context, ILogger<ManagerRepository> logger, IHubContext<NotificationHub> hubContext, HubBroadCastService broadcastService)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
            _broadcastService = broadcastService;
        }

        // -------------------- Transaction Control --------------------
        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
            _logger.LogInformation("🔸 Transaction started.");
        }

        public async Task CommitTransactionAsync()
        {
            await _transaction!.CommitAsync();
            _logger.LogInformation("✅ Transaction committed successfully.");
        }

        public async Task RollbackTransactionAsync()
        {
            await _transaction!.RollbackAsync();
            _logger.LogWarning("⚠️ Transaction rolled back due to an error.");
        }

        // -------------------- Fund Queries --------------------
        public async Task<MutualFund?> GetFundByIdAsync(int fundId)
            => await _context.MutualFunds
                .Include(f => f.MutualFundStocks)
                .ThenInclude(fs => fs.Stock)
                .Include(f => f.MutualFundInvestments)
                .FirstOrDefaultAsync(f => f.FundId == fundId);

        public async Task<IEnumerable<MutualFund>> GetAllFundsAsync()
        {
            var funds = await _context.MutualFunds
                .Include(f => f.MutualFundInvestments)  
                .Include(f => f.MutualFundStocks)        
                    .ThenInclude(s => s.Stock)         
                .ToListAsync();

            // Log
            Console.WriteLine("----- Fetched Mutual Funds -----");
            Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(
                funds,
                new JsonSerializerOptions { WriteIndented = true }
            ));

            return funds;
        }


        public async Task UpdateFundAsync(MutualFund fund)
        {
            _context.MutualFunds.Update(fund);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"📊 Updated MutualFund '{fund.FundName}' (FundId: {fund.FundId}) — AUM: {fund.AUM}, NAV: {fund.NAV}, Pending: {fund.AmountPending}");
        }

        // -------------------- Stocks --------------------
        public async Task<IEnumerable<MutualFundStock>> GetStocksByFundIdAsync(int fundId)
            => await _context.MutualFundStocks
                .Include(s => s.Stock)
                .Where(s => s.FundId == fundId)
                .ToListAsync();

        public async Task<Stock?> GetStockByIdAsync(int stockId)
            => await _context.Stocks.FirstOrDefaultAsync(s => s.StockId == stockId);

        public async Task UpdateStockAsync(Stock stock)
        {
            _context.Stocks.Update(stock);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"📈 Updated Stock '{stock.StockSymbol}' — CMP: ₹{stock.CurrentMarketPrice:F2}, VolumeTraded: {stock.VolumeTraded}, Status: {stock.Status}");
        }

        // -------------------- Investments --------------------
        public async Task<IEnumerable<MutualFundInvestment>> GetInvestmentsByFundIdAsync(int fundId)
            => await _context.MutualFundInvestments
                .Include(i => i.Investor)
                .Where(i => i.FundId == fundId)
                .ToListAsync();

        public async Task UpdateMutualFundInvestmentAsync(MutualFundInvestment investment)
        {
            _context.MutualFundInvestments.Update(investment);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"💼 Updated Investment for Investor '{investment.Investor?.InvestorName}' — InvestId: {investment.InvestId}, CurrentValue: {investment.CurrentValue}, Profit/Loss: {investment.ProfitLoss}");
        }

      

        public async Task UpdateMutualFundStockAsync(MutualFundStock fs)
        {
            if (fs == null)
                throw new ArgumentNullException(nameof(fs));

            // Attach entity if not already tracked
            _context.MutualFundStocks.Attach(fs);

            // Mark ONLY QuantityHeld as modified
            _context.Entry(fs).Property(x => x.QuantityHeld).IsModified = true;

            await _context.SaveChangesAsync();
        }


        public async Task<IEnumerable<MutualFund>> GetAllFundsWithAllDataAsync()
        {
            var funds = await _context.MutualFunds
                .Include(f => f.MutualFundInvestments)
                .Include(f => f.MutualFundStocks)
                    .ThenInclude(fs => fs.Stock)
                .ToListAsync();

            return funds;
        }

       
    }
}
