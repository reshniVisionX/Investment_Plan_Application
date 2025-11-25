using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface IInvestorRepo
    {
        Task<Investor?> LoginInvestor(Investor investor);       
        Task<bool> SignUpInvestor(Investor investor,InvestorDetails inv);
        Task<bool> UpdateInvestor(Investor investor, InvestorDetails inv);
        Task<Investor?> GetInvestorByEmail(string email);
        Task<Investor?> GetInvestorById(Guid publicInvestorId);        
        Task<InvestorDetails?> GetInvestorDetailsById(Guid publicInvestorId);
        Task<bool> ChangePassword(Guid publicInvestorId, string newPassword);
        Task<IEnumerable<Investor>> GetAllInvestorDetailsAsync();

        Task UpdateInvestorAsync(Investor investor);
        Task<InvestorDetails?> FindIfDetailsExist(string aadhaarNo, string panNo,string mob);

        Task<string> CheckInvestorDetailsExistAsync(string aadhaarNo, string panNo, string mobile, string email);

        Task UpdateInvestorDetailsAsync(InvestorDetails details);
       

    }
}
