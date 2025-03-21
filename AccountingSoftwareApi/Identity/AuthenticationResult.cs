using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingSoftwareApi.Identity
{
    public class AuthenticationResult
    {
        public string Username { get; set; }

        public string Email { get; set; }
        public string AccessToken { get; set; }

        public string RefreshToken { get; set; }

        public bool Success { get; set; }

        public IEnumerable<string> Errors { get; set; }
    }
}
