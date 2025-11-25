using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class FundTransaction
    {
        [Key]
        public int TransactionId { get; set; }

       
        [ForeignKey(nameof(MutualFundInvestment))]
        public int InvestId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TransactionAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal NAVAtTransaction { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitsTransacted { get; set; }

        [Required]
        public FundTransactionType FundTransactionType { get; set; } = FundTransactionType.Purchase;


        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public MutualFundInvestment? MutualFundInvestment { get; set; }

    }
}
