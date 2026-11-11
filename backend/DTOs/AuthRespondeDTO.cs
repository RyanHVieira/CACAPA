namespace backend.DTOs;

public class AuthResponseDTO
{
    public string Id { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}