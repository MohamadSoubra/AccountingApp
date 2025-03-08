import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, observable } from 'rxjs';
import { Client } from 'src/app/models/client.model';
import { Identification } from 'src/app/models/Identification.interface';
import { ApiHelperService } from 'src/app/services/ApiHelper.service';
import { TableDataSource } from 'src/app/sharedFeatures/table/table-datasource';

@Component({
  selector: "app-clients",
  templateUrl: "./clients.component.html",
  styleUrls: ["./clients.component.scss"],
})
export class ClientsComponent<T extends Identification> implements OnInit {
  clientList : Client[];
  clientTableColumns: any;
  componentName: string = "Client";
  paginationSizes: any[];
  defaultPageSize: number;
  constructor(private api: ApiHelperService<T>, private router: Router,
    private actRout: ActivatedRoute) {


    api.recsType = "Client"
  }

  ngOnInit() {
    this.initializeColumns();
    this.getClients();
    console.log("this.clientList", this.clientList);
    
  }

  getClients() {
    this.api.getClients().subscribe(clients => {


      this.clientList = clients;

    })
  }

  edit(client){
    console.log("Edited Client",client);
    
  }
  
  delete(element){
    console.log("Deleted Client", element);
    this.api.deleteRecord(element, this.componentName);
  }

  batchDelete() {

  }

  AddRecord() {
    this.router.navigate(["./", 0], {
      relativeTo: this.actRout,
    });

  }

  initializeColumns(): void {
    /*
    Client {
      Id: string;
      firstName: string;
      lastName: string;
      emailAddress: string;
      address: string;
      phoneNumber: string;
    }*/

      this.clientTableColumns = [
        {
          name: "Name",
          dataKey: "firstName",
          isSortable: true,
          isFilterable: true,
        },
      {
        name: "Last Name",
        dataKey: "lastName",
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
        name: "Phone Number",
        dataKey: "phoneNumber",
        isFilterable: false,
      },
    ];
  }

}
