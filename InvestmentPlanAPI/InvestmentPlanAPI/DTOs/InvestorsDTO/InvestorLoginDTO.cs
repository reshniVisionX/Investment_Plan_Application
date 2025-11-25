using System.ComponentModel.DataAnnotations;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class InvestorLoginDTO
    {
        public string? InvestorName { get; set; }
       
        public string Email { get; set; }
    
        public string Password { get; set; }

    }
}
