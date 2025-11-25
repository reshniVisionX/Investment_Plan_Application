using InvestmentPlanAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class UpdPortFolioDTO
    {
        public int PortfolioId { get; set; }     
        public int StockId { get; set; }

        public int? Quantity { get; set; }

        public int? TotalShares { get; set; }

   
        public decimal? AvgBuyPrice { get; set; }

     
        public DateTime? BoughtAt { get; set; } = DateTime.UtcNow;
    }
}
