using System;
using System.Collections.Generic;
using System.Text;

namespace ASDataManager.Library.Models
{
    public class RegisterUserModel : UserModel
    {
        public string Password { get; set; }
        public string UserName { get; set; }


    }
}
