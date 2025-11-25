using InvestmentPlanAPI.DTOs.AdminDTO;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InvestmentPlanAPI.Controllers
{
    [Route("api/notification/[controller]")]
    [ApiController]
  
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        [Authorize(Roles = "Investor")]
        [HttpGet("investor/{publicInvestorId:guid}")]
        public async Task<IActionResult> GetNotifications(Guid publicInvestorId)
        {
            var notifications = await _notificationService.GetNotificationsAsync(publicInvestorId);

            return Ok(new
            {
                success = true,
                data = notifications
            });
        }
        [Authorize(Roles = "Investor,Admin,FundManager")]
        [HttpPost("postNotify")]
        public async Task<IActionResult> PostNotification([FromBody] NotificationDTO dto)
        {
            if (dto == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid request body."
                });
            }

            var saved = await _notificationService.CreateNotificationAsync(dto.PublicInvestorId, dto.Message);

            return Ok(new
            {
                success = true,
                message = "Notification sent successfully.",
                data = saved
            });
        }
    }
}
