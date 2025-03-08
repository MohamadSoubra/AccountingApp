import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./components/home/home.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AlertModule } from "ngx-bootstrap/alert";


import { AuthModule } from "./auth/auth.module";
import { AuthService } from "./auth/auth.service";
import { AuthGuard } from "./auth/auth.guard";
import { TokenInterceptorService } from "./auth/token-interceptor.service";
import { ClientsComponent } from "./components/clients/clients.component";
import { SuppliersComponent } from "./components/suppliers/suppliers.component";
import { RouterModule } from "@angular/router";
import { HeaderComponent } from "./components/header/header.component";
// import { TableComponent } from "./components/table/table.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatTableModule } from "@angular/material/table";
import { TesttableComponent } from "./testtable/testtable.component";
import { MatDialogModule } from "@angular/material/dialog";
import { ClientFormComponent } from './components/clients/client-form/client-form.component';
import { InvoiceModule } from "./features/invoice/invoice.module";
import { DisplayModalComponent } from "./sharedFeatures/modal/displayModal.component";
import { AddEditModule } from "./sharedFeatures/add-edit/add-edit.module";
import { AngularMaterialModule } from "./sharedFeatures/angular-material/angular-material.module";
import { TableModule } from "./sharedFeatures/table/table.module";
import { ProductsComponent } from "./components/products/products.component";
import { InvoiceDisplayModule } from "./features/invoice/invoice-display/invoice-display.module";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductsComponent,
    ClientsComponent,
    SuppliersComponent,
    HeaderComponent,
    TesttableComponent,
    DisplayModalComponent,
    ClientFormComponent,
    //LoadingSpinnerComponent
  ],
  imports: [
    HttpClientModule,
    AuthModule,
    AlertModule.forRoot(),
    RouterModule,
    InvoiceModule,
    InvoiceDisplayModule,
    AddEditModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    TableModule,
    AppRoutingModule,
    
  ],
  
  exports: [],

  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
