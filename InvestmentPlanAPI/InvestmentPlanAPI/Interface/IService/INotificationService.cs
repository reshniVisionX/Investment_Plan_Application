using InvestmentPlanAPI.Models;

namespace InvestmentPlanAPI.Interface.IService
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(Guid publicInvestorId, string message);

        Task<IEnumerable<Notification>> GetNotificationsAsync(Guid publicInvestorId);
        Task<bool> MarkNotificationAsReadAsync(int notificationId);
    }
}
