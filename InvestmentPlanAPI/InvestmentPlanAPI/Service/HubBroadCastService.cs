using InvestmentPlanAPI.DTOs.MutualFundDTO;
using InvestmentPlanAPI.DTOs.Stocks;
using InvestmentPlanAPI.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace InvestmentPlanAPI.Service
{
    public class HubBroadCastService
    {
            private readonly IHubContext<NotificationHub> _hubContext;

            public HubBroadCastService(IHubContext<NotificationHub> hubContext)
            {
                _hubContext = hubContext;
            }

            public async Task BroadcastStockAsync(BroadCastStockUpdDTO stockDto)
            {
                await _hubContext.Clients
                    .Group($"Stock-{stockDto.StockId}")
                    .SendAsync("StockUpdated", stockDto);

                Console.WriteLine($"📊 STOCK UPDATE → Stock-{stockDto.StockId}");
            }

        
            public async Task BroadcastFundAsync(BroadCastFundUpdDTO fundDto)
            {
                await _hubContext.Clients
                    .Group($"Fund-{fundDto.FundId}")
                    .SendAsync("FundUpdated", fundDto);

                Console.WriteLine($"💹 FUND UPDATE → Fund-{fundDto.FundId}");
            }

     
            public async Task BroadcastStocksAsync(IEnumerable<BroadCastStockUpdDTO> stocks)
            {
                foreach (var s in stocks)
                    await BroadcastStockAsync(s);
            }

        
            public async Task BroadcastFundAndStocksAsync(
                BroadCastFundUpdDTO fund,
                IEnumerable<BroadCastStockUpdDTO> stocks)
            {
                await BroadcastFundAsync(fund);
                await BroadcastStocksAsync(stocks);
            }
        }
    }
