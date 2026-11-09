using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password) ||
            dto.Password.Length < 8)
        {
            return BadRequest(new
            {
                message = "Informe nome, email e senha com pelo menos 8 caracteres."
            });
        }

        var result = await _authService.Register(dto);

        if (result == null)
            return Conflict(new { message = "Email já cadastrado." });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new
            {
                message = "Informe email e senha."
            });
        }

        var result = await _authService.Login(dto);

        if (result == null)
            return Unauthorized(new { message = "Email ou senha incorretos." });

        return Ok(result);
    }
}