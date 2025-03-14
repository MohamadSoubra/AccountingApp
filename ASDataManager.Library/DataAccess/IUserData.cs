using ASDataManager.Library.Models;
using System.Collections.Generic;

namespace ASDataManager.Library.DataAccess
{
    public interface IUserData
    {
        List<UserModel> GetUserById(string Id);
        void RegisterUser(UserModel user);
    }
}