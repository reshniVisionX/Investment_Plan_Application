using InvestmentPlanAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InvestmentPlanAPI.DTOs.Stocks
{
    public class StockTransactionsResponseDTO
    {
        public int TransactionId { get; set; }
        public string StockSymbol { get; set; }
        public TransactionType TransactionType { get; set; } 

        public decimal Price { get; set; }

        public decimal TotalValue { get; set; }

        public int Quantity { get; set; }

        public DateTime TransactionDate { get; set; } 

    }
}
