import { Client } from "./client.model";
import { Identification } from "./Identification.interface";
import { SaleDetail } from "./sale-detail.model";
import { Sale } from "./sale.model";

// interface ClientName{
//   [client: string]: string | number;
// }

export class Invoice implements Identification {
  id: number;
  // [client: string | number]: string | number | Client;
  client?: Client ;
  // clientId: number;
  status: string;
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
    status = "Pending",
    description = "",
    invoiceDate = new Date().toString(),
    paymentDueDate = new Date().toString(),
    amountDue = 0,
    saleDetails = [],
    sale = new Sale()
  } = {}) {
    this.id = id;
    this.invoiceNumber = invoiceNumber;
    // this.clientId = clientId;
    this.client = client;
    this.status = status;
    this.description = description;
    this.invoiceDate = invoiceDate;
    this.paymentDueDate = paymentDueDate;
    this.amountDue = amountDue;
    this.saleDetails = saleDetails;
    this.sale=sale;
  }
}
