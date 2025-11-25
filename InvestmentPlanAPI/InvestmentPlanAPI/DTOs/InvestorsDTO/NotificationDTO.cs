using System.ComponentModel.DataAnnotations;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class NotificationDTO
    {
        public int NotificationId { get; set; }
        public Guid PublicInvestorId { get; set; }

        public bool IsRead { get; set; } = false;

        
        public string? Message { get; set; }


        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
