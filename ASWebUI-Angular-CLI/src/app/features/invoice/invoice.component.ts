import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { BehaviorSubject, combineLatest, Observable, of } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { Invoice } from "src/app/models/invoice.model";
import { Client } from "src/app/models/client.model";
import { ApiHelperService } from "src/app/services/ApiHelper.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Identification } from "src/app/models/Identification.interface";
// import { TableDataSource } from "src/app/sharedFeatures/table/table-datasource";
// import { TableColumn } from "../../Components/table/table.component";

@Component({
  selector: "app-invoice",
  templateUrl: "./invoice.component.html",
  styleUrls: ["./invoice.component.scss"],
})
export class InvoiceComponent<T extends Identification> implements OnInit {
  InvoiceList : Invoice[];
  invoice: Invoice;
  client: Client;
  invoicesTableColumns = [];
  paginationSizes: any[];
  defaultPageSize: number;
  componentName: string = "Invoice";
  editmode: boolean = false;

  myControl = new FormControl();
  filteredClients: Observable<Client[]>;

  Clients: Client[] = [];

  constructor(private api: ApiHelperService<T>, private router: Router,
    private actRout: ActivatedRoute,) {
      api.recsType = "Invoice"
    }

  ngOnInit() {
    
    this.initializeColumns();
    this.getInvoices();

    console.log("this.InvoiceList", this.InvoiceList);

    this.filteredClients = this.myControl.valueChanges.pipe(
      startWith(""),
      map((value) => (typeof value === "string" ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.Clients.slice()))
    );
  }

  getInvoices(): void{
    this.api.getInvoices().subscribe(invoices => {
      this.api.getClients().subscribe(clients => {
        console.log("clients in get invs", clients);
        
        this.InvoiceList = invoices.map(inv => {
          inv = new Invoice(inv);
          inv.invoiceDate = new Date(inv.invoiceDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
          inv.paymentDueDate = new Date(inv.paymentDueDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
          
          clients.map(cli =>{
            const INvoice = new Invoice(inv)
            const CLient = new Client(cli);
            if (INvoice.client.id === CLient.id){
              INvoice.client = CLient;
            }
          })
          return inv
        })
      })
    })

    // this.InvoiceList$ = new TableDataSource<T>(this.api.getInvoices<T>());

  }

  getClients() {
    // this.api.getClients().subscribe(clients =>{
    //   this.Clients = clients
    // })
    this.api.getClients()
  }

  displayFn(user: Client): string {
    return user && user.firstName ? user.firstName : "";
  }

  private _filter(name: string): Client[] {
    const filterValue = name.toLowerCase();

    return this.Clients.filter((option) =>
      option.firstName.toLowerCase().includes(filterValue)
    );
  }

  // getInvoices() {
  //   this.api.getProducts().subscribe(
  //     (x) => {
  //       this.InvoiceList = x;
  //     },
  //     (error) => {
  //       console.log("from Invoices component", error);
  //     }
  //   );
  // }

  initializeColumns(): void {
    //     Invoice {
    //
    //  Id: number;
    //  invoicenumber: string;
    //  clientId: string;
    //  saleDetailId:string;
    //  description:string;
    //  paymentDueDate: string;
    //  amountDue: string;
    // }

      this.invoicesTableColumns = [
        {
          name: "Invoice Number",
          dataKey: "invoiceNumber",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Client",
          dataKey: "client",
          isFilterable: true,
          nestedProperty: "firstName",
        },
        {
          name: "Description",
          dataKey: "description",
          isFilterable: true,
        },
        {
          name: "Due Date",
          dataKey: "paymentDueDate",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Invoice Date",
          dataKey: "invoiceDate",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Amount",
          dataKey: "amountDue",
          isSortable: true,
          isFilterable: true,
        },
        {
          name: "Status",
          dataKey: "status",
          isSortable: true,
          isFilterable: true,
        },
      ];
    
  }

  batchDelete(){

  }

  AddRecord(){
    this.router.navigate(["./", 0], {
      relativeTo: this.actRout,
    });
    
  }

  edit(element: any) {
    console.log(element);
  }

  delete(element) {
    // this.InvoiceList$ = this.InvoiceList$.filter((el) => el !== element);
    // console.log("this.InvoiceList AFTER DELETE", this.InvoiceList);

    console.log("Delete", element);
    this.api.deleteRecord(element, this.componentName);
  }

  toggleEditmode() {
    if (this.editmode === true) {
      this.editmode = false;
    } else {
      this.editmode = true;
    }
    console.log(this.editmode);
  }
}
