import { ObserversModule } from '@angular/cdk/observers';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { Invoice, InvoiceStatus, InvoiceStatus2LabelMapping } from 'src/app/models/invoice.model';
import { SaleDetail } from 'src/app/models/sale-detail.model';
import { Sale } from 'src/app/models/sale.model';
import { ApiHelperService } from 'src/app/services/ApiHelper.service';
import { DisplayModalComponent } from '../modal/displayModal.component';
import { TableDataSource } from '../table/table-datasource';
import { TableColumn, TableComponent } from '../table/table.component';

@Component({
  selector: "app-add-edit",
  templateUrl: "./add-edit.component.html",
  styleUrls: ["./add-edit.component.scss"],
})
export class AddEditComponent<T> implements OnInit {
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private apiHelper: ApiHelperService<T>,
    private actroute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private _cdr: ChangeDetectorRef,

  ) { }

  @ViewChild(TableComponent) table: TableComponent<SaleDetail>;

  // @Input() displayItem: Product | Client | Supplier | Invoice ;
  displayItem: any;
  displayItemOBS: any;
  // @Input() displayItem: Invoice = null;

  Title: string = "NO-ID";
  itemProperties;
  itemFormArray = this.fb.array([]);
  formControlsArray = [];
  itemform = this.fb.group({});
  labelstext = [];
  selectValue = false;
  SelectOptionsForClient: any;
  SelectOptionsForStatus: any = Object.values(InvoiceStatus);
  selectInputValue: any;
  previousRoute: string;
  saledetailscolumns: TableColumn[];
  saleDetailsData: SaleDetail[];
  hasSailDetails: boolean = false;
  isSaleDetails: boolean = false;
  isInvoice: boolean = false;
  disabled = true;

  invoiceStatusDisplay = InvoiceStatus2LabelMapping;

  update: boolean = false;

  needTable: boolean = false;
  //temp variable
  ClientName: String;

  currentItemId: number;

  // subTotal: number = 0;
  // tax: number = 0;
  // total: number = 0;
  // autoCompleteValue: any;

  IPO: Observable<T> = null;



  ngOnInit(): void {
    if (+this.actroute.snapshot.params["id"] === 0) {
      this.update = false;

      this.displayItem = this.apiHelper.InitializeType(this.actroute.snapshot.params[""]);


      this.GenerateFormFromObject(this.displayItem);

      // this.saleDetailsData = new MatTableDataSource<SaleDetail>([]);
      this.saleDetailsData = [];


      this.apiHelper.recsType = this.displayItem.constructor.name;

    } else {

      this.update = true;

      if (this.actroute.snapshot.params[""] === "invoices") {
        this.apiHelper.recsType = "SaleDetail";
        this.IPO = this.apiHelper.getByID<T>(this.actroute.snapshot.params[""], this.actroute.snapshot.params["id"]).pipe(
          switchMap(invoice => {

            const inv = new Invoice(invoice);
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
                  // this.saleDetailsData = new MatTableDataSource<SaleDetail>(converted);
                  this.saleDetailsData = converted;

                  // this.saleDetailsData.FechData(inv.id);
                } else {
                  console.log("NOT CONVERTED");

                  // this.saleDetailsData = new MatTableDataSource<SaleDetail>([]);
                  this.saleDetailsData = [];
                }
                console.log("this.saleDetailsData", this.saleDetailsData);
                return inv;
              })
            )
          })
        );
      } else {
        this.IPO = this.apiHelper.getByID(this.actroute.snapshot.params[""], this.actroute.snapshot.params["id"]);
      }


      this.IPO.subscribe(itemprops => {
        console.log("itemprops in IPO", itemprops);;

        this.apiHelper.recsType = itemprops.constructor.name;
        this.GenerateFormFromObject(itemprops);
      })

    }

    console.log("this.displayItem", this.displayItem);
    console.log("this.itemform", this.itemform);

  }

  updateSale(element: any = {}) {
    let formSale: Sale;
    if (this.update) {
      formSale = this.itemform.get("sale").value as Sale;
    } else {
      formSale = new Sale(this.itemform.get("sale").value);
    }

    formSale.saleDate = new Date().toISOString();

    formSale.cashierId = JSON.parse(window.atob(localStorage.getItem("token").split(".")[1])).id;

    const formSaleDetails: SaleDetail[] = this.itemform.get("saleDetails").value
    if (formSaleDetails) {
      formSale.subTotal = formSaleDetails.reduce((prev, curr: SaleDetail) => { return prev + (curr.total); }, 0);
      formSale.tax = formSaleDetails.reduce((prev, curr: SaleDetail) => { return prev + (curr.tax); }, 0);
      if (formSale.tax !== 0) {
        formSale.total = formSale.subTotal * formSale.tax;
      } else {
        formSale.total = formSale.subTotal;
      }
      this.itemform.patchValue({ sale: formSale });

    }

    console.log("this.itemform.value UPDATESALE()", this.itemform.value);

  }



  onSubmit() {
    console.log("this.itemform.getRawValue()", this.itemform.getRawValue());
    console.log("this.update", this.update);

    if (this.update) {
      this.apiHelper.updateRecord(this.itemform.getRawValue());
    } else {
      this.apiHelper.saveRecord(this.itemform.getRawValue());
    }

  }

  formatText(text: string) {
    text =
      text[0].toLocaleUpperCase() +
      text.replace(/([a-z])([A-Z])/g, "$1 $2").slice(1);
    return text;
  }

  displayFn(option: Client | string): string {
    console.log("option",typeof option);
    
    if (typeof option === "object") {
      const client = new Client(option);
      return option = client && client.firstName || client.lastName ? client.getFullName() : '';
    }

    return option
  }



  addSaleDetail() {
    const newSaleDetail: SaleDetail = new SaleDetail();

    let dialogref = this.dialog.open(DisplayModalComponent, {
      data: newSaleDetail,
      panelClass: "DisplayModal",
    });

    dialogref.afterClosed().subscribe((result) => {
      console.log("result", result);
      if (result === null || result === undefined || typeof result === 'undefined') {
        console.log("result IN THE IF", result);
        return
      }
      result as SaleDetail;

      newSaleDetail.invoiceId = +this.actroute.snapshot.params["id"];
      newSaleDetail.productName = result.product.productName;
      newSaleDetail.productId = result.product.id;
      newSaleDetail.description = result.product.description;
      newSaleDetail.quantity = +result.quantity;
      newSaleDetail.unitPrice = result.product.retailPrice;
      newSaleDetail.tax = result.tax;
      newSaleDetail.subTotal = +result.quantity * +result.product.retailPrice;

      if (newSaleDetail.tax !== 0) {
        newSaleDetail.total += newSaleDetail.subTotal * newSaleDetail.tax;
      } else {
        newSaleDetail.total += newSaleDetail.subTotal;
      }


      console.log("newsaleDetail", newSaleDetail);

      console.log("this.itemform.value ADDSALEDETAIL()", this.itemform.value);
      let formSale: Sale;



      let formSaleDetails = this.itemform.get("saleDetails").value;
      formSaleDetails.push(newSaleDetail);
      
      // this.saleDetailsData.data = formSaleDetails;
      // this.saleDetailsData = new MatTableDataSource<SaleDetail>(formSaleDetails);
      this.saleDetailsData = formSaleDetails;

      this.table.refreshData(formSaleDetails);

      this.updateSale();


    });

  }

  //this method is for getting the type of the object injected into this class
  //to dinamically change the material dialoge title
  getType(object) {
    // Object.keys(object).
  }

  Cancel() {
    this.location.back();
  }

  AddClient() {
    const newClient = new Client();

    // this.dialog
    //   .open(DisplayModalComponent, {
    //     data: newClient,
    //     panelClass: "DisplayModal",
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if (!this.objectHasEmptyProperties(res)) {
    //       this.itemform.controls.client.setValue(res);
    //       // this.autoCompleteValue = res;
    //     }
    //   });
  }

  autoCompleteIsEmpty(prop): boolean {
    // if (prop.formControlName !== "client") {
    //   return true;
    // } else {
      const formControlValue = this.itemform.get(prop.formControlName).value;

      if (!formControlValue || typeof formControlValue === "object" && formControlValue !== null) {
        return this.objectHasEmptyProperties(formControlValue);
      }
    // }
  }

  resetAutoComplete(prop) {
    // console.log("prop from reset", prop);

    this.itemform.get(prop.formControlName).setValue({});
    this.selectInputValue = {};
  }

  objectHasEmptyProperties(object) {
    if (object && Object.values(object).every((x) => x === null || x === "" || x === undefined || x === 0)) {
      return true;
    } else {
      return false;
    }
  }

  add(element) {
    // let SDs = this.itemform.get("saleDetails").value;
    // console.log("SDs before", SDs);
    // SDs = [...SDs, element]
    // console.log("SDs after", SDs);
    // this.itemform.get("saleDetails").setValue(SDs);
  }

  edit(event) {

  }


  delete(element) {

    let SDs = this.itemform.get("saleDetails").value;
    // console.log("SDs before",SDs);
    SDs = SDs.filter(sd => sd.id != element.id)
    // console.log("SDs after",SDs);
    this.itemform.get("saleDetails").setValue(SDs);
    // console.log('this.displayItem.constructor.name',this.displayItem.constructor.name);

    // this.apiHelper.deleteRecord(element, "SaleDetail")
    this.table.refreshData(SDs);
  }

  formatDate(object) {
    if (Object.keys(object).forEach)
      Object.keys(object).map(prop => {
        if (prop.toLowerCase().includes("date")) {
          object[prop] = new Date(object[prop]).toDateString()
        }
      })
    return object;
  }

  print() {
    // window.print();
    // var divToPrint = document.getElementById('print-area');
    // var newWin = window.open('', 'Print-Window');
    // newWin.document.open();
    // newWin.document.write('<html><link rel="stylesheet" type="text/css" href="../../../styles.scss" media="print"/><body onload="window.print()">' + divToPrint.innerHTML + '</body></html>');
    // newWin.document.close();
    // setTimeout(function () {
    //   newWin.close();
    // }, 10000);

    console.log("this.itemform.value", this.itemform.value);
  }

  GenerateFormFromObject(object) {
    console.log("GenerateFormFromObject", object);

    if (object) {
      this.itemProperties = Object.keys(object).map((prop) => {
        let type = "";
        let isBoolean = false;
        let needSelectInput = false;
        let needDatePicker = false;
        let Included = true;

        if (prop === "id") {
          Included = false;
        }

        if (prop === "invoiceNumber") {
          Included = false;
        }

        if (prop === "amountDue") {
          Included = false;
        }

        if (prop === "status") {
          needSelectInput = true;
          // this.SelectOptionsForStatus = Object.values(InvoiceStatus);
        }



        if (prop === "sale") {
          if (object[prop] === null) {
            object[prop] = new Sale();
          }
          this.itemform.addControl(
            prop,
            this.fb.group(object[prop])
          );
          this.itemform.get("sale").disable();
          
          console.log("object[prop] SALE", object[prop]);
        }

        // if (prop === "amountDue") {
        //   // Included = false;
        // }


        if (object[prop] === true || object[prop] === false) {
          isBoolean = true;
        }


        if (prop === "client") {
          needSelectInput = true;
          this.isInvoice = true;
          // this.SelectOptionsForStatus = [1,2,3];
          this.apiHelper.getClients().subscribe(clients => {
            this.SelectOptionsForClient = clients;
          })
        }

        if (prop.toLowerCase().includes("date")) {
          needDatePicker = true;
          this.itemform.addControl(
            prop,
            new FormControl(new Date(object[prop]))
          );
        }

        if (object.id != undefined) {
          if (object.id == 0) {
            this.Title = `Add new ${object.constructor.name}`;
          } else {
            if (object.constructor.name === "Invoice") {

              this.Title = `Editing ${object.constructor.name}  ${object.invoiceNumber}`;
            } else {

              this.Title = `Editing ${object.constructor.name}  ${object.id}`;
            }
          }
        }



        let needTextArea = false;
        if (prop === "description" || object[prop]?.length > 20) {
          needTextArea = true;
        }

        let width: string = "";

        switch (prop) {
          case "firstName":
            width = "350";
            break;

          case "lastName":
            width = "50";
            break;

          default:
            width = "100";
            break;
        }

        // SaleDetail
        this.saledetailscolumns = [
          {
            name: "Product Name",
            dataKey: "productName",
            isSortable: true,
            isFilterable: true,
            position: "right"
          },
          {
            name: "Description",
            dataKey: "description",
            isFilterable: true,
          },
          {
            name: "Quantity",
            dataKey: "quantity",
            isSortable: true,
            isFilterable: true,
          },
          {
            name: "Unit Price",
            dataKey: "unitPrice",
            isSortable: true,
            isFilterable: true,
          },
          {
            name: "Total",
            dataKey: "total",
            isFilterable: false,
          }

        ]


        this.needTable = false;
        if (prop === "saleDetails") {
          console.log("object for totals", object.sale);

          this.needTable = true;

          if (object.id != 0) {

            this.apiHelper.getSaleDetailsByInvoiceID(object.id).subscribe(SDTS => {
              console.log("SDTS", SDTS);

              // this.saleDetailsData = new MatTableDataSource<SaleDetail>(SDTS);
              this.saleDetailsData = SDTS;
            })
          }
          this.apiHelper.recID = object.id;



        }
        if (typeof (object[prop]) === "number") {
          type = "number";
        }

        if (prop === "retailPrice") {
          console.log("retailPrice", typeof (object[prop]));

        }

        this.itemform.addControl(
          prop,
          new FormControl(object[prop])
        );

        return {
          labelsText: this.formatText(prop),
          formControlName: prop,
          value: object[prop],
          isBoolean: isBoolean,
          Included: Included,
          needTextArea: needTextArea,
          needSelectInput: needSelectInput,
          needDatePicker: needDatePicker,
          needTable: this.needTable,
          width: width,
          type: type
        };
      }).filter(prop => {
        return prop.Included
      });

    }
    console.log("this.itemProperties", this.itemProperties);
  }
}



