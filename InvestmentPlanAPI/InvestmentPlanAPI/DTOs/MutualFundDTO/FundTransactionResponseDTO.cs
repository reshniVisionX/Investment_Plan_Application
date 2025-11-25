using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class FundTransactionResponseDTO
    {
        public int TransactionId { get; set; }
        public string FundName { get; set; }
        public decimal TransactionAmount { get; set; }

        public decimal NAVAtTransaction { get; set; }
        public decimal UnitsTransacted { get; set; }
        public FundTransactionType FundTransactionType { get; set; } 
        public DateTime TransactionDate { get; set; } 
    }
}
