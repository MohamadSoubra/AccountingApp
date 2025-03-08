import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Identification } from 'src/app/models/Identification.interface';
import { Supplier } from 'src/app/models/supplier.model';
import { ApiHelperService } from 'src/app/services/ApiHelper.service';
import { TableDataSource } from 'src/app/sharedFeatures/table/table-datasource';

@Component({
  selector: "app-suppliers",
  templateUrl: "./suppliers.component.html",
  styleUrls: ["./suppliers.component.scss"],
})
export class SuppliersComponent<T extends Identification> implements OnInit {
  suppliersList: Supplier[];
  suppliersTableColumns: any 
  componentName: string = "Supplier";

  constructor(private api: ApiHelperService<T>, private router: Router,
    private actRout: ActivatedRoute) {
    api.recsType = "Supplier"
  }

  ngOnInit() {
    // this.suppliersList = this.api.getSuppliers();
    this.initializeColumns()
    this.getSuppliers();
    console.log("this.suppliersList$", this.suppliersList);
    
  }

  getSuppliers(){
    this.api.getSuppliers().subscribe(suppliers => {
      console.log("suppliers", suppliers);
      
      this.suppliersList = suppliers;
      console.log("this.suppliersList$", this.suppliersList);
      
    });
  }

  batchDelete() {

  }

  delete(element) {
    console.log("Delete", element);
    this.api.deleteRecord(element, this.componentName);
  }

  AddRecord() {
    this.router.navigate(["./", 0], {
      relativeTo: this.actRout,
    });

  }

  initializeColumns(): void {
    /*
    Supplier {
      id?: number;
      accountNumber: string;
      companyName: string;
      contactName: string;
      emailAddress: string;
      address: string;
      phoneNumber: string;
      country: string;
      city: string;
    }*/

    this.suppliersTableColumns = [
      {
        name: "Account Number",
        dataKey: "accountNumber",
        isSortable: true,
        isFilterable: true,
      },
      {
        name: "Company",
        dataKey: "companyName",
        isSortable: true,
        isFilterable: true,
      },
      {
        name: "Contact",
        dataKey: "contactName",
        isSortable: true,
        isFilterable: true,
      },
      {
        name: "Address",
        dataKey: "address",
        isSortable: true,
        isFilterable: true,
      },
      {
        name: "Email",
        dataKey: "emailAddress",
        isSortable: true,
        isFilterable: true,
      },
      {
        name: "Phone",
        dataKey: "phoneNumber",
        isFilterable: false,
      },
      {
        name: "Country",
        dataKey: "country",
        isFilterable: false,
      },
      {
        name: "City",
        dataKey: "city",
        isFilterable: false,
      },
    ];
  }



}
