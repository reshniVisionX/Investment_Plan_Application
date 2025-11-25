using InvestmentPlanAPI.Data;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Repository
{
    public class NotificationRepository:INotificationRepo
    {
        private readonly DBContext _context;

        public NotificationRepository(DBContext context)
        {
            _context = context;
        }

        public async Task<Notification> AddNotificationAsync(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        // Get all notifications for a single investor
        public async Task<List<Notification>> GetNotificationsByInvestorIdAsync(Guid publicInvestorId)
        {
            return await _context.Notifications
                .Where(n => n.PublicInvestorId == publicInvestorId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // Mark a notification as read
        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notif = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId);

            if (notif == null)
                return false;

            notif.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
