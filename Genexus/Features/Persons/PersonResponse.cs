namespace Itrion.Api.Features.Persons;

public record PersonResponse(int Id, string FirstName, string LastName, int Dni, string? Email);
