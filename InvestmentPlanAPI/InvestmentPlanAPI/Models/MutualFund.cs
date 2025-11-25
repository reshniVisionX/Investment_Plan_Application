using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class MutualFund
    {
        [Key]
        public int FundId { get; set; }

       
        [Required, MaxLength(50)]
        public string FundName { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }

        public byte[]? Logo { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal ExpenseRatio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AUM { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NAV { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalUnits { get; set; } = 0;
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinInvestmentAmount { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal AnnualReturnRate { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountReceived { get; set; } = 0;
        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPending { get; set; } = 0;
        public InvestmentType InvestmentType { get; set; } = InvestmentType.LumpSum;
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public VerificationStatus Status { get; set; } = VerificationStatus.Pending;

        // Relationships
        public  ICollection<MutualFundStock>? MutualFundStocks { get; set; }
        public  ICollection<MutualFundInvestment>? MutualFundInvestments { get; set; }
    }
}
