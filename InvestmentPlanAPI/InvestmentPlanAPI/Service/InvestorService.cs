using System.Text.RegularExpressions;
using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Repository;
using InvestmentPlanAPI.Utils;
using Microsoft.Extensions.Configuration;

namespace InvestmentPlanAPI.Service
{
    public class InvestorService : IInvestorService
    {
        private readonly IInvestorRepo _repo;
        private readonly IWebHostEnvironment _env;
        private IConfiguration _configuration;

        public InvestorService(
            IInvestorRepo repo,
            IWebHostEnvironment env,
            IConfiguration configuration
        )
        {
            _repo = repo;
            _env = env;
            _configuration = configuration;
        }

        public async Task<Investor?> LoginInvestor(InvestorLoginDTO dto)
        {
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                throw new ArgumentException("Email and Password are required.");

            var investor = new Investor { Email = dto.Email, Password = dto.Password };
            var found = await _repo.LoginInvestor(investor);

            if (found == null)
                throw new Exception("Invalid credentials.");
            return found;
        }

        public async Task<bool> SignUpInvestor(InvestorsSignUpDTO dto)
        {
            ValidateSignup(dto);

            if (dto.InvestorImage == null)
                throw new Exception("Investor image is required.");
            if (dto.Signature == null)
                throw new Exception("Signature is required.");
            if (dto.IncomeProof == null)
                throw new Exception("Income proof PDF is required.");
            if (dto.SignedDocument == null)
                throw new Exception("Signed document PDF is required.");

            var existingInvestor = await _repo.FindIfDetailsExist(
                dto.AadhaarNo,
                dto.PanNo,
                dto.Mobile
            );

            if (existingInvestor != null)
            {
                if (existingInvestor.AadhaarNo == dto.AadhaarNo)
                    throw new Exception(
                        "This Aadhaar number is already registered with another investor."
                    );
                if (existingInvestor.PanNo == dto.PanNo)
                    throw new Exception(
                        "This PAN number is already registered with another investor."
                    );
                if (existingInvestor.Mobile == dto.Mobile)
                    throw new Exception(
                        "This mobile number is already registered with another investor."
                    );
            }

            // ---------- 1️⃣ Create Structured Upload Directories ----------
            string baseDir = Path.Combine(_env.ContentRootPath, "uploads");
            string incomeDir = Path.Combine(baseDir, "income");
            string signedDir = Path.Combine(baseDir, "signedDoc");

            Directory.CreateDirectory(incomeDir);
            Directory.CreateDirectory(signedDir);

            string incomeProofPath = Path.Combine(incomeDir, $"income_{Guid.NewGuid()}.pdf");
            string signedDocPath = Path.Combine(signedDir, $"signedDoc_{Guid.NewGuid()}.pdf");

            using (var stream = new FileStream(incomeProofPath, FileMode.Create))
                await dto.IncomeProof.CopyToAsync(stream);

            using (var stream = new FileStream(signedDocPath, FileMode.Create))
                await dto.SignedDocument.CopyToAsync(stream);

            byte[] investorImageBytes;
            using (var ms = new MemoryStream())
            {
                await dto.InvestorImage.CopyToAsync(ms);
                investorImageBytes = ms.ToArray();
            }

            byte[] signatureBytes;
            using (var ms = new MemoryStream())
            {
                await dto.Signature.CopyToAsync(ms);
                signatureBytes = ms.ToArray();
            }

            var investor = new Investor
            {
                InvestorName = dto.InvestorName!,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = 2,
            };

            var invDetails = new InvestorDetails
            {
                PublicInvestorId = investor.PublicInvestorId,
                Mobile = dto.Mobile,
                AadhaarNo = dto.AadhaarNo,
                PanNo = dto.PanNo,
                Age = dto.Age,
                InvestorImage = investorImageBytes,
                Signature = signatureBytes,
                IncomeProof = incomeProofPath,
                SignedDocument = signedDocPath,
                BankName = dto.BankName,
                Fund = dto.Fund,
                NomineeName = dto.NomineeName,
                NomineeEmail = dto.NomineeEmail,
                NomineeRelation = dto.NomineeRelation,
            };

            var isSaved = await _repo.SignUpInvestor(investor, invDetails);

            // ---------- 6️⃣ Send Confirmation Email ----------
            if (isSaved)
            {
                try
                {
                    byte[] pdfBytes = await File.ReadAllBytesAsync(signedDocPath);

                    // 🧩 Build template placeholders
                    var placeholders = new Dictionary<string, string>
                    {
                        { "UserName", dto.InvestorName },
                        {
                            "Message",
                            "We’re excited to have you on board and look forward to supporting your investment journey."
                        },
                    };
                    var emailSender = new SendEmail(_configuration);
                    // 📨 Send templated email with PDF
                    await Task.Run(() =>
                        emailSender.SendMailWithPdf(
                            dto.Email,
                            "Welcome to Investment Plan – Account Created Successfully",
                            "InvestmentSignUp.html",
                            placeholders,
                            pdfBytes,
                            "Signed_Registration_Document.pdf"
                        )
                    );
                    Console.WriteLine($" -- New registration Email: {dto.Email}");
                    Console.WriteLine($"Input Password: {dto.Password}");
                    Console.WriteLine($"DB Password: {dto.Password}");

                    Console.WriteLine($"✅ Registration email with PDF sent to {dto.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Email Error]: {ex.Message}");
                }
            }

            return isSaved;
        }

        public async Task<bool> UpdateInvestor(InvestorsUpdDTO dto)
        {
            if (dto.PublicInvestorId == Guid.Empty)
                throw new ArgumentException("Investor id is required to update investor.");

            var investor = await _repo.GetInvestorById(dto.PublicInvestorId);
            if (investor == null)
                throw new Exception("Investor not found.");

            var invDetails = await _repo.GetInvestorDetailsById(investor.PublicInvestorId);
            if (invDetails == null)
                throw new Exception("Investor details not found.");

            if (!string.IsNullOrEmpty(dto.InvestorName))
                investor.InvestorName = dto.InvestorName;
            if (!string.IsNullOrEmpty(dto.Email))
                investor.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.Password))
                investor.Password = dto.Password;
            if (!string.IsNullOrEmpty(dto.Mobile))
                invDetails.Mobile = dto.Mobile;
            if (dto.Age.HasValue)
                invDetails.Age = dto.Age.Value;
            if (dto.Fund.HasValue)
                invDetails.Fund = dto.Fund.Value;
            if (!string.IsNullOrEmpty(dto.NomineeName))
                invDetails.NomineeName = dto.NomineeName;
            if (!string.IsNullOrEmpty(dto.NomineeEmail))
                invDetails.NomineeEmail = dto.NomineeEmail;
            if (!string.IsNullOrEmpty(dto.NomineeRelation))
                invDetails.NomineeRelation = dto.NomineeRelation;

            return await _repo.UpdateInvestor(investor, invDetails);
        }

        public async Task<Investor?> GetInvestorByEmail(string email)
        {
            return await _repo.GetInvestorByEmail(email);
        }

        public async Task<Investor?> GetInvestorById(Guid publicInvestorId)
        {
            return await _repo.GetInvestorById(publicInvestorId);
        }

        public async Task<InvestorDetails?> GetInvestorDetailsById(Guid publicInvestorId)
        {
            return await _repo.GetInvestorDetailsById(publicInvestorId);
        }

        public async Task<bool> ChangePassword(Guid publicInvestorId, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
                throw new ArgumentException("Password must be at least 6 characters.");
            return await _repo.ChangePassword(publicInvestorId, newPassword);
        }

        public async Task<IEnumerable<Investor>> GetAllInvestorDetailsAsync()
        {
            var inv = await _repo.GetAllInvestorDetailsAsync();
            Console.WriteLine("All investors : ", inv);
            return inv;
        }

        private void ValidateSignup(InvestorsSignUpDTO dto)
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            var mobileRegex = new Regex(@"^[6-9]\d{9}$");
            var panRegex = new Regex(@"^[A-Z]{5}[0-9]{4}[A-Z]$");
            var aadhaarRegex = new Regex(@"^\d{12}$");

            if (!emailRegex.IsMatch(dto.Email))
                throw new ArgumentException("Invalid email format.");
            if (!mobileRegex.IsMatch(dto.Mobile))
                throw new ArgumentException("Invalid mobile number.");
            if (!panRegex.IsMatch(dto.PanNo))
                throw new ArgumentException("Invalid PAN number.");
            if (!aadhaarRegex.IsMatch(dto.AadhaarNo))
                throw new ArgumentException("Invalid Aadhaar number.");
            if (dto.Age < 18)
                throw new ArgumentException("Investor must be at least 18 years old.");
            if (dto.Fund < 1000)
                throw new ArgumentException("Minimum fund amount is 1000.");
        }

        public async Task<(bool success, string message)> CheckDuplicateInvestorAsync(
            InvestorDuplicateCheckDTO dto
        )
        {
            var message = await _repo.CheckInvestorDetailsExistAsync(
                dto.AadhaarNo,
                dto.PanNo,
                dto.Mobile,
                dto.Email
            );
            bool allUnique = message == "All details are unique.";
            return (allUnique, message);
        }
    }
}
