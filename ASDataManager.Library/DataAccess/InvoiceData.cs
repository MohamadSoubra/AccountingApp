using ASDataManager.Library.Internal.DataAccess;
using ASDataManager.Library.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ASDataManager.Library.DataAccess
{
    public class InvoiceData : IInvoiceData
    {
        private readonly ISQLDataAccess _sql;
        private readonly ISaleData _saleData;

        public InvoiceData(ISQLDataAccess sql, ISaleData saleData)
        {
            _sql = sql;
            _saleData = saleData;
        }

        public void DeleteInvoiceRecord(int id)
        {
            _sql.SaveData<object>("dbo.spInvoice_Delete", new { Id = id }, "ASDatabase");
        }

        public void DeleteSaleDetails(List<string> Ids)
        {
            var Idsdel = String.Join(",", Ids);
            _sql.SaveData<object>("dbo.spSaleDetail_Delete", new { Ids = Idsdel } , "ASDatabase");
        }

        public List<InvoiceModel> GetAllInvoices()
        {
            var DBInvoices = _sql.LoadData<InvoiceDBModel, dynamic>("spInvoice_GetAll", new { }, "ASDatabase").ToList();
            List<InvoiceModel> Reultinvoices = new List<InvoiceModel> { };
            foreach (var invoice in DBInvoices)
            {
                var invmodel = new InvoiceModel();
                invmodel.Id = invoice.Id;
                invmodel.InvoiceDate = invoice.InvoiceDate;
                invmodel.InvoiceNumber = invoice.InvoiceNumber;
                invmodel.PaymentDueDate = invoice.PaymentDueDate;
                invmodel.Status = invoice.Status;
                invmodel.AmountDue = invoice.AmountDue;
                invmodel.Description = invoice.Description;
                invmodel.Client = _sql.LoadData<ClientModel, dynamic>("spClient_GetById", new { Id = invoice.ClientId}, "ASDatabase").FirstOrDefault();
                invmodel.Sale = _sql.LoadData<SaleDBModel, dynamic>("spSale_lookup", new { invoiceID = invoice.Id}, "ASDatabase").FirstOrDefault();
                Reultinvoices.Add(invmodel);
            }

            return Reultinvoices;
        }

        public InvoiceModel GetInvoiceById(int id)
        {
            var DBInvoice = _sql.LoadData<InvoiceDBModel, dynamic>("spInvoice_GetById", new { Id = id }, "ASDatabase").FirstOrDefault();
            var resultinvoice = new InvoiceModel();
            if (DBInvoice != null)
            {
                resultinvoice.Id = DBInvoice.Id;
                resultinvoice.InvoiceDate = DBInvoice.InvoiceDate;
                resultinvoice.InvoiceNumber = DBInvoice.InvoiceNumber;
                resultinvoice.PaymentDueDate = DBInvoice.PaymentDueDate;
                resultinvoice.Status = DBInvoice.Status;
                resultinvoice.AmountDue = DBInvoice.AmountDue;
                resultinvoice.Description = DBInvoice.Description;
                //resultinvoice.Sale = _sql.LoadData<SaleDBModel, dynamic>("spSale_GetByInvoiceId", new { InvoiceId = DBInvoice.Id }, "ASDatabase").FirstOrDefault();
                resultinvoice.Sale = _sql.LoadData<SaleDBModel, dynamic>("spSale_lookup", new { invoiceID = DBInvoice.Id }, "ASDatabase").FirstOrDefault();
                resultinvoice.Client = _sql.LoadData<ClientModel, dynamic>("spClient_GetbyId", new { Id = DBInvoice.ClientId }, "ASDatabase").FirstOrDefault();
                resultinvoice.SaleDetails = GetInvoiceSaleDetails(id);

            }
                return resultinvoice;
        }
        
        public List<SaleDetailModel> GetInvoiceSaleDetails(int id)
        {
            var result = _sql.LoadData<SaleDetailModel, dynamic>("spSaleDetail_GetByInvoiceId", new { Id = id }, "ASDatabase");
            return result;
        }

        public void UpdateInvoiceRecord(InvoiceModel invoice, string cashierId, bool update)
        {
            var Invoicelookup = _sql.LoadData<InvoiceDBModel, dynamic>("spInvoice_GetById", new { Id = invoice.Id }, "ASDatabase").FirstOrDefault();
            var clientLookup = _sql.LoadData<ClientModel, dynamic>("spClient_GetById", new { Id = invoice.Client.Id }, "ASDatabase").FirstOrDefault();
            var SaleLookup = _sql.LoadData<SaleDBModel, dynamic>("spClient_GetById", new { Id = invoice.Sale.Id }, "ASDatabase").FirstOrDefault();

            if (Invoicelookup != null)
            {
                if(update != true)
                {
                    throw new Exception("Invoice Already Exists");
                }
            }

            if (clientLookup == null)
            {
                throw new Exception("This client does not exist");
            }

            if (SaleLookup == null)
            {
                throw new Exception("This Sale does not exist");
            }


        }

        public void SaveInvoiceRecord(InvoiceModel invoice, string cashierId, bool update)
        {

            //Was copying what Tim corey had done in sale data but what I learned is
            //copying a bunch of code is bad and takes more time than building it peice by peice

            //Throwing an exception if Invoice exists in the database
            var Invoicelookup = _sql.LoadData<InvoiceDBModel, dynamic>("spInvoice_GetById", new { Id = invoice.Id }, "ASDatabase").FirstOrDefault();
            var clientLookup = _sql.LoadData<ClientModel, dynamic>("spClient_GetById", new { Id = invoice.Client.Id }, "ASDatabase").FirstOrDefault();
            //var SaleLookup = _sql.LoadData<SaleDBModel, dynamic>("spSale_Lookup", new { Id = invoice.Sale.Id, cashierId = invoice.Sale.CashierId }, "ASDatabase").FirstOrDefault();
            var SaleDetailLookup = _sql.LoadData<SaleDetailModel, dynamic>("spSaleDetail_GetByInvoiceId", new { Id = invoice.Id }, "ASDatabase");
            var stdsToDelete = new List<int> { };
            var InsertedInvoiceID = 0;

            if (Invoicelookup != null)
            {
                if (update != true)
                {
                    throw new Exception("Invoice Already Exists");
                }
            }

            if (clientLookup == null)
            {
                throw new Exception("This client does not exist");
            }

            //if (SaleLookup == null)
            //{
            //    throw new Exception("This Sale does not exist");
            //}

            //if (SaleDetailLookup != null)
            //{
            //    var test1 = invoice.SaleDetails.Except(SaleDetailLookup).ToList();
            //    var test2 = invoice.SaleDetails.Intersect(SaleDetailLookup).ToList();
            //    invoice.SaleDetails = invoice.SaleDetails.Intersect(SaleDetailLookup).ToList();

            //}


            InvoiceDBModel invoiceDB = new InvoiceDBModel {
                ClientId = invoice.Client.Id,
                //SaleId = invoice.Sale.Id,
                Description = invoice.Description,
                InvoiceDate = (DateTime)invoice.InvoiceDate,
                PaymentDueDate = (DateTime)invoice.PaymentDueDate,
                AmountDue = invoice.AmountDue,
                Status = invoice.Status
            };

            

            try
            {
                _sql.StartTransaction("ASDatabase");

                if (update == true && Invoicelookup != null)
                {
                    invoiceDB.Id = invoice.Id;
                    _sql.SaveDataInTransaction("spInvoice_Update", invoiceDB);
                    //_sql.SaveDataInTransaction("spSaleDetail_DeleteByInvoiceId", new { invoiceDB.Id });
                    
                }
                else
                {
                    InsertedInvoiceID = _sql.SaveDataInTransaction("spInvoice_Insert", invoiceDB);
                    //InsertedInvoiceID = insertedINV.Id;
                    //_sql.SaveDataInTransaction("spSale_Insert", invoice.s);
                    //_sql.SaveData("spInvoice_Insert", invoiceDB, "ASDatabase");

                }


                //check if when transaction is rolled back if the invoice could be saved
                // it should not be saved if the transaction rolled back
                _sql.CommitTransaction();
                //_sql.RollbackTransaction();
            }
            catch
            {
                _sql.RollbackTransaction();
                throw;
            }

            if (invoice.Sale != null)
            {
                if (update == true)
                {
                    _sql.SaveData("spSaleDetail_DeleteByInvoiceId", new { id = invoiceDB.Id }, "ASDatabase");
                    _sql.SaveData("spSale_DeleteByInvoiceId", new { id = invoiceDB.Id }, "ASDatabase");
                    _saleData.SaveSale(invoice.SaleDetails, cashierId, invoiceDB.Id);
                }
                else
                {
                    _saleData.SaveSale(invoice.SaleDetails, cashierId, InsertedInvoiceID);
                }
            }

            //if (invoice.Sale != null)
            //{
            //    //invoiceDB.Id = _sql.LoadDataInTransaction<int, dynamic>("spInvoice_GetById", new { invoice.Id }).FirstOrDefault();

            //    //foreach (var item in invoice.SaleDetails)
            //    //{
            //    //    // item.SaleId = sale.Id;

            //    //    // Save the sale detail models
            //    //    _sql.SaveDataInTransaction("dbo.spSaleDetail_Insert", item);
            //    //}
            //    if (update == true)
            //    {
            //        _sql.SaveDataInTransaction("spSaleDetail_DeleteByInvoiceId", invoiceDB.Id);
            //        invoice.SaleDetails.ForEach(SaleDetial => SaleDetial.InvoiceId = invoiceDB.Id);

            //    }
            //    else
            //    {
            //        invoice.SaleDetails.ForEach(SaleDetial => SaleDetial.InvoiceId = InsertedInvoiceID);

            //    }



            //    _saleData.SaveSale(invoice.SaleDetails, cashierId, InsertedInvoiceID);
            //}



        }
    }
}
