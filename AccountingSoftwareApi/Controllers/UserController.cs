using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using AccountingSoftwareApi.Data;
using AccountingSoftwareApi.Identity;
using AccountingSoftwareApi.Models;
using ASDataManager.Library.DataAccess;
using ASDataManager.Library.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AccountingSoftwareApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IUserData _userData;
        private readonly ILogger _logger;
        private readonly IIdentityService _identityService;

        public UserController(ApplicationDbContext context, 
                             UserManager<IdentityUser> userManager,
                             IUserData userData,
                             ILogger<UserController> logger,
                             IIdentityService identityService)
        {
            _context = context;
            _userManager = userManager;
            _userData = userData;
            _logger = logger;
            _identityService = identityService;
        }

        [HttpGet]
        public UserModel GetById()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            return _userData.GetUserById(userId).First();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("Admin/GetAllUsers")]
        public List<ApplicationUserModel> GetAllUsers()
        {

            List<ApplicationUserModel> output = new List<ApplicationUserModel>();

            var users = _context.Users.ToList();

            var UserRoles = from ur in _context.UserRoles
                            join r in _context.Roles on ur.RoleId equals r.Id
                            select new { ur.UserId, ur.RoleId, r.Name };

            foreach (var user in users)
            {
                ApplicationUserModel u = new ApplicationUserModel
                {
                    Id = user.Id,
                    Email = user.Email
                };

                u.Roles = UserRoles.Where(x => x.UserId == u.Id).ToDictionary(x => x.RoleId, x => x.Name);

                output.Add(u);
            }

            return output;
        }

        [AllowAnonymous]
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [Route("Admin/GetAllRoles")]
        public List<string> GetAllRoles()
        {
            var roles = _context.Roles.Select(x => x.Name).ToList();

            return roles;

        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Route("Admin/AddRole")]
        public async Task AddARole(UserRolePairModel pairing)
        {
            string looggedInUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var user = await _userManager.FindByIdAsync(pairing.UserId);

            _logger.LogInformation("Admin {Admin} added user {User} to role {Role}",
                looggedInUserId, user.Id, pairing.RoleName);

           await _userManager.AddToRoleAsync(user, pairing.RoleName);
            
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [Route("Admin/RemoveRole")]
        public async Task RemoveARole(UserRolePairModel pairing)
        {
            string looggedInUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var user = await _userManager.FindByIdAsync(pairing.UserId);

            _logger.LogInformation("Admin {Admin} removed user {User} from role {Role}",
                looggedInUserId, user.Id, pairing.RoleName);

            await _userManager.RemoveFromRoleAsync(user, pairing.RoleName);

        }

        [AllowAnonymous]
        [Route("Admin/Register")]
        [HttpPost]
        public async Task<ActionResult> RegisterUser([FromBody] RegisterUserModel registerUser)
        {

            if (registerUser == null)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _identityService.RegisterAsync(registerUser);

            if (result.Errors != null)
            {
                return BadRequest(result.Errors);
            }
            else
            {
                return Ok(result);
            }
        }
    }
}