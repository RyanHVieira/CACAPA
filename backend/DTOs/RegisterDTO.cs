namespace backend.DTOs;

public class RegisterDTO
{
    public string Name { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string Password { get; set; } = string.Empty;
}