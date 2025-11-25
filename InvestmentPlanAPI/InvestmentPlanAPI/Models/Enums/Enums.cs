namespace InvestmentPlanAPI.Models.Enums
{

    public enum UserStatus
    {
        Active = 1,
        Inactive = 0
    }


    public enum VerificationStatus
    {
        Pending = 1,
        Verified = 2,
        Rejected = 3
    }
    public enum TransactionType
    {
        BUY = 1,
        SELL = 2
    }

    public enum StockSector
    {
        NSE = 1,
        BSE = 2
    }
    public enum InvestmentType
    {
        LumpSum = 1,
        SIP = 2
    }
    public enum FundTransactionType
    {
        Purchase = 1,
        Redemption = 2,
        
    }

}
