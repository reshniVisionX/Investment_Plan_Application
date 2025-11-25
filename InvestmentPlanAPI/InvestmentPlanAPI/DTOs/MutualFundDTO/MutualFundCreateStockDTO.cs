namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class MutualFundCreateStockDTO
    {
        public int StockId { get; set; }   // which stock
        public decimal AllocationPercentage { get; set; }
    }
}
