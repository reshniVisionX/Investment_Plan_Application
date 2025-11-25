using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.Stocks
{
    public class UpdateStockDTO
    {
        public int StockId { get;set ; }
    
        public string? CompanyName { get; set; }

        public StockSector? Sector { get; set; } = StockSector.NSE;


        public decimal? BasePrice { get; set; }


        public int? TotalShares { get; set; }



    }
}
