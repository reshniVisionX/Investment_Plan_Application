using InvestmentPlanAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class FundsOfInvestorDTO
    {
        public int InvestId { get; set; }
        public int FundId { get; set; }
        public string FundName { get; set; }
        public decimal NAV { get; set; }
        public decimal TotalInvested { get; set; } 
        public decimal CurrentValue { get; set; }
        public decimal ProfitLoss { get; set; }

        public DateTime StartDate { get; set; }    

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
