using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthService(
        AppDbContext context,
        TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDTO?> Register(RegisterDTO dto)
    {
        var name = dto.Name.Trim();

        var existingUser = await _context.Users
            .AnyAsync(u => u.Name == name);

        if (existingUser)
            return null;

        string? email = null;
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            email = dto.Email.Trim().ToLowerInvariant();

            existingUser = await _context.Users
                .AnyAsync(u => u.Email == email);

            if (existingUser)
                return null;
        }

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new AuthResponseDTO
        {
            Token = _tokenService.GenerateToken(user),
            Name = user.Name,
            Email = user.Email ?? string.Empty
        };
    }

    public async Task<AuthResponseDTO?> Login(LoginDTO dto)
    {
        var name = dto.Name.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Name == name);

        if (user == null)
            return null;

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!passwordValid)
            return null;

        return new AuthResponseDTO
        {
            Token = _tokenService.GenerateToken(user),
            Name = user.Name,
            Email = user.Email ?? string.Empty
        };
    }
}