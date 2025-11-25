using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class MutualFundStock
    {
     
            [Key]
            public int FStockId { get; set; }

            [ForeignKey(nameof(MutualFund))]
            public int FundId { get; set; }

            [ForeignKey(nameof(Stock))]
            public int StockId { get; set; }

            [Column(TypeName = "decimal(5,2)")]
            public decimal AllocationPercentage { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal QuantityHeld { get; set; }

        public  MutualFund? MutualFund { get; set; }
            public  Stock? Stock { get; set; } 
        }
    
}
