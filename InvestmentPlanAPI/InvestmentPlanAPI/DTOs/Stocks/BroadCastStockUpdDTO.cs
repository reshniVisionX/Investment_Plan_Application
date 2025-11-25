using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.Stocks
{
    public class BroadCastStockUpdDTO
    {
        public int StockId { get; set; }      
        public StockSector Sector { get; set; } = StockSector.NSE;

        public decimal CurrentMarketPrice { get; set; }

        public int TotalShares { get; set; }

        public long VolumeTraded { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;


    }
}
