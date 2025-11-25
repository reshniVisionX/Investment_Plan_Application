using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }

        [ForeignKey(nameof(Investor))]
        public Guid PublicInvestorId { get; set; }

        public bool IsRead { get; set; } = false;

        [Required, MaxLength(500)]
        public string? Message { get; set; }

       
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Investor Investor { get; set; }
    }
}
