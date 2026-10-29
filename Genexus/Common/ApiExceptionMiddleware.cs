using System.Net;
using System.Text.Json;

namespace Itrion.Api.Common;

/// <summary>
/// Traduce ValidationException/ConflictException a 400/409 con cuerpo ErrorResponse.
/// Debe registrarse antes que los controllers.
/// </summary>
public class ApiExceptionMiddleware(RequestDelegate next) {

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task Invoke(HttpContext context) {
        try {
            await next(context);
        } catch (ValidationException ex) {
            await WriteAsync(context, HttpStatusCode.BadRequest, ex.Message);
        } catch (ConflictException ex) {
            await WriteAsync(context, HttpStatusCode.Conflict, ex.Message);
        }
    }

    private static async Task WriteAsync(HttpContext context, HttpStatusCode code, string message) {
        context.Response.StatusCode = (int)code;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(new ErrorResponse(message), JsonOptions));
    }

}
