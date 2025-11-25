using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class CreateFundPlanDTO
    {
        public string FundName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ExpenseRatio { get; set; }
        public decimal AUM { get; set; }
        public decimal NAV { get; set; }
        public decimal TotalUnits { get; set; }
        public decimal MinInvestmentAmount { get; set; }
        public decimal AnnualReturnRate { get; set; }

        public IFormFile? Logo { get; set; }

        public string Stocks { get; set; } = string.Empty;
    }
}
