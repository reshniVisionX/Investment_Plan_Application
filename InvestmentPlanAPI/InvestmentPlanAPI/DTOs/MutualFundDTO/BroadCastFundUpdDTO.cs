namespace InvestmentPlanAPI.DTOs.MutualFundDTO
{
    public class BroadCastFundUpdDTO
    {
        public int FundId { get; set; }
        public string FundName { get; set; } = string.Empty;
        public decimal NAV { get; set; }
        public decimal AUM { get; set; }
        public decimal TotalUnits { get; set; }
        public decimal MinInvestmentAmount { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
