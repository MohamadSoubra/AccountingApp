using ASDataManager.Library.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace AccountingSoftwareApi.Models
{
    public class RegisterUserModel : UserModel
    {
        public string Password { get; set; }
        public UserRolePairModel[] UserRoles { get; set; }

    }
}
