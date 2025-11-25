using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IRepository
{
    public interface INotificationRepo
    {
        Task<Notification> AddNotificationAsync(Notification notification);
        Task<List<Notification>> GetNotificationsByInvestorIdAsync(Guid publicInvestorId);
        Task<bool> MarkAsReadAsync(int notificationId);

    }
}
