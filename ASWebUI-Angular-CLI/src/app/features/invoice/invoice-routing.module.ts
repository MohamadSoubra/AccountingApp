import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDisplayComponent } from './invoice-display/invoice-display.component';
import { InvoiceComponent } from './invoice.component';
import { InvoiceModule } from './invoice.module';

const routes: Routes = [
  {
    path: "invoices",
    component: InvoiceComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
