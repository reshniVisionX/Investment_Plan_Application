using System.ComponentModel.DataAnnotations;

namespace InvestmentPlanAPI.Models
{
    public class Roles
    {
        [Key]
        public int RoleId { get; set; }
        [Required, MaxLength(30)]
        public string RoleName { get; set; }

        public string ? Description { get; set; } = null;
    }
}
