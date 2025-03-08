import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceComponent } from './invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { TableModule } from 'src/app/sharedFeatures/table/table.module';
import { AngularMaterialModule } from 'src/app/sharedFeatures/angular-material/angular-material.module';
import { InvoiceDisplayComponent } from './invoice-display/invoice-display.component';
import { InvoiceDisplayRoutingModule } from './invoice-display/invoice-display-routing.module';
// import { TableComponent } from 'src/app/components/table/table.component';


@NgModule({
  declarations: [InvoiceComponent],
  imports: [CommonModule, InvoiceRoutingModule, TableModule, AngularMaterialModule],
  exports: [InvoiceComponent],
})
export class InvoiceModule {}
