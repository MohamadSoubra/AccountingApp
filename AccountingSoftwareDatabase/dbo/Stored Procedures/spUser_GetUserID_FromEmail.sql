CREATE PROCEDURE [dbo].[spUser_GetUserID_FromEmail]
	@EmailAddress nvarchar(250) = ''
AS

Begin
	select id from [dbo].[User] where EmailAddress = @EmailAddress
end