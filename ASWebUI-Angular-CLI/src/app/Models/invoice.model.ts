import { Client } from "./client.model";
import { Identification } from "./Identification.interface";
import { SaleDetail } from "./sale-detail.model";
import { Sale } from "./sale.model";

export enum InvoiceStatus {
  Pending = "Pending",
  Paid = "Paid",
  Overdue = "Overdue",
  Draft = "Draft",
}

export const InvoiceStatus2LabelMapping: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Pending] : "Pending",
  [InvoiceStatus.Paid] : "Paid",
  [InvoiceStatus.Overdue] : "Overdue",
  [InvoiceStatus.Draft] : "Draft",
};

export class Invoice implements Identification {
  id: number;
  // [client: string | number]: string | number | Client;
  client?: Client ;
  // clientId: number;
  status: InvoiceStatus;
  sale? : Sale;
  invoiceNumber: string;
  description: string;
  invoiceDate: string;
  paymentDueDate: string;
  amountDue: number;
  saleDetails: SaleDetail[];
  // subTotal: number;
  // tax: number;
  // total;


  constructor({
    id = 0,
    invoiceNumber = "",
    client = new Client(),
    // clientId = 0,
    status = InvoiceStatus.Draft,
    description = "",
    invoiceDate = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
    paymentDueDate = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
    amountDue = 0,
    saleDetails = [],
    sale = new Sale()
  } = {}) {
    this.id = id;
    this.invoiceNumber = invoiceNumber;
    // this.clientId = clientId;
    this.client = client;
    this.status = InvoiceStatus.Pending;
    this.description = description;
    this.invoiceDate = new Date(invoiceDate).toLocaleDateString("en-US",{day :"2-digit", month:"short", year:"numeric"});
    this.paymentDueDate = new Date(paymentDueDate).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
    this.amountDue = amountDue;
    this.saleDetails = saleDetails;
    this.sale = sale;
  }
}
