using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace InvestmentPlanAPI.Hubs
{
    public class NotificationHub : Hub
    {
        private static readonly ConcurrentDictionary<Guid, string> ConnectedInvestors = new();

        public async Task RegisterInvestor(Guid investorId)
        {
            
            if (investorId == Guid.Empty)
                return;

            ConnectedInvestors[investorId] = Context.ConnectionId;
            Console.WriteLine($" Investor {investorId} connected [{Context.ConnectionId}]");
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var disconnected = ConnectedInvestors.FirstOrDefault(x => x.Value == Context.ConnectionId);
            if (!disconnected.Equals(default(KeyValuePair<Guid, string>)))
                ConnectedInvestors.TryRemove(disconnected.Key, out _);

            await base.OnDisconnectedAsync(exception);
        }
      
        public static string? GetConnectionId(Guid investorId)
        {
            ConnectedInvestors.TryGetValue(investorId, out var connectionId);
            return connectionId;
        }


        
        public async Task SubscribeStock(int stockId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Stock-{stockId}");
            Console.WriteLine($" {Context.ConnectionId} subscribed to Stock-{stockId}");
        }

        public async Task UnsubscribeStock(int stockId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Stock-{stockId}");
            Console.WriteLine($" {Context.ConnectionId} unsubscribed from Stock-{stockId}");
        }

        public async Task SubscribeFund(int fundId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Fund-{fundId}");
            Console.WriteLine($" {Context.ConnectionId} subscribed to Fund-{fundId}");
        }

        public async Task UnsubscribeFund(int fundId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Fund-{fundId}");
            Console.WriteLine($" {Context.ConnectionId} unsubscribed from Fund-{fundId}");
        }


        public async Task BroadcastStockUpdate(int stockId, object update)
        {
            await Clients.Group($"Stock-{stockId}").SendAsync("StockUpdated", update);
            Console.WriteLine($" --Sent Stock Update to Group [Stock-{stockId}]");
        }

        public async Task BroadcastFundUpdate(int fundId, object update)
        {
            await Clients.Group($"Fund-{fundId}").SendAsync("FundUpdated", update);
            Console.WriteLine($" --Sent Fund Update to Group [Fund-{fundId}]");
        }

        public async Task SendNotification(Guid investorId, object notification)
        {
            if (ConnectedInvestors.TryGetValue(investorId, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("NotificationReceived", notification);
                Console.WriteLine($" --Sent personal notification to Investor {investorId}");
            }
        }
    }
}
