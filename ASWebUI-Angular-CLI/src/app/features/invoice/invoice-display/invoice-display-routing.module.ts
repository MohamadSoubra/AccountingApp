import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDisplayComponent } from './invoice-display.component';


const routes: Routes = [
    {
        path: "invoices/display/:id",
        component: InvoiceDisplayComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InvoiceDisplayRoutingModule { }