import { ObserversModule } from '@angular/cdk/observers';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap,map } from 'rxjs/operators';
import { Client } from 'src/app/models/client.model';
import { Invoice } from 'src/app/models/invoice.model';
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
  selectInputData: any;
  selectInputValue: any;
  previousRoute: string;
  saledetailscolumns: TableColumn[];
  saleDetailsData: TableDataSource<SaleDetail>;
  hasSailDetails: boolean = false;
  isSaleDetails: boolean = false;
  isInvoice: boolean = false;
  disabled = true;

  update : boolean = false;

  needTable: boolean = false;
  //temp variable
  ClientName: String;

  currentItemId: number;

  subTotal: number = 0;
  tax: number = 0;
  total: number = 0;
  // autoCompleteValue: any;

  IPO: Observable<T>;



  ngOnInit(): void {
    console.log("this.total ON INIT", this.total);

    
    // console.log("this.apiHelper.objectbyId", this.apiHelper.objectbyId);
    // this.saleDetailsData = [{
    //   description: "Added From SSMS",
    //   id: 1010,
    //   invoiceId: 1,
    //   productId: 5,
    //   productName: "Product 5",
    //   purchasePrice: 7650,
    //   quantity: 5,
    //   saleId: 1010,
    //   subtotal: 150,
    //   tax: 13.125,
    //   total: 163.125
    // }, {
    //   description: "Added From SSMS",
    //   id: 1011,
    //   invoiceId: 1,
    //   productId: 10,
    //   productName: "Product 10",
    //   purchasePrice: 10000,
    //   quantity: 10,
    //   saleId: 1010,
    //   subtotal: 150,
    //   tax: 13.125,
    //   total: 163.125
    // }];
    // console.log("this.actroute.snapshot.params[\"\"]", this.actroute.snapshot.params[""]);
    // console.log("this.actroute.snapshot.params[\"id\"]", this.actroute.snapshot.params["id"]);
    
    
    


    if (+this.actroute.snapshot.params["id"] === 0) {
      this.update = false;

      this.displayItem = this.apiHelper.InitializeType(this.actroute.snapshot.params[""]);


      this.GenerateFormFromObject(this.displayItem);

      this.saleDetailsData = new TableDataSource<SaleDetail>([]);


      this.apiHelper.recsType = this.displayItem.constructor.name;

    } else {

      this.update = true;

      if (this.actroute.snapshot.params[""] === "invoices"){
        this.apiHelper.recsType = "SaleDetail";
        this.IPO = this.apiHelper.getByID<T>(this.actroute.snapshot.params[""], this.actroute.snapshot.params["id"]).pipe(
          switchMap(invoice => {
            
            const inv = new Invoice(invoice);
            console.log("Invoice ONINT", invoice);
            inv.client = invoice["client"];
            // inv.sale.invoiceId = inv.id;

            return this.apiHelper.getRecords('Saledetail',this.actroute.snapshot.params["id"]).pipe(
              map((SALEDTS) => {
                if (!this.apiHelper.objectIsEmpty(SALEDTS)) {
                  const converted = SALEDTS.map(RTSALEDTS => {
                    return  new SaleDetail(RTSALEDTS)
                  })
                  
                  inv.saleDetails = converted
                    this.saleDetailsData = new TableDataSource<SaleDetail>(converted);
                  
                  // this.saleDetailsData.FechData(inv.id);
                } else {
                  console.log("NO CONVERTED");

                  this.saleDetailsData = new TableDataSource<SaleDetail>([]);
                }
                console.log("this.saleDetailsData", this.saleDetailsData);
                return inv;
              })
            )
          })
        );
      }else{
        this.IPO = this.apiHelper.getByID(this.actroute.snapshot.params[""], this.actroute.snapshot.params["id"]);
      }
      

      this.IPO.subscribe(itemprops =>{
        console.log("itemprops in IPO", itemprops);;
        
        this.apiHelper.recsType = itemprops.constructor.name;
        this.GenerateFormFromObject(itemprops);
      })
      
    }

    console.log("this.displayItem", this.displayItem); 
    console.log("this.itemform", this.itemform);
    
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    console.log("this.total AFTER View INIT", this.total);
    


  }

  // RedudeTotals(element: any) {

  // }

  updateSale(element: any = {}) {
    let formSale: Sale;
    if (this.update) {
      formSale = this.itemform.get("sale").value as Sale;
    } else {
      formSale = new Sale(this.itemform.get("sale").value);
    }
    console.log(`Form SALE BEFORE`, this.itemform.get("sale").value);

    // formSale.subTotal += newSaleDetail.subTotal;
    formSale.saleDate = new Date().toISOString();

    formSale.cashierId = JSON.parse(window.atob(localStorage.getItem("token").split(".")[1])).id;
    
    console.log("element Transfered UPDATE SUB TOTAL", element);
    
    const formSaleDetails : SaleDetail[] = this.itemform.get("saleDetails").value
    // const formSale : Sale = this.itemform.get("sale").value
    console.log("formSale", formSale);
    console.log("formSaleDetails", formSaleDetails);
    
    if (formSaleDetails) {
      console.log("formSaleDetails", formSaleDetails);

      console.log("formSale.subTotal, formSale.tax, formSale.total before", formSale.subTotal, formSale.tax, formSale.total);
      
      
      // this.subTotal = formSale.reduce((prev, curr: SaleDetail) => {
        //   console.log("curr", curr);
      
      formSale.subTotal = formSaleDetails.reduce((prev, curr: SaleDetail) => { return prev + (curr.total);},0);
      formSale.tax = formSaleDetails.reduce((prev, curr: SaleDetail) => { return prev + (curr.tax);},0);
      if(formSale.tax !== 0){
        formSale.total = formSale.subTotal * formSale.tax;
      }else{
        formSale.total = formSale.subTotal;
      }

      this.itemform.patchValue({ sale: formSale });
      console.log(`Form SALE AFTER`, this.itemform.get("sale").value);

      console.log("formSale.subTotal, formSale.tax, formSale.total AFTER", formSale.subTotal, formSale.tax, formSale.total);
      //   return prev + (curr.total);
      // }, 0);

      // this.tax = formSale.reduce((prev, curr:SaleDetail) => {
      //   return prev + (curr.tax);
      // }, 0);

      // this.total += this.subTotal * this.tax;
    }

    console.log("this.itemform.value", this.itemform.value);
    
  }



  onSubmit() {
    console.log("this.itemform.getRawValue()", this.itemform.getRawValue());
    console.log("this.update", this.update);
    
    if(this.update){
      this.apiHelper.updateRecord(this.itemform.getRawValue());
    }else{
      this.apiHelper.saveRecord(this.itemform.getRawValue());
    }

  }

  formatText(text: string) {
    text =
      text[0].toLocaleUpperCase() +
      text.replace(/([a-z])([A-Z])/g, "$1 $2").slice(1);
    return text;
  }

  // selectedclient(event){
  //   console.log("selectedclient event", event.option.value);

  // }

  displayFn(client: Client): string {
    // console.log("client from diplayfn before init", client);
    if(client){
      client = new Client(client);
    }else {
      client = new Client()   // console.log("client from diplayfn", client)
    }     
    return client && client.firstName || client.lastName ? client.getFullName() : '';
  }


  
  addSaleDetail(){



    console.log("this.total", this.total);
    // let InvoiceSDs: SaleDetail[] = []
    const newSaleDetail: SaleDetail = new SaleDetail();
    
    // InvoiceSDs = this.tableData$.DATA$.value.map((el) => {
      //   return new SaleDetail(el);
      // })

    let dialogref = this.dialog.open(DisplayModalComponent, {
      data: newSaleDetail,
      panelClass: "DisplayModal",
    });

    dialogref.afterClosed().subscribe((result) => {
      console.log("result", result);
      if (result === null || result === undefined || typeof result === 'undefined'){
        console.log("result IN THE IF", result);
        return
      }
        result as SaleDetail;

        this.subTotal = 0
        this.tax = 0
        this.total = 0


        newSaleDetail.invoiceId = +this.actroute.snapshot.params["id"];
        newSaleDetail.productName = result.product.productName;
        newSaleDetail.productId = result.product.id;
        newSaleDetail.description = result.product.description;
        newSaleDetail.quantity = +result.quantity;
        newSaleDetail.unitPrice = result.product.retailPrice;
        newSaleDetail.tax = result.tax;
        newSaleDetail.subTotal = +result.quantity * +result.product.retailPrice;

        if (newSaleDetail.tax !== 0){
          newSaleDetail.total += newSaleDetail.subTotal * newSaleDetail.tax;
        }else{
          newSaleDetail.total += newSaleDetail.subTotal;
        }

      
      // let formSaleDetails = this.itemform.get("saleDetails").value;
      // formSaleDetails.push(newSaleDetail);
      
      // this.itemform.patchValue({ saleDetails: formSaleDetails });
      
      console.log("newsaleDetail", newSaleDetail);
      
      console.log("this.itemform.value", this.itemform.value);
      let formSale: Sale;
      
      

      let formSaleDetails = this.itemform.get("saleDetails").value;
      formSaleDetails.push(newSaleDetail);
      // this.saleDetailsData = new TableDataSource<SaleDetail>(formSaleDetails);
      this.saleDetailsData.DATA$.next(formSaleDetails);
      
      


      // this.itemform.patchValue({ SaleDetail: formSaleDetails });

      
      // this.itemform.patchValue({ invoiceNumber: "1234567890" });

      console.log("this.total", this.total);

      this.updateSale();

    
  });
  
  const formSaleDTs = this.itemform.get("saleDetails").value
    console.log("formSaleDTsOUT", formSaleDTs);



    console.log("this.apiHelper.recsType", this.apiHelper.recsType);
    
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
    if (prop.formControlName !== "client") {
      return true;
    } else {
      const formControlValue = this.itemform.get(prop.formControlName).value;
      
      if (typeof formControlValue === "object" && formControlValue !== null) {
        return this.objectHasEmptyProperties(formControlValue);
      }
    }
  }

  resetAutoComplete(prop) {
    // console.log("prop from reset", prop);

    this.itemform.get(prop.formControlName).setValue({});
    this.selectInputValue = {};
  }

  objectHasEmptyProperties(object) {
    if (Object.values(object).every((x) => x === null || x === "" || x === undefined || x === 0 )) {
      return true;
    } else {
      return false;
    }
  }

  add(element){
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



        if (prop === "sale") {
          if(object[prop] === null){
            object[prop] = new Sale();
          }
          if(object[prop]){

            this.itemform.addControl(
              prop,
              this.fb.group(object[prop])
            );
            this.itemform.get("sale").disable();
          }
          console.log("object[prop] SALE",object[prop]) ;
        }

        // if (prop === "amountDue") {
        //   // Included = false;
        // }


        if (object[prop] === true || object[prop] === false) {
          isBoolean = true;
          this.itemform.addControl(
            prop,
            new FormControl(object[prop])
          );
          type = "boolean";
        } else {
          if (prop === "client") {
            needSelectInput = true;
            this.isInvoice = true;
            this.apiHelper.getClients().subscribe(clients => {
              this.selectInputData = clients;
            })




          }

          if (prop.toLowerCase().includes("date")) {
            needDatePicker = true;
            this.itemform.addControl(
              prop,
              new FormControl(new Date(object[prop]))
            );
          } else {
            this.itemform.addControl(
              prop,
              new FormControl(object[prop])
            );
          }
        }

        if (object.id != undefined) {
          if (object.id == 0) {
            this.Title = `Add new ${object.constructor.name}`;
          } else {
            this.Title = `Editing ${object.constructor.name}  ${object.id}`;
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

              this.saleDetailsData = new TableDataSource<SaleDetail>(SDTS);
            })
          }
          this.apiHelper.recID = object.id;
          
          
          
        }
        if (typeof (object[prop]) === "number"){
          type = "number";
        }

        if(prop === "retailPrice"){
          console.log("retailPrice", typeof(object[prop]));
          
        }
        // type = typeof (object[prop]);
        

        // console.log("object parameter", object);

        // this.formControlsArray.push({this.itemform. : this.fb.control("")});
      
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
      }).filter(prop =>{
        return prop.Included
      });
      
    }
    console.log("this.itemProperties", this.itemProperties);
  }
}



