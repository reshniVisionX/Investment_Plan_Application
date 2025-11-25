using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace InvestmentPlanAPI.Models
{
    public class Investor
    {
       
            [Key]

        public Guid PublicInvestorId { get; set; } = Guid.NewGuid(); 

        [Required, MaxLength(50)]
            public string InvestorName { get; set; }

            [Required, EmailAddress]
            public string Email { get; set; }

            [Required, MaxLength(505)]
            public string Password { get; set; }

          

        [Required]
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;

        [Required]
            public UserStatus Status { get; set; } = UserStatus.Active;

        [Required]
        [ForeignKey(nameof(Roles))]
        public int RoleId { get; set; }

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            // Relationships
            public Roles? Roles { get; set; }
        public  InvestorDetails? InvestorDetail { get; set; }
            public  ICollection<PortFolio>? Portfolios { get; set; }
            public  ICollection<InvestorsTransactions>? Transactions { get; set; }
            public  ICollection<MutualFundInvestment>? MutualFundInvestments { get; set; }
            public  ICollection<Notification>? Notifications { get; set; }

    }
}
