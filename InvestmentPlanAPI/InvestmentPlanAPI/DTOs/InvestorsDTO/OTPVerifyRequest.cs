namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class OTPVerifyRequest
    {
        public string Email { get; set; }
        public string Mobile { get; set; }
        public string Otp { get; set; }
    }
}
