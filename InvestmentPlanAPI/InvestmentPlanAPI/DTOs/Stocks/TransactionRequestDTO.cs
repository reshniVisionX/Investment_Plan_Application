using InvestmentPlanAPI.Models.Enums;

namespace InvestmentPlanAPI.DTOs.Stocks
{
    public class TransactionRequestDTO
    {
        public Guid PublicInvestorId { get; set; }

      
        public int StockId { get; set; }

        public TransactionType TransactionType { get; set; }

        public int Quantity { get; set; } 
    }
}
