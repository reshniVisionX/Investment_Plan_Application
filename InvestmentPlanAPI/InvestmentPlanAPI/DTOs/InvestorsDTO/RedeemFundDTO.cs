namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class RedeemFundDTO
    {
        public Guid investorId { get; set; }
        public int fundId { get; set; }
        public  decimal redeemAmount { get; set; }

    }
}
