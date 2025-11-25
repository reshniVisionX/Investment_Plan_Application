using Microsoft.AspNetCore.Http;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class InvestorsSignUpDTO
    {
        public string? InvestorName { get; set; }

        public IFormFile? InvestorImage { get; set; }   // 👈 image file (will be converted to byte[])
        public IFormFile? Signature { get; set; }       // 👈 signature file (also byte[])

        public string Email { get; set; }
        public string Password { get; set; }
        public string Mobile { get; set; }
        public string AadhaarNo { get; set; }
        public string PanNo { get; set; }
        public int Age { get; set; }

        public IFormFile? IncomeProof { get; set; }     // 👈 PDF → stored as path
        public IFormFile? SignedDocument { get; set; }  // 👈 PDF → stored as path

        public string BankName { get; set; }
        public decimal Fund { get; set; }

        public string? NomineeName { get; set; }
        public string? NomineeEmail { get; set; }
        public string? NomineeRelation { get; set; }
    }
}
