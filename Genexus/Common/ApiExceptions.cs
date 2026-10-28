namespace Itrion.Api.Common;

/// <summary>400: la operación viola una regla de validación.</summary>
public class ValidationException(string message) : Exception(message);

/// <summary>409: la operación choca con datos relacionados (p. ej. FK en uso).</summary>
public class ConflictException(string message) : Exception(message);
