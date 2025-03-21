using ASDataManager.Library.DataAccess;
using ASDataManager.Library.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AccountingSoftwareApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceData _invoiceData;

        public InvoiceController(IInvoiceData invoiceData)
        {
            _invoiceData = invoiceData;
        }

        [Authorize(Roles = "Accountant")]
        [HttpGet]
        public List<InvoiceModel> GetInvoices()
        {
            return _invoiceData.GetAllInvoices();
        }

        [Authorize(Roles = "Accountant")]
        [Route("GetInvoiceById")]
        [HttpGet]
        public InvoiceModel getInvoice(int InvoiceId)
        {
            return _invoiceData.GetInvoiceById(InvoiceId);
        }

        [Authorize(Roles = "Accountant")]
        [Route("GetInvoiceSaleDetails")]
        [HttpGet]
        public List<SaleDetailModel> getInvoiceSaleDetails(int InvoiceId)
        {
            return _invoiceData.GetInvoiceSaleDetails(InvoiceId);
        }

        //[Authorize(Roles = "Accountant")]
        //[Route("getInvoiceByID")]
        //[HttpGet]
        //public InvoiceDBModel getInvoiceByID(int InvoiceId)
        //{
        //    return _invoiceData.GetInvoiceById(InvoiceId);
        //}

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public void PostInvoice([FromBody] InvoiceModel invoice)
        {
            string userId = User.FindFirstValue("Id");

            _invoiceData.SaveInvoiceRecord(invoice, userId);
        } 

        [Authorize(Roles = "Admin")]
        [Route("UpdateInvoice")]
        [HttpPut]
        public void UpdateInvoice([FromBody] InvoiceModel invoice)
        {
            string userId = User.FindFirstValue("Id");

            _invoiceData.SaveInvoiceRecord(invoice, userId, true);
        }

        [Authorize(Roles = "Accountant")]
        [Route("DeleteInvoice")]
        [HttpDelete]
        public void DeleteInvoice([FromBody] int InvoiceId)
        {
            _invoiceData.DeleteInvoiceRecord(InvoiceId);
        }

        [Authorize(Roles = "Accountant")]
        [Route("DeleteSaleDetail")]
        [HttpDelete]
        public void DeleteSaleDetial([FromBody] List<string> SaleDetailIds)
        {
            _invoiceData.DeleteSaleDetails(SaleDetailIds);
        }

    }
}
