using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Models.Enums;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/admin/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,FundManager")]

    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
     
        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
           
        }
        [HttpGet("investors/unverified")]
        public async Task<IActionResult> FetchAllUnverifiedInvestors()
        {
            var investors = await _adminService.FetchAllUnverifiedInvestors();
            if (!investors.Any())
                return Ok(new { success = false,message = "No unverified investors found." });

           
            return Ok(investors);
        }

        [HttpGet("funds/unverified")]
        public async Task<IActionResult> FetchAllUnverifiedFunds()
        {
            var funds = await _adminService.FetchAllUnverifiedFunds();
            if (!funds.Any())
                return Ok(new { success = false, message = "No unverified funds found." });

            return Ok(funds);
        }


        [HttpPut("investor/status")]
        public async Task<IActionResult> ToggleUserStatus(Guid guid, VerificationStatus status)
        {
            var success = await _adminService.ToggleUserStatus(guid, status);
            if (!success)
                return NotFound(new {success=false, message = "Investor not found" });

            return Ok(new { success=true,message = "User verification status updated successfully to "+status });
        }
        
        [HttpPut("fund/status")]
        public async Task<IActionResult> ToggleFundStatus(int fundId, VerificationStatus status)
        {
            var success = await _adminService.UpdateStatus(fundId, status);
            if (success == null)
                return NotFound(new { success = false, message = "Fund not found" });

            return Ok(new { success = true, message = "Fund verification status updated successfully to " + status });
        }
    }

}
