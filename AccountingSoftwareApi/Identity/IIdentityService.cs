using AccountingSoftwareApi.Models;
using System.Threading.Tasks;

namespace AccountingSoftwareApi.Identity
{
    public interface IIdentityService
    {
        Task<AuthenticationResult> RefreshTokenAsync(string token, string refreshToken);
        Task<AuthenticationResult> LoginAsync(string email, string password);
        Task<AuthenticationResult> RegisterAsync(RegisterUserModel registerUser);
    }
}