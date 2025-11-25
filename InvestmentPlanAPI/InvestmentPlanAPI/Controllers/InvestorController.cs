using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
 
    public class InvestorController : ControllerBase
    {
        private readonly IInvestorService _service;
        private readonly TokenService _tokenService;

        public InvestorController(IInvestorService service, TokenService token)
        {
            _service = service;
            _tokenService = token;
        }

        // ===============================
        // ✅ LOGIN
        // ===============================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] InvestorLoginDTO dto)
        {
            var user = await _service.LoginInvestor(dto);
            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                success = true,
                message = "Login successful",
                data = new
                {
                    user.PublicInvestorId,
                    user.InvestorName,
                    user.Email,
                    user.Status,
                    user.Roles.RoleName,
                    Token = token
                }
            });
        }

        // ===============================
        // ✅ SIGNUP
        // ===============================
        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromForm] InvestorsSignUpDTO dto)
        {
            var result = await _service.SignUpInvestor(dto);

            return result
                ? Ok(new
                {
                    success = true,
                    message = "Investor registered successfully"
                })
                : BadRequest(new
                {
                    success = false,
                    message = "Registration failed"
                });
        }

        // ===============================
        // ✅ UPDATE INVESTOR
        // ===============================
        [Authorize(Roles = "Investor")]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateInvestor([FromBody] InvestorsUpdDTO dto)
        {
            var result = await _service.UpdateInvestor(dto);
            return result
                ? Ok(new { success = true, message = "Investor updated successfully" })
                : BadRequest(new { success = false, message = "Update failed" });
        }

        // ===============================
        // ✅ GET INVESTOR BY EMAIL
        // ===============================
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetByEmail(string email)
        {
            var investor = await _service.GetInvestorByEmail(email);
            return investor == null
                ? NotFound(new { success = false, message = "Investor not found" })
                : Ok(new { success = true, data = investor });
        }

        // ===============================
        // ✅ GET INVESTOR BY ID
        // ===============================
        [Authorize(Roles = "Investor,Admin,FundManager")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var investor = await _service.GetInvestorById(id);
            return investor == null
                ? NotFound(new { success = false, message = "Investor not found" })
                : Ok(new { success = true, data = investor });
        }

        // ===============================
        // ✅ GET ALL INVESTORS
        // ===============================
        [Authorize(Roles = "Admin,FundManager")]
        [HttpGet("GetAllInvestor")]
        public async Task<IActionResult> GetAllInvestorDetails()
        {
            var investors = await _service.GetAllInvestorDetailsAsync();

            if (investors == null || !investors.Any())
                return NotFound(new { success = false, message = "No investor details found" });

            return Ok( investors );
        }

        [HttpPost("check-duplicates")]
        public async Task<IActionResult> CheckDuplicateInvestor([FromBody] InvestorDuplicateCheckDTO dto)
        {
            if (string.IsNullOrEmpty(dto.AadhaarNo) &&
                string.IsNullOrEmpty(dto.PanNo) &&
                string.IsNullOrEmpty(dto.Mobile) &&
                string.IsNullOrEmpty(dto.Email))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Please provide at least one field (Aadhaar, PAN, Email, or Mobile)."
                });
            }

            var (success, message) = await _service.CheckDuplicateInvestorAsync(dto);

            return Ok(new
            {
                success,
                message
            });
        }


    }
}
