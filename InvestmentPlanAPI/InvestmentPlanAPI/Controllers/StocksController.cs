using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Investor,Admin,FundManager")]
    public class StocksController : ControllerBase
    {
        private readonly IStockService _service;

        private readonly IFundService _fundService;
        public StocksController(IStockService service, IFundService fundService )
        {
            _service = service;
            _fundService = fundService;
        }

        // ---------------- STOCK ------------------

        [HttpPost("stock/create-stock")]
        public async Task<IActionResult> CreateStock([FromBody] CreateStockDTO dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Stock details are required." });

            var result = await _service.InsertIntoStock(dto);

            return Ok(new
            {
                success = true,
                message = "Stock created successfully.",
                data = result
            });
        }

        [HttpPut("stock/update-stock")]
        public async Task<IActionResult> UpdateStock([FromBody] UpdateStockDTO dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Update details are required." });

            var result = await _service.UpdateStock(dto);

            return Ok(new
            {
                success = true,
                message = "Stock updated successfully.",
                data = result
            });
        }

        [HttpDelete("stock/{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            var result = await _service.DeleteStock(id);

            return Ok(new
            {
                success = true,
                message = "Stock deleted successfully.",
                data = result
            });
        }

        [HttpGet("stock/allStocks")]
        public async Task<IActionResult> GetAllStocks()
        {
            var stocks = await _service.GetAllStocks();

            if (stocks == null || !stocks.Any())
                return NotFound(new { success = false, message = "No stocks found." });

            return Ok(new { success = true, data = stocks });
        }

        [HttpGet("stock/{id}")]
        public async Task<IActionResult> GetStockById(int id)
        {
            var stock = await _service.GetStockById(id);

            if (stock == null)
                return NotFound(new { success = false, message = $"Stock with ID {id} not found." });

            return Ok(new { success = true, data = stock });
        }

        // ---------------- PORTFOLIO ------------------

        [HttpPost("portfolio/create-portfolio")]
        public async Task<IActionResult> CreatePortfolio([FromBody] CreatePortFolioDTO dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Portfolio details are required." });

            var result = await _service.InsertIntoPortfolio(dto);

            return Ok(new
            {
                success = true,
                message = "Portfolio created successfully.",
                data = result
            });
        }

        [HttpPut("portfolio/update-portfolio/{investorId}")]
        public async Task<IActionResult> UpdatePortfolio(Guid investorId, [FromBody] UpdPortFolioDTO dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Portfolio update details are required." });

            var result = await _service.UpdatePortfolio(investorId, dto);

            return Ok(new
            {
                success = true,
                message = "Portfolio updated successfully.",
                data = result
            });
        }

        [HttpDelete("portfolio/{id}")]
        public async Task<IActionResult> DeletePortfolio(int id)
        {
            var result = await _service.DeletePortfolio(id);

            return Ok(new
            {
                success = true,
                message = "Portfolio deleted successfully.",
                data = result
            });
        }

        [HttpGet("portfolio/investor/{id}")]
        public async Task<IActionResult> GetPortfolioByInvestor(Guid id)
        {
            var result = await _service.GetAllPortfolioForInvestor(id);

            if (result == null || !result.Any())
                return NotFound(new { success = false, message = "No portfolios found for this investor." });

            return Ok(new { success = true, data = result });
        }

        [HttpGet("investor/complete-portfolio/{publicInvestorId:guid}")]
        public async Task<IActionResult> GetCompletePortfolioForInvestor(Guid publicInvestorId)
        {
            var stocks = await _service.GetAllPortfolioForInvestor(publicInvestorId)
                    ?? Enumerable.Empty<InvestorPortfolioDTO>();

            var funds = await _fundService.GetFundsByInvestorIdAsync(publicInvestorId)
                          ?? Enumerable.Empty<FundsOfInvestorDTO>();

            return Ok(new
            {
                success = true,
                stockCount = stocks.Count(),
                mutualFundCount = funds.Count(),
                data = new
                {
                    stocks,
                    mutualFunds = funds
                }
            });
        }


    }
}
