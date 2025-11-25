using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;
using BCrypt.Net;

namespace InvestmentPlanAPI.Repository
{
    public class InvestorRepository : IInvestorRepo
    {
        private readonly DBContext _context;

        public InvestorRepository(DBContext context)
        {
            _context = context;
        }

        public async Task<Investor?> LoginInvestor(Investor investor)
        {
            var investor1 = await _context.Investors
                .Include(i => i.InvestorDetail)
                .Include(e => e.Roles)
                .FirstOrDefaultAsync(i => i.Email == investor.Email);

            if (investor1 == null)
                throw new Exception("Investor not found.");
            if(investor1.VerificationStatus== Models.Enums.VerificationStatus.Rejected)
                throw new Exception("Your registration has been rejected. Please contact admin for more information.");
            if(investor1.VerificationStatus== Models.Enums.VerificationStatus.Pending)
                throw new Exception("Your registration is still pending. Please wait for admin approval.");

            var inputPassword = investor.Password?.Trim() ?? string.Empty;
            var storedHash = investor1.Password?.Trim() ?? string.Empty;

            bool isValid = BCrypt.Net.BCrypt.Verify(inputPassword, storedHash);
            Console.WriteLine($"Input: {inputPassword}, Hash: {storedHash}, Verified: {isValid}");

            if (!isValid)
                throw new Exception("Invalid password.");

            return investor1;
        }



        public async Task<bool> SignUpInvestor(Investor investor, InvestorDetails inv)
            {
                await _context.Investors.AddAsync(investor);
                await _context.InvestorDetails.AddAsync(inv);
                return await _context.SaveChangesAsync() > 0;
            }

            public async Task<bool> UpdateInvestor(Investor investor, InvestorDetails inv)
            {
                _context.Investors.Update(investor);
                _context.InvestorDetails.Update(inv);
                return await _context.SaveChangesAsync() > 0;
            }

            public async Task<Investor?> GetInvestorByEmail(string email)
            {
                return await _context.Investors
                    .Include(i => i.InvestorDetail)
                    .FirstOrDefaultAsync(i => i.Email == email);
            }

            public async Task<Investor?> GetInvestorById(Guid publicInvestorId)
            {
                return await _context.Investors
                    .Include(i => i.InvestorDetail)
                    .FirstOrDefaultAsync(i => i.PublicInvestorId == publicInvestorId);
            }

            public async Task<InvestorDetails?> GetInvestorDetailsById(Guid publicInvestorId)
            {
                return await _context.InvestorDetails
                    .FirstOrDefaultAsync(d => d.PublicInvestorId == publicInvestorId);
            }
        public async Task<IEnumerable<Investor>> GetAllInvestorDetailsAsync()
        {
            return await _context.Investors.Include(e=>e.InvestorDetail)
                .ToListAsync();
        }


        public async Task<bool> ChangePassword(Guid publicInvestorId, string newPassword)
            {
                var investor = await _context.Investors.FindAsync(publicInvestorId);
                if (investor == null) return false;
                investor.Password = newPassword;
                return await _context.SaveChangesAsync() > 0;
            }

        public async Task UpdateInvestorAsync(Investor investor)
        {
            _context.Investors.Update(investor);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateInvestorDetailsAsync(InvestorDetails details)
        {
            _context.InvestorDetails.Update(details);
            await _context.SaveChangesAsync();
        }
        public async Task<InvestorDetails?> FindIfDetailsExist(string aadhaarNo, string panNo, string mobile)
        {
            return await _context.InvestorDetails
                .FirstOrDefaultAsync(x => x.AadhaarNo == aadhaarNo || x.PanNo == panNo || x.Mobile == mobile);
        }

        public async Task<string> CheckInvestorDetailsExistAsync(
     string aadhaarNo,
     string panNo,
     string mobile,
     string email)
        {
            var duplicateFields = new List<string>();

            // Aadhaar, PAN, and Mobile — check in InvestorDetails
            if (await _context.InvestorDetails.AnyAsync(x => x.AadhaarNo == aadhaarNo))
                duplicateFields.Add("Aadhaar Number");

            if (await _context.InvestorDetails.AnyAsync(x => x.PanNo == panNo))
                duplicateFields.Add("PAN Number");

            if (await _context.InvestorDetails.AnyAsync(x => x.Mobile == mobile))
                duplicateFields.Add("Mobile Number");

            // Email — check in Investors
            if (await _context.Investors.AnyAsync(i => i.Email == email))
                duplicateFields.Add("Email Address");

            // Build message
            if (duplicateFields.Count == 0)
                return "All details are unique.";

            string message = string.Join(", ", duplicateFields);
            return $"{message} already registered.";
        }




    }
}

