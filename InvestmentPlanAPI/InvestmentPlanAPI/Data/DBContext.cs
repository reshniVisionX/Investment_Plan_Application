using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Data
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options) : base(options) { }

        public DbSet<Investor> Investors { get; set; }
        public DbSet<InvestorDetails> InvestorDetails { get; set; }
        public DbSet<MutualFund> MutualFunds { get; set; }
        public DbSet<MutualFundInvestment> MutualFundInvestments { get; set; }
        public DbSet<MutualFundStock> MutualFundStocks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PortFolio> Portfolios { get; set; }
        public DbSet<Stock> Stocks { get; set; }
        public DbSet<InvestorsTransactions> Transactions { get; set; }

        public DbSet<Roles> Roles { get; set; }

        public DbSet<FundTransaction> FundTransactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ===================== Investor =====================
            modelBuilder.Entity<Investor>(entity =>
            {
                entity.ToTable("Investors");

                entity.HasKey(i => i.PublicInvestorId);

                entity.HasIndex(i => i.Email).IsUnique();
             
                entity.Property(i => i.InvestorName).HasMaxLength(50).IsRequired();
                entity.Property(i => i.Password).HasMaxLength(505).IsRequired();

                // Store Enums as strings
                modelBuilder.Entity<Investor>()
               .Property(u => u.Status)
               .HasConversion<string>(); // UserStatus as string

                modelBuilder.Entity<MutualFund>()
               .Property(u => u.Status)
               .HasConversion<string>();

                modelBuilder.Entity<MutualFund>()
               .Property(u => u.InvestmentType)
               .HasConversion<string>();

                modelBuilder.Entity<FundTransaction>()
               .Property(u => u.FundTransactionType)
               .HasConversion<string>();


                modelBuilder.Entity<Investor>()
                    .Property(u => u.VerificationStatus)
                    .HasConversion<string>(); // VerificationStatus as string

                modelBuilder.Entity<InvestorsTransactions>()
                    .Property(t => t.TransactionType)
                    .HasConversion<string>(); // TransactionType as string

                modelBuilder.Entity<Stock>()
                    .Property(s => s.Sector)
                    .HasConversion<string>(); // StockSector as string

                entity.Property(i => i.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            // ===================== InvestorDetails =====================
            modelBuilder.Entity<InvestorDetails>(entity =>
            {
                entity.ToTable("InvestorDetails");

                entity.HasKey(d => d.InvId);

                entity.HasIndex(d => d.AadhaarNo).IsUnique();
                entity.HasIndex(d => d.PanNo).IsUnique();
                entity.HasIndex(d => d.Mobile).IsUnique();
                entity.Property(d => d.Mobile).HasMaxLength(10).IsRequired();
                entity.Property(d => d.AadhaarNo).HasMaxLength(12).IsRequired();
                entity.Property(d => d.PanNo).HasMaxLength(10).IsRequired();

                entity.Property(d => d.Signature).IsRequired();
                entity.Property(d => d.IncomeProof).IsRequired();
                entity.Property(d => d.SignedDocument).IsRequired();

                // 1-to-1 relationship
                entity.HasOne(d => d.Investor)
                      .WithOne(i => i.InvestorDetail)
                      .HasForeignKey<InvestorDetails>(d => d.PublicInvestorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ===================== Stock =====================
            modelBuilder.Entity<Stock>(entity =>
            {
                entity.ToTable("Stocks");
                entity.HasKey(s => s.StockId);

                entity.Property(s => s.CompanyName).HasMaxLength(50).IsRequired();

                modelBuilder.Entity<Stock>()
                .HasIndex(s => s.StockSymbol)
                .IsUnique();


                entity.Property(s => s.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            // ===================== Portfolio =====================
            modelBuilder.Entity<PortFolio>(entity =>
            {
                entity.ToTable("Portfolios");
                entity.HasKey(p => p.PortfolioId);

                entity.Property(p => p.AvgBuyPrice).HasColumnType("decimal(18,2)");
                entity.Property(p => p.CurrentValue).HasColumnType("decimal(18,2)");
                entity.Property(p => p.ProfitLoss).HasColumnType("decimal(18,2)");

                entity.HasOne(p => p.Investor)
                      .WithMany(i => i.Portfolios)
                      .HasForeignKey(p => p.PublicInvestorId)
                      .OnDelete(DeleteBehavior.Cascade);

              
            });

            // ===================== MutualFund =====================
            modelBuilder.Entity<MutualFund>(entity =>
            {
                entity.ToTable("MutualFunds");
                entity.HasKey(f => f.FundId);

                entity.Property(f => f.FundName).HasMaxLength(50).IsRequired();
                entity.Property(f => f.Description).HasMaxLength(200);
            });

            // ===================== MutualFundStock =====================
            modelBuilder.Entity<MutualFundStock>(entity =>
            {
                entity.ToTable("MutualFundStocks");
                entity.HasKey(fs => fs.FStockId);

                entity.Property(fs => fs.AllocationPercentage).HasColumnType("decimal(5,2)");

                entity.HasOne(fs => fs.MutualFund)
                      .WithMany(f => f.MutualFundStocks)
                      .HasForeignKey(fs => fs.FundId)
                      .OnDelete(DeleteBehavior.Cascade);

            });

            // ===================== MutualFundInvestment =====================
            modelBuilder.Entity<MutualFundInvestment>(entity =>
            {
                entity.ToTable("MutualFundInvestments");
                entity.HasKey(i => i.InvestId);

                entity.Property(i => i.TotalInvested).HasColumnType("decimal(18,2)");
                entity.Property(i => i.CurrentValue).HasColumnType("decimal(18,2)");
                entity.Property(i => i.ProfitLoss).HasColumnType("decimal(18,2)");

                entity.HasOne(i => i.Investor)
                      .WithMany(u => u.MutualFundInvestments)
                      .HasForeignKey(i => i.PublicInvestorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(i => i.MutualFund)
                      .WithMany(m => m.MutualFundInvestments)
                      .HasForeignKey(i => i.FundId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ===================== Transactions =====================
            modelBuilder.Entity<InvestorsTransactions>(entity =>
            {
                entity.ToTable("Transactions");
                entity.HasKey(t => t.TransactionId);

                entity.Property(t => t.TransactionType)
                      .HasConversion<string>()
                      .IsRequired();

                entity.Property(t => t.Price).HasColumnType("decimal(18,2)");
                entity.Property(t => t.TotalValue).HasColumnType("decimal(18,2)");

              
            });

            // ===================== Notification =====================
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("Notifications");
                entity.HasKey(n => n.NotificationId);

                entity.Property(n => n.Message).HasMaxLength(500).IsRequired();

                entity.HasOne(n => n.Investor)
                      .WithMany(i => i.Notifications)
                      .HasForeignKey(n => n.PublicInvestorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ===================== Seeding Data =====================
            var investor1Id = Guid.Parse("ab921ea4-1073-4797-babc-cd829a2128b5");
            var investor2Id = Guid.Parse("f594cb25-0721-4289-b99a-bb75a2d9ccd7");

            modelBuilder.Entity<Roles>().HasData(
              new Roles
              {
                  RoleId = 1,
                  RoleName = "Admin",
                  Description = "Full system access, can manage users, portfolios, and investments."
              },
              new Roles
              {
                  RoleId = 2,
                  RoleName = "Investor",
                  Description = "Regular user who can manage their own portfolio and investments."
              },
              new Roles
              {
                  RoleId = 3,
                  RoleName = "FundManager",
                  Description = "A Fund Manager is a financial expert responsible for Deciding which stocks, bonds, or assets the mutual fund invests in."
              }
          );

            var staticDate = new DateTime(2025, 01, 01, 0, 0, 0, DateTimeKind.Utc);

           

            modelBuilder.Entity<Stock>().HasData(
                new Stock
                {
                    StockId = 1,
                    CompanyName = "Reliance Industries",
                    StockSymbol = "RELIANCE",
                    Sector = StockSector.NSE,
                    BasePrice = 2400,
                    CurrentMarketPrice = 2450,
                    TotalShares = 1000000,
                    VolumeTraded = 50000,
                    ListedDate = staticDate,
                    Status = true,
                    CreatedAt = staticDate,
                    UpdatedAt = new DateTime(2025, 01, 01, 0, 0, 0, DateTimeKind.Utc)


                },
                new Stock
                {
                    StockId = 2,
                    CompanyName = "Tata Motors",
                    StockSymbol = "TATAMOTORS",
                    Sector = StockSector.BSE,
                    BasePrice = 800,
                    CurrentMarketPrice = 820,
                    TotalShares = 800000,
                    VolumeTraded = 45000,
                    ListedDate = staticDate,
                    Status = true,
                    CreatedAt = staticDate,
                    UpdatedAt = new DateTime(2025, 01, 01, 0, 0, 0, DateTimeKind.Utc)

                }
            );

          
        }
    }
}
