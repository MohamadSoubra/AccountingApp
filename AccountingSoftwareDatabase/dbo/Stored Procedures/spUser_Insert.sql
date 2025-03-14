CREATE PROCEDURE [dbo].[spUser_Insert]
	@Id varchar(250) = '',
	@UserName varchar(50) = '',
	@FirstName varchar(50) = '',
	@LastName varchar(50) = '',
	@EmailAddress varchar(256) = '',
	@CreatedDate datetime

AS

BEGIN
	If @CreatedDate is null Begin set @CreatedDate = GETUTCDATE() End
	set nocount on;
	INSERT INTO [dbo].[User] (Id, Username,FirstName,LastName,EmailAddress,CreatedDate) 
	VALUES (@Id, @UserName, @FirstName, @LastName, @EmailAddress, @CreatedDate);
END
