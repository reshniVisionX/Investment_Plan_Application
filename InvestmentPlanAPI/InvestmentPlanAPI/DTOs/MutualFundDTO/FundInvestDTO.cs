using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class FundInvestDTO
    {
        public Guid PublicInvestorId { get; set; }  

        public int FundId { get; set; }


        public decimal TransactionAmount { get; set; }

     
        public FundTransactionType FundTransactionType { get; set; } = FundTransactionType.Purchase;

    }
}
