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
    public class SaleData : ISaleData
    {
        private readonly IProductData _productData;
        private readonly ISQLDataAccess _sql;
        private readonly IConfiguration _config;

        public SaleData(IProductData productData, ISQLDataAccess sql, IConfiguration config)
        {
            _productData = productData;
            _sql = sql;
            _config = config;
        }

        public SaleDBModel GetSaleById(int id)
        {
            return new SaleDBModel { Id = id };
        }

        public void DeleteSaleDetails(List<string> Ids)
        {
            _sql.SaveData<object>("dbo.spSaleDetail_Delete", new { Ids = Ids }, "ASDatabase");
        }



        public void SaveSale(List<SaleDetailModel> saleInfo, string cashierId, int InvoiceID)
        {
            // TODO: Make this SOLID/DRY/Better
            // Start filling in the models we will save to the database
            List<SaleDetailDBModel> details = new List<SaleDetailDBModel>();
            var SaleDetailLookup = _sql.LoadData<SaleDetailModel, dynamic>("spSaleDetail_GetByInvoiceId", new { Id = InvoiceID }, "ASDatabase");



            ConfigHelper cf = new ConfigHelper(_config);

            var taxRate = cf.GetTaxRate() / 100;
           
            foreach (var item in saleInfo)
            {
                //find if the saledetail 
                var detail = new SaleDetailDBModel
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    InvoiceId = InvoiceID,
                    Description = item.Description,
                    UnitPrice = item.UnitPrice,
                    Total = item.Total,
                    Tax = item.Tax,
                    
                    
                };

                // Get the information about this product
                var productInfo = _productData.GetProductById(detail.ProductId);

                if (productInfo == null)
                {
                    throw new Exception($"The product Id of { detail.ProductId } could not be found in the database.");
                }

                //detail.UnitPrice = (productInfo.RetailPrice * detail.Quantity);

                if (productInfo.IsTaxable)
                {
                    detail.Tax = (detail.UnitPrice * taxRate);
                }

                details.Add(detail);
            }
            //create the sale model
            SaleDBModel sale = new SaleDBModel
            {
                InvoiceID = InvoiceID,
                SubTotal = details.Sum(x => x.UnitPrice),
                Tax = details.Sum(x => x.Tax),
                Total = details.Sum(x => x.UnitPrice) * details.Sum(x => x.Tax),
                CashierId = cashierId
            };

            sale.Total = sale.SubTotal + sale.Tax;


            try
            {
                _sql.StartTransaction("ASDatabase");

                // Save the sale model
                _sql.SaveDataInTransaction("dbo.spSale_Insert", sale);

                // Get the ID from the sale model
                sale.Id = _sql.LoadDataInTransaction<int, dynamic>("spSale_Lookup", new { sale.CashierId, sale.SaleDate, sale.InvoiceID }).FirstOrDefault();

                if (SaleDetailLookup.Count != 0)
                {
                    _sql.SaveDataInTransaction("spSaleDetail_DeleteByInvoiceId", InvoiceID);
                }

                //if (!upda)
                //{

                //}

                // Finish filling in the sale detail models
                //foreach (var item in details)
                //{
                //   // item.SaleId = sale.Id;

                //    // Save the sale detail models
                //    _sql.SaveDataInTransaction("dbo.spSaleDetail_Insert", item);
                //}

                details.ForEach(detail => _sql.SaveDataInTransaction("dbo.spSaleDetail_Insert", detail));

                _sql.CommitTransaction();
            }
            catch
            {
                _sql.RollbackTransaction();
                throw;
            }

        }

        public void UpdateSaleDetails(List<SaleDetailModel> saleDetails, string cashierId, int InvoiceID)
        {


            if(saleDetails != null)
            {
                var SaleDetailDBIDs = _sql.LoadData<SaleDetailModel, dynamic>("spSaleDetail_GetByInvoiceId", new { Id = InvoiceID }, "ASDatabase").Select(sd => sd.id).ToList();
                var SDsIds = saleDetails.Select(insd => insd.id).ToList();
                var SDstoDelete = SaleDetailDBIDs.Except(SDsIds).ToList();
                var SDstoInsert = SDsIds.Except(SaleDetailDBIDs).Intersect(SaleDetailDBIDs.Except(SDsIds)).ToList();

                var sdsdbexsdsid = SDsIds.Except(SaleDetailDBIDs).ToList();
                var sdsidexsdsdb = SaleDetailDBIDs.Except(SDsIds).ToList();

                if (SDstoDelete != null)
                {
                    _sql.SaveData<object>("dbo.spSaleDetail_Delete", new { Ids = SDstoDelete.ToArray() }, "ASDatabase");
                }

                this.SaveSale(saleDetails, cashierId, InvoiceID);
            }
        }

        public List<SaleReportModel> GetSaleReport()
        {
            var output = _sql.LoadData<SaleReportModel, dynamic>("dbo.spSale_SaleReport", new { }, "ASDatabase");

            return output;
        }
    }
}
