namespace Itrion.Api.Features.Persons;

public record PersonRequest(string FirstName, string LastName, int Dni, string? Email);
