using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace InvestmentPlanAPI.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                
                await _next(context);
            }
            catch (DbUpdateException dbEx)
            {
                //  Database-specific errors
                _logger.LogError(dbEx, "Database update error occurred.");

                context.Response.StatusCode = (int)HttpStatusCode.BadRequest; 
                context.Response.ContentType = "application/json";

                
                var dbErrorMessage = dbEx.InnerException?.Message ?? dbEx.Message;

                var errorResponse = new ApiErrorResponse($"Database error: {dbErrorMessage}", context);
                var json = JsonSerializer.Serialize(errorResponse);

                await context.Response.WriteAsync(json);
            }
            catch (Exception ex)
            {
              
                _logger.LogError(ex, "Unhandled exception occurred.");

                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                var message = ex.InnerException?.Message ?? ex.Message;
                var errorResponse = new ApiErrorResponse(message, context);
                var json = JsonSerializer.Serialize(errorResponse);

                await context.Response.WriteAsync(json);
            }
        }
    }
}
