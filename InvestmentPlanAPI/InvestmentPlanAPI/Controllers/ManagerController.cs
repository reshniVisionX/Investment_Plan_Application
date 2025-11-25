using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.ManagerDTO;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/manager/[controller]")]
    [ApiController]
  
    public class ManagerController : ControllerBase
    {
        private readonly IManagerService _service;

        public ManagerController(IManagerService service)
        {
            _service = service;
        }
        [Authorize(Roles = "Admin,FundManager")]
        [HttpGet("fund-reports")]
        public async Task<ActionResult<IEnumerable<AllFundReportsDTO>>> GetAllFundReports()
        {
            var result = await _service.GetAllFundReportsAsync();
            return Ok(result);
        }
        [Authorize(Roles = "Admin,FundManager")]
        [HttpPost("settle-fund/{fundId}")]
        public async Task<ActionResult> SettleFund(int fundId)
        {
            bool result = await _service.SettleFundAsync(fundId);
            return result ? Ok("Fund settled successfully") : BadRequest("Failed to settle fund");
        }
        [Authorize(Roles = "Investor")]
        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemInvestorFund([FromBody] RedeemFundDTO dto)
        {
            bool result = await _service.RedeemInvestorFundAsync(dto);
            return Ok(new
            {
                success = true,
                message = "Redeem processed successfully.",
                data = result
            });
        }
    }
}
