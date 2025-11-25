using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class MutualFundInvestment
    {
     
            [Key]
            public int InvestId { get; set; }

            [ForeignKey(nameof(Investor))]
            public Guid PublicInvestorId { get; set; }

            [ForeignKey(nameof(MutualFund))]
            public int FundId { get; set; }
      

        [Column(TypeName = "decimal(18,2)")]
            public decimal TotalInvested { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalUnits { get; set; }

        [Column(TypeName = "decimal(18,2)")]
            public decimal CurrentValue { get; set; }

            [Column(TypeName = "decimal(18,2)")]
            public decimal ProfitLoss { get; set; }

            public DateTime StartDate { get; set; }

            public DateTime? EndDate { get; set; }


            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

            public Investor Investor { get; set; }
            public  MutualFund MutualFund { get; set; }
        
    }
}
