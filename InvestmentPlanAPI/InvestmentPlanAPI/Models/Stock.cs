using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace InvestmentPlanAPI.Models
{
    public class Stock
    {
       
            [Key]
            public int StockId { get; set; }

            [ MaxLength(10)]
            public string StockSymbol { get; set; }

            [Required, MaxLength(50)]
            public string CompanyName { get; set; }

        [Required]
        public StockSector Sector { get; set; } = StockSector.NSE;

            [Column(TypeName = "decimal(18,2)")]
            public decimal BasePrice { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal CurrentMarketPrice { get; set; }

            public int TotalShares { get; set; }

            public long VolumeTraded { get; set; }

            public DateTime ListedDate { get; set; }

        public bool Status { get; set; } = true;

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


        }
}
