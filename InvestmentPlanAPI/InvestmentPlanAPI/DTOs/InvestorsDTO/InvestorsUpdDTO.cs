namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class InvestorsUpdDTO
    {
        public Guid PublicInvestorId { get; set; }
        public string? Email { get; set; }
        public string? InvestorName { get; set; }
        public string? Password { get; set; }
        public string? Mobile { get; set; }
        public int? Age { get; set; }
        public decimal? Fund { get; set; }
        public string? NomineeName { get; set; }
        public string? NomineeEmail { get; set; }
        public string? NomineeRelation { get; set; }
    }
}
