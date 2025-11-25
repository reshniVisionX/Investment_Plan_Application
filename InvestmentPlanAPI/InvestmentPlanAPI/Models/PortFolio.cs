using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class PortFolio
    {
      
            [Key]
            public int PortfolioId { get; set; }

            [ForeignKey(nameof(Investor))]
            public Guid PublicInvestorId { get; set; }

            [ForeignKey(nameof(Stock))]
            public int StockId { get; set; }

            public int Quantity { get; set; }

            public int TotalShares { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal AvgBuyPrice { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal CurrentValue { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal ProfitLoss { get; set; }

            public DateTime BoughtAt { get; set; } = DateTime.UtcNow;

            public  Investor? Investor { get; set; }
            public  Stock? Stock { get; set; }
        }
    
}
