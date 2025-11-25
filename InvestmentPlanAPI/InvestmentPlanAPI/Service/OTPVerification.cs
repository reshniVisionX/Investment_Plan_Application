using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Utils;
using System.Threading;

namespace InvestmentPlanAPI.Service
{
    public class OTPVerification : IOTPVerification
    {
        private readonly IConfiguration _config;
        private readonly SendEmail _emailService;

        public OTPVerification(IConfiguration config)
        {
            _config = config;
            _emailService = new SendEmail(_config); // initialize email service
        }

        public async Task<bool> SendOtpAsync(string email, string mobile)
        {
            try
            {
               
                var otp = TOTPVerification.GenerateOtp(mobile);

                var placeholders = new Dictionary<string, string>
{
                 { "UserEmail", email },
                 { "OTP", otp }
};

                // send email using template
                await Task.Run(() =>
                    _emailService.SendTemplatedEmail(
                        email,
                        "Your One-Time Password (OTP) – Investment Plan System",
                        "OtpTemplate.html",
                        placeholders
                    )
                );

                Console.WriteLine($"✅ OTP email sent to {email}: {otp}");

             
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending OTP: {ex.Message}");
                return false;
            }
        }
        public async Task<bool> VerifyOtpAsync(string email, string mobile, string otp)
        {
            try
            {
                var isValid = TOTPVerification.VerifyOtp(mobile, otp);
                await Task.Delay(200);
                return isValid;
            }
            catch (Exception)
            {
                return false;
            }
        }
       

}
}
