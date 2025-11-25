namespace InvestmentPlanAPI.Middleware
{
    public class ApiErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Exception { get; set; }
        public string? Path { get; set; }
        public string? Method { get; set; }
        public int StatusCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public ApiErrorResponse(string message, HttpContext context)
        {
            Exception = message;
            Path = context.Request.Path;
            Method = context.Request.Method;
            StatusCode = context.Response.StatusCode;
        }
    }

}
