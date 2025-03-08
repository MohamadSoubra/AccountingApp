CREATE PROCEDURE [dbo].[spInvoice_Update]
	@Id int,
	@InvoiceNumber varchar(MAX) = null,
	@ClientId int= null,
	@SaleID int = null,
	@Description varchar(MAX) = null,
	@InvoiceDate datetime2(7) = null,
	@PaymentDueDate datetime2(7) = null,
	@AmountDue money = null,
	@Status varchar(20) = null
AS

BEGIN
	set nocount on;
	set IDENTITY_INSERT [dbo].[Invoice] OFF ;
	update dbo.Invoice set 
	ClientId = ISNULL(@ClientId, ClientId),
	[Description] = ISNULL(@Description, [Description]),
	InvoiceDate = ISNULL(@InvoiceDate, InvoiceDate),
	PaymentDueDate = ISNULL(@PaymentDueDate, PaymentDueDate),
	AmountDue = ISNULL(@AmountDue, AmountDue),
	[Status] = ISNULL(@Status, [Status])
	where Id = @Id

END
