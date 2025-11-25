using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class UpdateFundPlanDTO
    {
        public int FundId { get; set; }

        public decimal? ExpenseRatio { get; set; }
   
        public decimal? AUM { get; set; }
 
        public decimal? NAV { get; set; }

        public decimal? TotalUnits { get; set; } 

        public decimal? MinInvestmentAmount { get; set; }

        public decimal? AnnualReturnRate { get; set; }
    
        public decimal? AmountReceived { get; set; } 
   
        public decimal? AmountPending { get; set; } 




    }
}
