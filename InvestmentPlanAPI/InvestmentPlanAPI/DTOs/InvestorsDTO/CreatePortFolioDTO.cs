using InvestmentPlanAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.InvestorsDTO
{
    public class CreatePortFolioDTO
    {
        public Guid PublicInvestorId { get; set; }
        public int StockId { get; set; }

        public int Quantity { get; set; }

        public int TotalShares { get; set; }

        public decimal AvgBuyPrice { get; set; }

        public decimal? CurrentValue { get; set; }

        public decimal? ProfitLoss { get; set; }

    }
}
