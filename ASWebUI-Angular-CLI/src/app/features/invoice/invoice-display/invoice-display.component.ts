import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { Invoice } from 'src/app/models/invoice.model';
import { SaleDetail } from 'src/app/models/sale-detail.model';
import { ApiHelperService } from 'src/app/services/ApiHelper.service';
import { TableDataSource } from 'src/app/sharedFeatures/table/table-datasource';

@Component({
  selector: 'app-invoice-display',
  templateUrl: './invoice-display.component.html',
  styleUrls: ['./invoice-display.component.scss']
})
export class InvoiceDisplayComponent<T> implements OnInit {

  constructor(
  private actroute: ActivatedRoute,
  private apiHelper: ApiHelperService<T>
  ) {}

  saleDetailsData: MatTableDataSource<SaleDetail>;
  invoice :Invoice = new Invoice();
  tableColumns = [
    {
      name: "productName",
      dataKey: "productName",
    },
    {
      name: "quantity",
      dataKey: "quantity",
    },
    {
      name: "unitPrice",
      dataKey: "unitPrice",
    },
    {
      name: "total",
      dataKey: "total",
    },

  ]
  tableColumnsHeader;

  ngOnInit(): void {
    this.tableColumnsHeader = this.tableColumns.map(tc => tc.name)


    console.log(this.actroute.snapshot.params);
    this.saleDetailsData = this.apiHelper.getByID<T>("invoices", this.actroute.snapshot.params["id"]).pipe(
      switchMap(invoice => {

        const inv = new Invoice(invoice);
        this.invoice = inv
        console.log("Invoice ONINT", invoice);
        inv.client = invoice["client"];
        // inv.sale.invoiceId = inv.id;

        return this.apiHelper.getRecords('Saledetail', this.actroute.snapshot.params["id"]).pipe(
          map((SALEDTS) => {
            if (!this.apiHelper.objectIsEmpty(SALEDTS)) {
              const converted = SALEDTS.map(RTSALEDTS => {
                return new SaleDetail(RTSALEDTS)
              })

              inv.saleDetails = converted
              this.saleDetailsData = new MatTableDataSource<SaleDetail>(converted);

              // this.saleDetailsData.FechData(inv.id);
            } else {
              console.log("NOT CONVERTED");

              this.saleDetailsData = new MatTableDataSource<SaleDetail>([]);
            }
            console.log("this.saleDetailsData", this.saleDetailsData);
            return inv;
          })
        )
      })
    );

    console.log(this.saleDetailsData);
    
    
  }

  ngAfterViewInit() {
    // console.log("TEst ngAfterViewInit");
    
  }
  

}
