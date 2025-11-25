using InvestmentPlanAPI.DTOs.InvestorsDTO;
using InvestmentPlanAPI.Hubs;
using InvestmentPlanAPI.Interface.IRepository;
using InvestmentPlanAPI.Interface.IService;
using InvestmentPlanAPI.Models;
using InvestmentPlanAPI.Repository;
using Microsoft.AspNetCore.SignalR;

namespace InvestmentPlanAPI.Service
{
    public class NotificationService:INotificationService

        {
            private readonly INotificationRepo _notificationRepo;
        private readonly IHubContext<NotificationHub> _hubContext;
        public NotificationService(
                INotificationRepo notificationRepo, IHubContext<NotificationHub> hubContext
               )
            {
                _notificationRepo = notificationRepo;
                            _hubContext = hubContext;
            }

            public async Task<Notification> CreateNotificationAsync(Guid publicInvestorId, string message)
            {
                if (publicInvestorId == Guid.Empty)
                    throw new ArgumentException("Invalid investor ID.");

                if (string.IsNullOrWhiteSpace(message))
                    throw new ArgumentException("Message cannot be empty.");

                if (message.Length > 500)
                    throw new ArgumentException("Message exceeds the allowed limit of 500 characters.");

                var notification = new Notification
                {
                    PublicInvestorId = publicInvestorId,
                    Message = message.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                var saved = await _notificationRepo.AddNotificationAsync(notification);
            var connectionId = NotificationHub.GetConnectionId(publicInvestorId);
            if (!string.IsNullOrEmpty(connectionId))
            {
                var notificationDto = new NotificationDTO
                {
                    NotificationId = saved.NotificationId,                                              
                    PublicInvestorId = publicInvestorId,
                    Message = saved.Message,
                    IsRead = saved.IsRead,
                    CreatedAt = saved.CreatedAt
                };
                Console.WriteLine("Notification to : " + publicInvestorId);

                await _hubContext.Clients.Client(connectionId)
                    .SendAsync("NotificationReceived", notificationDto);
            }

            return saved;
        }


            // Get notifications for an investor
            public async Task<IEnumerable<Notification>> GetNotificationsAsync(Guid publicInvestorId)
            {
                return await _notificationRepo.GetNotificationsByInvestorIdAsync(publicInvestorId);
            }

            // Mark as read
            public async Task<bool> MarkNotificationAsReadAsync(int notificationId)
            {
                return await _notificationRepo.MarkAsReadAsync(notificationId);
            }


        }
    }
