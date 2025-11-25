using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [ApiController]
    [Route("api/fund/[controller]")]
    [Authorize]
    public class FundsController : ControllerBase
    {
        private readonly IFundService _fundService;

        public FundsController(IFundService fundService)
        {
            _fundService = fundService;
        }

     
        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateFundPlan([FromForm] CreateFundPlanDTO dto)
        {
          
                var result = await _fundService.CreateFundPlanAsync(dto);
                return Ok(new { success = true, message = "Mutual fund created successfully." });
          
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateFundPlan([FromBody] UpdateFundPlanDTO dto)
        {
            var result = await _fundService.UpdateFundPlanAsync(dto);
            if (!result)
                return NotFound(new { success = false, exception = "Fund not found." });

            return Ok(new { success = true, message = "Mutual fund updated successfully." });
        }

     

        [HttpGet("id/{fundId}")]
        public async Task<IActionResult> GetFundById(int fundId)
        {
            var fund = await _fundService.GetFundByIdAsync(fundId);
            if (fund == null)
                return NotFound(new { success = false, exception = $"Fund with ID {fundId} not found." });

            return Ok(new { success = true, data = fund });
        }

        [HttpGet("allFunds")]
        public async Task<IActionResult> GetAllFunds()
        {
            var funds = await _fundService.GetAllFundsAsync();
            return Ok(new { success = true, data = funds });
        }
        [HttpGet("investments/{publicInvestorId:guid}")]
        public async Task<IActionResult> GetFundsByInvestorId(Guid publicInvestorId)
        {
             var funds = await _fundService.GetFundsByInvestorIdAsync(publicInvestorId);

            if (!funds.Any())
                return NotFound(new { success = false, message = "No mutual fund investments found for this investor." });

            return Ok(new
            {
                success = true,
                count = funds.Count(),
                data = funds
            });
        }
    }
}
