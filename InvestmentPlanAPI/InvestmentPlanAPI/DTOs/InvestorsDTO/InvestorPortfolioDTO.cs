using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class InvestorPortfolioDTO
    {
        public int PortfolioId { get; set; }
        public Guid PublicInvestorId { get; set; }
        public int StockId { get; set; }

        public int Quantity { get; set; }

        public decimal AvgBuyPrice { get; set; }

        public DateTime BoughtAt { get; set; } 
        public string StockSymbol { get; set; }

        public string CompanyName { get; set; }

        public StockSector Sector { get; set; } 

        public decimal CurrentMarketPrice { get; set; }
        public decimal CurrentValue { get; set; }
        public decimal ProfitLoss { get; set; }



    }
}
