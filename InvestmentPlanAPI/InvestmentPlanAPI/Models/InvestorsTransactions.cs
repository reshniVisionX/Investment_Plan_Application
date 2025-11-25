using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class InvestorsTransactions
    {
        [Key]
        public int TransactionId { get; set; }

        [ForeignKey(nameof(Investor))]
        public Guid PublicInvestorId { get; set; }

        [ForeignKey(nameof(Stock))]
        public int StockId { get; set; }

        [Required]
        public TransactionType TransactionType { get; set; } = TransactionType.BUY;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalValue { get; set; }

        public int Quantity { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public Investor Investor { get; set; }
        public  Stock Stock { get; set; }
    }
}
