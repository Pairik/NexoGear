using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using OnlineStoreAPI.DTOs;
using OnlineStoreAPI.Models;
using OnlineStoreAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace OnlineStoreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly JwtService _jwtService;

        public AuthController(
            MongoDbService mongoDbService,
            JwtService jwtService)
        {
            _mongoDbService = mongoDbService;
            _jwtService = jwtService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var existingUser = await _mongoDbService.Users
                .Find(u => u.Email == registerDto.Email)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest("User with this email already exists.");
            }

            var passwordHash =
                BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            var user = new User
            {
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                Email = registerDto.Email,
                PasswordHash = passwordHash,

                // Всеки нов потребител автоматично е User.
                Role = "User",

                Phone = registerDto.Phone,

                Address = new Address
                {
                    City = registerDto.City,
                    Street = registerDto.Street,
                    Number = registerDto.Number
                },

                CreatedAt = DateTime.UtcNow
            };

            await _mongoDbService.Users.InsertOneAsync(user);

            return Ok(new
            {
                message = "Registration successful."
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _mongoDbService.Users
                .Find(u => u.Email == loginDto.Email)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            var passwordIsCorrect =
                BCrypt.Net.BCrypt.Verify(
                    loginDto.Password,
                    user.PasswordHash);

            if (!passwordIsCorrect)
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token = token,

                user = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        // GET: api/auth/me
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _mongoDbService.Users
                .Find(u => u.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(new
            {
                id = user.Id,
                firstName = user.FirstName,
                lastName = user.LastName,
                email = user.Email,
                phone = user.Phone,
                address = new
                {
                    city = user.Address.City,
                    street = user.Address.Street,
                    number = user.Address.Number
                }
            });
        }


        // PUT: api/auth/address
        [Authorize]
        [HttpPut("address")]
        public async Task<IActionResult> UpdateAddress(
            UpdateAddressDto dto)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _mongoDbService.Users
                .Find(u => u.Id == userId)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.Address = new Address
            {
                City = dto.City.Trim(),
                Street = dto.Street.Trim(),
                Number = dto.Number.Trim()
            };

            await _mongoDbService.Users.ReplaceOneAsync(
                u => u.Id == userId,
                user);

            return Ok(new
            {
                message = "Address updated successfully."
            });
        }

    }
}