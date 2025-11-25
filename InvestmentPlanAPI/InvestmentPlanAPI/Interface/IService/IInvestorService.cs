using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.DTOs.InvestorsDTO;
namespace InvestmentPlanAPI.Interface.IService
{
    public interface IInvestorService
    {
        Task<Investor?> LoginInvestor(InvestorLoginDTO investor); 
        Task<bool> SignUpInvestor(InvestorsSignUpDTO inv);
        Task<bool> UpdateInvestor(InvestorsUpdDTO inv); 
        Task<Investor?> GetInvestorByEmail(string email);
        Task<Investor?> GetInvestorById(Guid publicInvestorId);
        Task<InvestorDetails?> GetInvestorDetailsById(Guid publicInvestorId);
        Task<bool> ChangePassword(Guid publicInvestorId, string newPassword);
        Task<IEnumerable<Investor>> GetAllInvestorDetailsAsync();
        Task<(bool success, string message)> CheckDuplicateInvestorAsync(InvestorDuplicateCheckDTO dto);

    }
}
