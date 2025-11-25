using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.Models
{
    public class InvestorDetails
    {
        [Key]
        public int InvId { get; set; }

        [ForeignKey(nameof(Investor))]
        [Required]
        public byte[] InvestorImage { get; set; } // Profile picture
        public Guid PublicInvestorId { get; set; }
        [Required, MaxLength(10)]
        public string Mobile { get; set; }

        [Required, MaxLength(12)]
        public string AadhaarNo { get; set; }

        [Required, MaxLength(10)]
        public string PanNo { get; set; }

        [Range(18, 100)]
        public int Age { get; set; }
        [Required]
        public byte[] Signature { get; set; } // Path to image
        [Required]
        public string IncomeProof { get; set; } // PDF path

        [MaxLength(100)]
        public string BankName { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fund { get; set; }
        [Required]
        public string SignedDocument { get; set; } // PDF path

        [MaxLength(50)]
        public string? NomineeName { get; set; }

        [EmailAddress]
        public string? NomineeEmail { get; set; }

        [MaxLength(50)]
        public string? NomineeRelation { get; set; }

        public Investor? Investor { get; set; }
    }
}
