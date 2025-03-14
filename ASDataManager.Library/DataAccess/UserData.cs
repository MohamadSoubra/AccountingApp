using ASDataManager.Library.Internal.DataAccess;
using ASDataManager.Library.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ASDataManager.Library.DataAccess
{
    public class UserData : IUserData
    {
        private readonly ISQLDataAccess _sql;

        public UserData(ISQLDataAccess sql)
        {
            _sql = sql;
        }

        public List<UserModel> GetUserById(string Id)
        {
            var output = _sql.LoadData<UserModel, dynamic>("dbo.spUser_Lookup", new { Id }, "ASDatabase");

            return output;
        }

        public void RegisterUser(UserModel user)
        {
            //var UserID = _sql.QueryData<string, dynamic>("dbo.spUser_GetUserID_FromEmail", new { user.EmailAddress }, "ASDatabase");
            var output = _sql.SaveData<UserModel>("dbo.spUser_Insert", new UserModel { Id = user.Id, FirstName = user.FirstName, LastName = user.LastName, EmailAddress = user.EmailAddress, CreatedDate = user.CreatedDate}, "ASDatabase");
        }
    }
}
