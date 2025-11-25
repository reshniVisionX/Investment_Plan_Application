using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.Interface.IService;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/otp/[controller]")]
    [ApiController]
    public class OTPVerifyController : ControllerBase
    {
        private readonly IOTPVerification _otpService;

        public OTPVerifyController(IOTPVerification otpService)
        {
            _otpService = otpService;
        }

        // ===============================
        // ✅ SEND OTP
        // ===============================
        [HttpPost("send")]
        public async Task<IActionResult> SendOtp([FromBody] OTPRequest request)
        {
            // Basic input validation (simple guard clause)
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Mobile))
                return BadRequest(new { success = false, message = "Email and Mobile are required." });

            // The service may throw exceptions that middleware will handle
            var result = await _otpService.SendOtpAsync(request.Email, request.Mobile);

            return Ok(new
            {
                success = true,
                message = "OTP sent successfully.",
                data = new { request.Email, request.Mobile, otpSent = result }
            });
        }

        // ===============================
        // ✅ VERIFY OTP
        // ===============================
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyOtp([FromBody] OTPVerifyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Mobile) ||
                string.IsNullOrWhiteSpace(request.Otp))
                return BadRequest(new { success = false, message = "All fields are required." });

            var result = await _otpService.VerifyOtpAsync(request.Email, request.Mobile, request.Otp);

            if (!result)
            {
                return Ok(new
                {
                    success = false,
                    message = "Invalid or expired OTP."
                });
            }

            return Ok(new
            {
                success = true,
                message = "OTP verified successfully.",
                data = new { request.Email, request.Mobile }
            });
        }
    }
}
