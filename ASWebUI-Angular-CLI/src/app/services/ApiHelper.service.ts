import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { catchError, tap, mapTo, map, exhaustMap, take } from "rxjs/operators";
import { throwError, of, Observable, BehaviorSubject } from "rxjs";
import { Product } from "../models/product.model";
import { AuthService } from "../auth/auth.service";
import { Client } from "../models/client.model";
import { Invoice } from "../models/invoice.model";
import { SaleDetail } from "../models/sale-detail.model";
import { Sale } from "../models/sale.model";
import { User } from "../models/User.model";
import { Supplier } from "../models/supplier.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})

export class ApiHelperService<T> {
  rootUrl: string = environment.apiUrl;
  objectbyId: any;
  recsType :string;
  recID: number;

  constructor(private http: HttpClient, private authService: AuthService) {}


  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.rootUrl}/api/product`).pipe(
      map((products: Product[]) => {
        return products
      }),
      catchError((error) => {
        console.log("error from api helper");
        console.log(error);
        return throwError(error);
      })
    );
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.rootUrl}/api/client`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.rootUrl}/api/invoice`)
  }

  saveInvoice(invoice: Invoice){
    this.http.post<Invoice>(`${this.rootUrl}/api/Invoice`, invoice).subscribe(); 
  }

  updateInvoice(invoice: Invoice){
    this.http.put<Invoice>(`${this.rootUrl}/api/Invoice/UpdateInvoice`, invoice).subscribe();
  }
  
  saveProduct(product : Product){
    this.http.post<Product>(`${this.rootUrl}/api/product`, product).subscribe();
  }

  updateProduct(product : Product){
    this.http.put<Product>(`${this.rootUrl}/api/product/UpdateProduct`, product).subscribe();
  }

  saveClient(client : Client){
    this.http.post<Client>(`${this.rootUrl}/api/client`, client).subscribe();
  }

  updateClient(client : Client){
    this.http.put<Client>(`${this.rootUrl}/api/client/UpdateClient`, client).subscribe();
  }

  saveSupplier(supplier : Supplier){
    this.http.post<Supplier>(`${this.rootUrl}/api/supplier`, supplier).subscribe();
  }
  updateSupplier(supplier : Supplier){
    this.http.put<Supplier>(`${this.rootUrl}/api/supplier/UpdateSupplier`, supplier).subscribe();
  }

  saveSale(SaleDetail: SaleDetail[]) {
    return this.http.post<SaleDetail[]>(`${this.rootUrl}/api/Sale`, SaleDetail).subscribe();;
  }

  updateSale(SaleDetail: SaleDetail[], InvoiceID: number) {
    this.http.put<SaleDetail[]>(`${this.rootUrl}/api/Sale/UpdateSale/${InvoiceID}`, SaleDetail ).subscribe();
  }

  getUserId(){
    this.http.get<User>(`${this.rootUrl}/api/User`).subscribe(user => {
      return user.id;
    });
  }

  

  saveRecord(object: unknown) {
    console.log("object SaveRecord", object);
    
    console.log("recsType", this.recsType);
    switch (this.recsType) {
      case "Product":
        console.log("Product");
        const product = object as Product;
        let pts = new Product();
        pts.id = product.id;
        pts.productName = product.productName;
        pts.description = product.description;
        pts.retailPrice = +product.retailPrice;
        pts.isTaxable = product.isTaxable;
        pts.quantityInStock = +product.quantityInStock;
        this.saveProduct(pts);
        break;
        case "Client":
        console.log("Client");
        this.saveClient(object as Client);
        break;
        case "Supplier":
        this.saveSupplier(object as Supplier);
        console.log("Supplier");
        break;
      case "Invoice":
        const invoicetoSave = new Invoice();
        const inputInvoice = object as Invoice;
        invoicetoSave.invoiceNumber = inputInvoice.invoiceNumber;
        invoicetoSave.invoiceDate = inputInvoice.invoiceDate;
        invoicetoSave.paymentDueDate = inputInvoice.paymentDueDate;
        invoicetoSave.description = inputInvoice.description;
        invoicetoSave.client = inputInvoice.client;
        invoicetoSave.amountDue = +inputInvoice.amountDue;
        invoicetoSave.status = inputInvoice.status;
        invoicetoSave.sale = inputInvoice.sale;
        invoicetoSave.saleDetails = inputInvoice.saleDetails;
        console.log("invoicetoSave", invoicetoSave);
        console.log("object in invoice", object);
        this.saveInvoice(invoicetoSave);
        // this.saveSale(invoicetoSave.saleDetails);
        
        break;
      default:
        {
          console.log("default");
        }
        break;
    }

  }

  updateRecord(object: unknown) {
    console.log("Updaaaaate");
    
    console.log("recsType", this.recsType);
    switch (this.recsType) {
      case "Product":
        console.log("Product");
        const product = object as Product;
        let pts = new Product();
        pts.id = product.id;
        pts.productName = product.productName;
        pts.description = product.description;
        pts.retailPrice = product.retailPrice;
        pts.isTaxable = product.isTaxable;
        pts.quantityInStock = product.quantityInStock;
        this.updateProduct(pts);
        break;
      case "Client":
        console.log("Client");
        // this.saveClient(object as Client);
        this.updateClient(object as Client);
        break;
      case "Supplier":
        this.updateSupplier(object as Supplier);
        console.log("Supplier");
        break;
      case "Invoice":
        const invoicetoupdate = new Invoice();
        invoicetoupdate.id = (object as Invoice).id;
        invoicetoupdate.invoiceNumber = (object as Invoice).invoiceNumber;
        invoicetoupdate.invoiceDate = (object as Invoice).invoiceDate;
        invoicetoupdate.paymentDueDate = (object as Invoice).paymentDueDate;
        invoicetoupdate.description = (object as Invoice).description;
        invoicetoupdate.client = (object as Invoice).client;
        invoicetoupdate.amountDue = (object as Invoice).amountDue;
        invoicetoupdate.status = (object as Invoice).status;
        invoicetoupdate.saleDetails = (object as Invoice).saleDetails;
        invoicetoupdate.sale = new Sale((object as Invoice).sale);
        this.updateInvoice(invoicetoupdate);
        // this.updateSale(invoicetoupdate.saleDetails, invoicetoupdate.id);
        console.log("invoicetoupdate", invoicetoupdate);
        console.log("Invoice");
        break;
      // case "SaleDetail":
      //   this.updateSaleDetail([object] as SaleDetail[]).subscribe();
      //   console.log("SaleDetail");
      //   break;
      default:
        {
          console.log("default");
        }
        break;
    }

  }

  getRecords(type: string, invoiceID: number = 0): Observable<Invoice[] | SaleDetail[]>  {
    console.log(type);

    // console.log("object.constructor.name", object.constructor.name);
    switch (type) {
      case "Product":
        console.log("getRecords Product");
        // return this.getProducts();
        break;
      case "Client":
        console.log("getRecords Client");
        this.getClients();
        break;
      case "Supplier":
        console.log("getRecords Supplier");
        this.getSuppliers();
        break;
      case "Invoice":
        console.log("getRecords Invoice");
        return this.getInvoices();
        break;
      case "Saledetail":
        console.log("getRecords Saledetail");
        return this.getSaleDetailsByInvoiceID(invoiceID);
        break;
      default:
        {
          console.log("default");
        }
        break;
    }

  }

  deleteInvoice(invoice : Invoice){
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: invoice.id,
    };
    return this.http.delete(`${this.rootUrl}/api/invoice/DeleteInvoice/`, httpOptions).subscribe();
  }

  deleteSaleDetail(saleDetail: SaleDetail){
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: [`${saleDetail.id}`],
    };
    return this.http.delete(`${this.rootUrl}/api/invoice/DeleteSaleDetail/`, httpOptions).subscribe();
  }

  deleteProduct(product : Product){
    //Modify so that the body of http options is array of product Ids
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: [product.id],
    };
    return this.http.delete(`${this.rootUrl}/api/product`, httpOptions).subscribe();
  }

  deleteClient(client : Client){
        const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
          body: client.id,
    };
    return this.http.delete(`${this.rootUrl}/api/Client/DeleteClient/`, httpOptions).subscribe();
  }

  deleteSupplier(supplier : Supplier){
        const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
          body: [supplier.id],
    };
    return this.http.delete(`${this.rootUrl}/api/supplier`, httpOptions).subscribe();
  }

  deleteRecord(object: any, type) {
    console.log(object);
    
    console.log("object.constructor.name", object.constructor.name);
    switch (type) {
      case "Product":
        console.log(`Product ${object.id} will be Deleted`);
        this.deleteProduct(object);
        break;
        case "Client":
        console.log(`Client ${object.id} will be Deleted`);
          this.deleteClient(object);
        break;
        case "Supplier":
        console.log(`Supplier ${object.id} will be Deleted`);
          this.deleteSupplier(object);
        break;
        case "Invoice":
        console.log(`Invoice ${object.id} will be Deleted`);
          this.deleteInvoice(object);
        break;
        case "SaleDetail":
        console.log(`SaleDetail ${object.id} will be Deleted`);
          this.deleteSaleDetail(object);
        break;
      default:
        {
          console.log("default");
        }
        break;
    }

  }

  getSaleDetailsByInvoiceID (ID): Observable<SaleDetail[]>{
    let params = new HttpParams({});
    params = params.append("InvoiceId", ID);

    return this.http.get<SaleDetail[]>(`${this.rootUrl}/api/invoice/GetInvoiceSaleDetails`, { params });
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.rootUrl}/api/supplier`).pipe(
      map((suppliers: Supplier[]) => {
        return suppliers;
      }),
      catchError((error) => {
        console.log("error from api helper");
        console.log(error);
        return throwError(error);
      })
    );
  }

  deleteProducts(products: any) {
    //Modify so that the body of http options is array of product Ids
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      body: products,
    };
    return this.http.delete(`${this.rootUrl}/api/product`, httpOptions);
  }

  getInvoiceById(ID: any) {
    let params = new HttpParams({});
    params = params.append("InvoiceId", ID);

    return this.http.get(`${this.rootUrl}/api/invoice/GetInvoiceById`, {params}).pipe(
      map((invoice: Invoice) => {
        console.log("invoice get by id",invoice);
        return new Invoice(invoice)
      }),
      catchError((error) => {
        console.log("error from api helper");

        console.log(error);

        return throwError(error);
      })
    );
  }

  getProductById(ID: any){
   let params = new HttpParams();
    params = params.append('ProductId', ID);
    return this.http.get<Product>(`${this.rootUrl}/api/product/getProductByID`, { params })
    .pipe(
      map((product: Product) =>  {
        return new Product(product);
      }),
      catchError((error) => {
        console.log("error from api helper");
        console.log(error);
        return throwError(error);
      }));
  } 

  getclientById(ID: any) {
    let params = new HttpParams();
    params = params.append('ClientId', ID);
    return this.http.get(`${this.rootUrl}/api/Client/getClientByID`,{params}).pipe(
      map((client: Client) => {
        return new Client(client);
      }),
      catchError((error) => {
        console.log("error from api helper");

        console.log(error);

        return throwError(error);
      })
    );
  }
  
  getSupplierById(ID: any) {
    let params = new HttpParams();
    params = params.append('SupplierId', ID);
    return this.http.get<Supplier>(`${this.rootUrl}/api/Supplier/getSupplierByID`, { params }).pipe(
      map((supplier: Supplier) => {
        return new Supplier(supplier);
      }),
      catchError((error) => {
        console.log("error from api helper");

        console.log(error);

        return throwError(error);
      })
    );
  }

  getByID<T>(ObjectTypeAsString, ID){
    console.log("object getByID", ObjectTypeAsString);
    console.log("ID", ID);
    // console.log("object.constructor.name", object.constructor.name);
    let result;
    switch (ObjectTypeAsString) {
      case "products":
      result = this.getProductById(ID);
      break;
      case "clients":
      result = this.getclientById(ID);
      break;
      case "suppliers":
      result = this.getSupplierById(ID);
      break;
      case "invoices":
      result = this.getInvoiceById(ID);
        console.log("getByID Invoices Result", result);
      
      break;
      // case "saleDetails":
      // object = this.getSaleDetailById(ID);
      // break;
      default:
      {
      }
      break;
    }
    
    return result;
  }

  objectIsEmpty(object) {
    let emptyProperties;
    if (object) {
      emptyProperties = Object.keys(object)?.every(
        (prop) => prop?.length === 0 || prop === "" || prop === null
      );
    }

    if (
      !object ||
      (Object.keys(object)?.length === 0 && object.constructor === Object) ||
      emptyProperties ||
      JSON.stringify(object) === "{}"
    ) {
      return true;
    }

    return false;
  }


  ParseJSONArray(jObjectArray){
    
   return jObjectArray.map(obj => {
      return this.ParseJSON(obj)
    })
  }

  ParseJSON(JSONObject){
    
    //JSON parse example
    return JSON.parse(JSON.stringify(JSONObject), function(k, v) { 
      // console.log(v);
      
      return (typeof v === "object" || isNaN(v)) || typeof v === "boolean" || isNaN(parseInt(v, 10)) ? v : parseInt(v, 10); 
    });
  }

  isOfType(obj1, obj2): boolean{
    let result = false;
    // console.log(obj1.constructor.name);
    // console.log(obj2.constructor.name);

    if (obj1.constructor.name === obj2.constructor.name){
      result = true;
    }
    
    Object.keys(obj1).forEach(key => {
      Object.keys(obj2).forEach(key2 =>{
        key === key2;
      })
      result = true;
    })
    return result
  }

  InitializeType(object?: any) {
     console.log("object", object);

    switch (object) {
      case "products":
        object = new Product(object);
        break;
      case "clients":
        object = new Client(object);
        break;
      case "suppliers":
        object = new Supplier(object);
        break;
      case "invoices":
        object = new Invoice(object);
        break;
      case "saleDetails":
        object = new SaleDetail(object);
        break;
      default:
        {
        }
        break;
    }
    return object;
  }
}
