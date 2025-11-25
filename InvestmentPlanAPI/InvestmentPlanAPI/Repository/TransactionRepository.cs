using InvestmentPlanAPI.Models;
using Microsoft.EntityFrameworkCore.Storage;
using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace InvestmentPlanAPI.Repository
{
    public class TransactionRepository : ITransactionRepo
    {
        private readonly DBContext _context;
        private readonly ILogger<TransactionRepository> _logger;
        private IDbContextTransaction _transaction;

        public TransactionRepository(DBContext context, ILogger<TransactionRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region --- Transaction Management ---
        public async Task BeginTransactionAsync()
        {
            _logger.LogInformation("🔄 Starting new database transaction...");
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            _logger.LogInformation("💾 Committing database transaction...");
            await _transaction.CommitAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            _logger.LogWarning("⚠️ Rolling back database transaction...");
            await _transaction.RollbackAsync();
        }
        #endregion

        #region --- Stock and Portfolio Operations ---
        public async Task<Stock> GetStockByIdAsync(int stockId)
        {
            _logger.LogInformation("🔍 Fetching Stock by ID: {StockId}", stockId);
            return await _context.Stocks.FirstOrDefaultAsync(s => s.StockId == stockId);
        }

        public async Task<PortFolio> GetPortfolioByInvestorAndStockAsync(Guid investorId, int stockId)
        {
            _logger.LogInformation("🔍 Fetching Portfolio for InvestorId: {InvestorId} and StockId: {StockId}",
                investorId, stockId);

            return await _context.Portfolios
                .FirstOrDefaultAsync(p => p.PublicInvestorId == investorId && p.StockId == stockId);
        }

        public async Task<bool> UpdateStockAsync(Stock stock)
        {
            _logger.LogInformation("📈 Updating stock: {StockSymbol} (ID: {StockId})", stock.StockSymbol, stock.StockId);
            _context.Stocks.Update(stock);
            var rows = await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Stock update completed, {Rows} rows affected.", rows);
            return rows > 0;
        }

        public async Task<bool> UpdatePortfolioAsync(PortFolio portfolio)
        {
            _logger.LogInformation("📊 Updating PortfolioId: {PortfolioId}", portfolio.PortfolioId);
            _context.Portfolios.Update(portfolio);
            var rows = await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Portfolio update completed, {Rows} rows affected.", rows);
            return rows > 0;
        }

        public async Task<bool> AddTransactionAsync(InvestorsTransactions transaction)
        {
            _logger.LogInformation("🧾 Adding new stock transaction for InvestorId: {InvestorId}", transaction.PublicInvestorId);
            await _context.Transactions.AddAsync(transaction);
            var rows = await _context.SaveChangesAsync();
            _logger.LogInformation("✅ Stock transaction added successfully. Rows affected: {Rows}", rows);
            return rows > 0;
        }
        #endregion

        #region --- Fund Transactions ---
        public async Task<IEnumerable<InvestorsTransactions>> GetAllTransactionsAsync()
        {
            _logger.LogInformation("📜 Fetching all investor transactions...");
            return await _context.Transactions
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<InvestorsTransactions>> GetTransactionsByInvestorIdAsync(Guid investorId)
        {
            _logger.LogInformation("📜 Fetching all transactions for InvestorId: {InvestorId}", investorId);
            return await _context.Transactions.Include(e=>e.Stock)
                .Where(t => t.PublicInvestorId == investorId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task CreateFundTransactionAsync(FundTransaction transaction)
        {
            _logger.LogInformation("💰 Creating FundTransaction for InvestId: {InvestId}, Amount: {Amount}",
                transaction.InvestId, transaction.TransactionAmount);

            await _context.FundTransactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            _logger.LogInformation("✅ FundTransaction created successfully (TransactionId: {TransactionId})", transaction.TransactionId);
        }

        public async Task<bool> PerformFundPurchaseAsync(
        Investor investor,
        MutualFund fund,
        MutualFundInvestment investment,
        FundTransaction transaction)
        {
            if (investor == null) throw new ArgumentNullException(nameof(investor));
            if (fund == null) throw new ArgumentNullException(nameof(fund));
            if (transaction == null) throw new ArgumentNullException(nameof(transaction));

            _logger.LogInformation("💵 Starting PerformFundPurchase for Investor: {InvestorId}, FundId: {FundId}, Amount: {Amount}",
                investor.PublicInvestorId, fund.FundId, transaction.TransactionAmount);

            if (investor.InvestorDetail == null)
            {
                _logger.LogError("🚫 Investor details not found for InvestorId: {InvestorId}", investor.PublicInvestorId);
                throw new InvalidOperationException("Investor details (wallet) not found.");
            }

            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1️⃣ Deduct wallet balance
                if (investor.InvestorDetail.Fund < transaction.TransactionAmount)
                {
                    _logger.LogWarning("💰 Insufficient funds for InvestorId: {InvestorId}. Available: {Available}, Required: {Required}",
                        investor.PublicInvestorId, investor.InvestorDetail.Fund, transaction.TransactionAmount);
                    throw new InvalidOperationException("Insufficient wallet balance.");
                }

                investor.InvestorDetail.Fund -= transaction.TransactionAmount;
                _context.InvestorDetails.Update(investor.InvestorDetail);
                _logger.LogInformation("💸 Deducted {Amount} from investor wallet. Remaining balance: {Balance}",
                    transaction.TransactionAmount, investor.InvestorDetail.Fund);

                // 2️⃣ Create or update MutualFundInvestment FIRST (this ensures valid InvestId for FK)
                MutualFundInvestment targetInvestment;
                if (investment == null)
                {
                    _logger.LogInformation("🆕 Creating new MutualFundInvestment for InvestorId: {InvestorId}, FundId: {FundId}",
                        investor.PublicInvestorId, fund.FundId);

                    targetInvestment = new MutualFundInvestment
                    {
                        PublicInvestorId = investor.PublicInvestorId,
                        FundId = fund.FundId,
                        TotalInvested = transaction.TransactionAmount,
                        CurrentValue = transaction.TransactionAmount,
                        TotalUnits = transaction.UnitsTransacted,
                        ProfitLoss = 0,
                        StartDate = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _context.MutualFundInvestments.AddAsync(targetInvestment);
                    await _context.SaveChangesAsync(); // ✅ ensures InvestId is generated
                    _logger.LogInformation("✅ Created new MutualFundInvestment (InvestId: {InvestId})", targetInvestment.InvestId);
                }
                else
                {
                    _logger.LogInformation("🔁 Updating existing MutualFundInvestment (InvestId: {InvestId})", investment.InvestId);

                    targetInvestment = investment;
                    targetInvestment.TotalInvested += transaction.TransactionAmount;
                    targetInvestment.TotalUnits += transaction.UnitsTransacted;  
                    targetInvestment.CurrentValue = targetInvestment.TotalUnits * fund.NAV;  
                    targetInvestment.ProfitLoss = targetInvestment.CurrentValue - targetInvestment.TotalInvested; 
                    targetInvestment.UpdatedAt = DateTime.UtcNow;


                    _context.MutualFundInvestments.Update(targetInvestment);
                    await _context.SaveChangesAsync();
                }

                // 3️⃣ Now link transaction with a valid InvestId
                transaction.InvestId = targetInvestment.InvestId;
                await _context.FundTransactions.AddAsync(transaction);
                _logger.LogInformation("🧾 FundTransaction created for InvestId: {InvestId}, Amount: {Amount}",
                    targetInvestment.InvestId, transaction.TransactionAmount);

                // 4️⃣ Update ONLY AmountReceived for the fund
                fund.AmountReceived += transaction.TransactionAmount;
                _context.MutualFunds.Update(fund);
                _logger.LogInformation("🏦 Fund updated. AmountReceived now: {AmountReceived}", fund.AmountReceived);

                // 5️⃣ Save all changes atomically
                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                _logger.LogInformation("✅ Fund purchase committed successfully for InvestorId: {InvestorId}, FundId: {FundId}",
                    investor.PublicInvestorId, fund.FundId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error occurred during PerformFundPurchase for InvestorId: {InvestorId}, FundId: {FundId}",
                    investor.PublicInvestorId, fund.FundId);

                await dbTransaction.RollbackAsync();
                throw;
            }
        }


public async Task<IEnumerable<FundTransaction>> FetchAllFundTransactionsAsync()
{
    _logger.LogInformation("📜 Fetching all Fund Transactions from database...");

    var transactions = await _context.FundTransactions
        .Include(t => t.MutualFundInvestment)
        .ThenInclude(inv => inv.Investor)
        .Include(t => t.MutualFundInvestment.MutualFund)
        .OrderByDescending(t => t.TransactionDate)
        .ToListAsync();

            _logger.LogInformation("✅ Retrieved {Count} fund transactions.", transactions.Count);
    return transactions;
}
      

        public async Task<IEnumerable<FundTransaction>> FetchFundTransactionsByInvestorIdAsync(Guid investorId)
{
    _logger.LogInformation("📜 Fetching Fund Transactions for InvestorId: {InvestorId}", investorId);

    var transactions = await _context.FundTransactions.Include(e=>e.MutualFundInvestment).ThenInclude(e=>e.MutualFund)
        .Where(e => e.MutualFundInvestment.PublicInvestorId == investorId)
        .ToListAsync();

    _logger.LogInformation("✅ Found {Count} transactions for InvestorId: {InvestorId}", transactions.Count, investorId);
    return transactions;
}

        #endregion

        public async Task UpdateInvestorFundAsync(Guid publicInvestorId, decimal newFund)
        {
            var investor = await _context.Investors
                .Include(i => i.InvestorDetail)
                .FirstOrDefaultAsync(i => i.PublicInvestorId == publicInvestorId);

            if (investor == null || investor.InvestorDetail == null)
                throw new Exception("Investor not found or details missing.");

            investor.InvestorDetail.Fund = newFund;
            _context.InvestorDetails.Update(investor.InvestorDetail);
            await _context.SaveChangesAsync();
        }

        public async Task DeletePortfolioAsync(int id)
        {
            var portfolio = await _context.Portfolios.FirstOrDefaultAsync(p => p.PortfolioId == id);

            if (portfolio == null)
                throw new Exception($"Portfolio with ID {id} not found.");

            _context.Portfolios.Remove(portfolio);
            await _context.SaveChangesAsync();
        }
        public async Task AddFundTransactionAsync(FundTransaction txn)
        {
            await _context.FundTransactions.AddAsync(txn);
            await _context.SaveChangesAsync();
        }

    }
}
