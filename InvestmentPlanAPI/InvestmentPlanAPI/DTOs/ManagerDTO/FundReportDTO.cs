using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.ManagerDTO
{

    public class AllFundReportsDTO
    {
      public string FundName { get; set; }
 
        public decimal CurrentValue { get; set; }
     

        public decimal TotalInvested { get; set; }

        public decimal ProfitLoss { get; set; }

        public decimal NAV { get; set; }
        public decimal AUM { get; set; }
        public int noOfInvestors { get; set;}
        public ICollection<StockAllocations> Stocks { get; set; }
    }

}
public class StockAllocations
{
    public int stockId { get; set; }
    public string stockName { get; set; }
    public StockSector sector { get; set; }
    public decimal allocationPercentage { get; set; }

    public decimal marketPrice { get; set; }

    public decimal totalAmountInvested { get; set; } //calcuted based on the allocation %


}
