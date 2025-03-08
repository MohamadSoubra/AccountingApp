CREATE TABLE [dbo].[Invoice]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [InvoiceNumber] AS 'INV-' + RIGHT('000000' + CAST(Id AS VARCHAR(5)) , 6),
    [ClientId] INT NOT NULL, 
    [Description] VARCHAR(MAX) NULL, 
    [InvoiceDate] DATETIME2 NOT NULL DEFAULT getutcdate(), 
    [PaymentDueDate] DATETIME2 NOT NULL, 
    [AmountDue] MONEY NOT NULL, 
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    [Active] BIT NOT NULL DEFAULT 1, 
    CONSTRAINT [FK_Invoice_ToClient] FOREIGN KEY (ClientId) REFERENCES Client(Id) 
)
