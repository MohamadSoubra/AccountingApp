import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceDisplayComponent } from './invoice-display.component';
import { AngularMaterialModule } from 'src/app/sharedFeatures/angular-material/angular-material.module';
import { InvoiceDisplayRoutingModule } from './invoice-display-routing.module';



@NgModule({
    declarations: [InvoiceDisplayComponent],
    imports: [
        CommonModule,
        AngularMaterialModule,
        InvoiceDisplayRoutingModule
    ],
    exports: [InvoiceDisplayComponent],
})
export class InvoiceDisplayModule { }