using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AccountingSoftwareApi.Data;
using AccountingSoftwareApi.Identity;
using AccountingSoftwareApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;

namespace AccountingSoftwareApi.Controllers
{
    public class TokenController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IIdentityService _identityService;

        public TokenController(ApplicationDbContext context, 
                               UserManager<IdentityUser> userManager,
                               IIdentityService identityService)
        {
            _context = context;
            _userManager = userManager;
            _identityService = identityService;
        }

        [Route("/token")]
        [HttpPost]
        public async Task<AuthenticationResult> Create(string email, string password, string grant_type)
        {


            var authResponse = await _identityService.LoginAsync(email, password);

            if (authResponse.Errors != null) 
            {

                return new AuthenticationResult { Errors = new[] { "Invalid email or password" } };
            }

            setTokenCookie(authResponse.RefreshToken);

            return new AuthenticationResult { Username = email, AccessToken = authResponse.AccessToken, RefreshToken = authResponse.RefreshToken, Success = true };
        }

        private async Task<bool> IsValidUsernameAndPassword(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return await _userManager.CheckPasswordAsync(user, password);
        }

        #region Old Token Generation implementation
        /*
        private async Task<AuthSuccessResponse> GenerateTokens(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var roles = from ur in _context.UserRoles
                        join r in _context.Roles on ur.RoleId equals r.Id
                        where ur.UserId == user.Id
                        select new { ur.UserId, ur.RoleId, r.Name };

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, email),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Nbf, new DateTimeOffset(DateTime.Now).ToUnixTimeSeconds().ToString()),
                //new Claim(JwtRegisteredClaimNames.Exp, new DateTimeOffset(DateTime.Now).AddSeconds(10).ToUnixTimeSeconds().ToString())
                new Claim(JwtRegisteredClaimNames.Exp, DateTime.UtcNow.AddHours(1).ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role.Name));
            }

            var token = new JwtSecurityToken(
                new JwtHeader(
                    new SigningCredentials(
                        new SymmetricSecurityKey(Encoding.UTF8.GetBytes("MySecretKeyIsSecretSoDoNotTell")),
                        SecurityAlgorithms.HmacSha256)),
                new JwtPayload(claims));


            var refreshToken = new RefreshToken
            {
                JwtId = token.Id,
                UserId = user.Id,
                CreationDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddMonths(6)
            };

            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();
            //var output = new 
            //{
            //    Access_token = new JwtSecurityTokenHandler().WriteToken(token),
            //    email = email,
            //    validFrom = token.ValidFrom.ToString(),
            //    expiresIn = token.ValidTo.ToString()
            //};

            setTokenCookie(refreshToken.Token);
            
            var output = new AuthSuccessResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                RefreshToken = refreshToken.Token
            };

            return output;
        }
        */
        #endregion

        [Route("/refresh-token")]
        [HttpPost]
        public async Task<IActionResult> RefreshToken([FromBody] AuthRequest request)
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var authResponse = await _identityService.RefreshTokenAsync(request.Token, refreshToken);


            if (!authResponse.Success)
            {
                return BadRequest(new AuthenticationResult
                {
                    Errors = authResponse.Errors
                });
            }

            if (refreshToken != null)
            {
                setTokenCookie(authResponse.RefreshToken);
            }


            return Ok(new AuthSuccessResponse
            {
                Token = authResponse.AccessToken,
                RefreshToken = authResponse.RefreshToken
            });

        }

        [Route("/revoke-token")]
        [HttpPost]
        public async Task<IActionResult> RevokeToken([FromBody] RefreshTokenRequest request)
        {
            //var refreshTokenRequest = Request.Cookies["refreshToken"];
            var tokenrequest = request.RefreshToken ?? Request.Cookies["refreshToken"];

            var storedRefreshToken = _context.RefreshTokens.FirstOrDefault(token => token.Token == tokenrequest);

            if (storedRefreshToken == null)
            {
                return BadRequest("Token Not found");
            }

            storedRefreshToken.Invalidated = true;
            _context.RefreshTokens.Update(storedRefreshToken);
            await _context.SaveChangesAsync();

            return Ok("Token successfully revoked");
        }

        private void setTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.None
                
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }



        //private string ipAddress()
        //{
        //    if (Request.Headers.ContainsKey("X-Forwarded-For"))
        //        return Request.Headers["X-Forwarded-For"];
        //    else
        //        return HttpContext.Connection.RemoteIpAddress.MapToIPv4().ToString();
        //}
    }
}