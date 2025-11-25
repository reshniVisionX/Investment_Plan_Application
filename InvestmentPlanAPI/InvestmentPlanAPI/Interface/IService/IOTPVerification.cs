namespace InvestmentPlanAPI.Interface.IService
{
    public interface IOTPVerification
    {
        Task<bool> SendOtpAsync(string email, string mobile);
        Task<bool> VerifyOtpAsync(string email, string mobile, string otp);
    }
}
