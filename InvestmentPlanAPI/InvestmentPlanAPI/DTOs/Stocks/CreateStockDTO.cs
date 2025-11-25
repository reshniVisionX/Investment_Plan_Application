using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.Stocks
{
    public class CreateStockDTO
    {
        public string StockSymbol { get; set; }
        public string CompanyName { get; set; }

        public StockSector Sector { get; set; } = StockSector.NSE;

      
        public decimal BasePrice { get; set; }

   
        public decimal CurrentMarketPrice { get; set; }

        public int TotalShares { get; set; }

        public long? VolumeTraded { get; set; }

        public DateTime ListedDate { get; set; }

    }
}
