using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Interface.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/transaction/[controller]")]
    [ApiController]
    [Authorize(Roles = "Investor,Admin,FundManager")]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _service;

        public TransactionController(ITransactionService service)
        {
            _service = service;
        }

        // ===============================
        // ✅ PROCESS TRANSACTION
        // ===============================
        [HttpPost("purchaseStock")]
        public async Task<IActionResult> ProcessTransaction([FromBody] TransactionRequestDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid transaction data.", errors = ModelState });

            var result = await _service.HandleTransactionAsync(dto);

            return Ok(new
            {
                success = true,
                message = "Transaction processed successfully.",
                data = result
            });
        }

        // ===============================
        // ✅ GET ALL TRANSACTIONS
        // ===============================
        [HttpGet("GetAllStockTransaction")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var transactions = await _service.GetAllTransactionsAsync();

            if (transactions == null || !transactions.Any())
                return NotFound(new { success = false, message = "No transactions found." });

            return Ok(new { success = true, data = transactions });
        }

        // ===============================
        // ✅ GET TRANSACTIONS BY INVESTOR
        // ===============================
        [HttpGet("investor/{investorId:guid}")]
        public async Task<IActionResult> GetStockTransactionsByInvestor(Guid investorId)
        {
            var transactions = await _service.GetStockTransactionsByInvestorAsync(investorId);

            if (transactions == null || !transactions.Any())
                return NotFound(new
                {
                    success = false,
                    message = "No stock transactions found for this investor."
                });

            return Ok(new
            {
                success = true,
                count = transactions.Count(),
                data = transactions
            });
        }


        // Post Fund purchase by investor

        [HttpPost("fund/purchase")]
        public async Task<IActionResult> PurchaseFund([FromBody] FundInvestDTO dto)
        {
           

            // Validate request body early
            if (dto == null)
                return BadRequest(new { success = false, message = "Investment request cannot be null." });

            // Basic field checks (the rest are handled in service)
            if (dto.TransactionAmount <= 0)
                return BadRequest(new { success = false, message = "Investment amount must be greater than zero." });

            // --- Service call (exceptions handled by middleware globally) ---
            var result = await _service.InvestorsFundPurchase(dto);

            if (result)
            {
                

                return Ok(new
                {
                    success = true,
                    message = "Fund purchase completed successfully."
                });
            }

            return BadRequest(new { success = false, message = "Fund purchase failed." });
        }

        [HttpGet("fundTransaction/all")]
        public async Task<IActionResult> GetAllFundTransactions()
        {
            

            var transactions = await _service.FetchAllFundTransactionAsync();

            return Ok(new
            {
                success = true,
                count = transactions.Count(),
                data = transactions
            });
        }

        [HttpGet("fundTrans/ByInvestor/{investorId:guid}")]
        public async Task<IActionResult> GetFundTransactionsByInvestor(Guid investorId)
        {
            var transactions = await _service.GetFundTransactionsByInvestorAsync(investorId);

            if (transactions == null || !transactions.Any())
                return NotFound(new
                {
                    success = false,
                    message = "No fund transactions found for this investor."
                });

            return Ok(new
            {
                success = true,
                count = transactions.Count(),
                data = transactions
            });
        }


    }
}
