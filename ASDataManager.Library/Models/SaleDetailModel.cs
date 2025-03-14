using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ASDataManager.Library.Models
{
    public class SaleDetailModel
    {
        public int id { get; set; }
        public int InvoiceId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }


        public SaleDetailModel(int id, int invoiceId, int productId, string productName, string description, int purchasePrice, int quantity, decimal subtotal, decimal tax, decimal total)
        {
            this.id = id;
            InvoiceId = invoiceId;
            ProductId = productId;
            ProductName = productName;
            Description = description;
            UnitPrice = purchasePrice;
            Quantity = quantity;
            Subtotal = subtotal;
            Tax = tax;
            Total = total;
        }

        public SaleDetailModel() { }

    }
}