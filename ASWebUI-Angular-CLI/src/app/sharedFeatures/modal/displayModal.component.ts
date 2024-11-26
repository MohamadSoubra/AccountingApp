import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { isEmpty } from "rxjs/operators";
import { ClientsComponent } from "src/app/components/clients/clients.component";
import { Client } from "src/app/models/client.model";
import { Identification } from "src/app/models/Identification.interface";
import { Product } from "src/app/models/product.model";
import { ApiHelperService } from "src/app/services/ApiHelper.service";

interface ModalSaleDetail {
  product: Product[];
  quantity: number;
  price: number ;
  tax: number;
};

@Component({
  selector: "app-overView",
  templateUrl: "./displayModal.component.html",
  styleUrls: ["./displayModal.component.scss"],
})
export class DisplayModalComponent<T extends Identification> implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public displayItem,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DisplayModalComponent<T>>,
    private apiHelper: ApiHelperService<T>
  ) {}

  Title: string = "NO-ID";
  itemProperties;
  itemFormArray = this.fb.array([]);
  formControlsArray = [];
  formItemSaleDetail = this.fb.group({});
  labelstext = [];
  selectValue = false;
  selectInputData: any;
  selectInputValue: any;
  ModalSD: ModalSaleDetail = { product: [],price: 0, quantity: 0, tax: 0  };
  DisplayModal$: Observable<Product[]>
  // autoCompleteValue: any;

  @ViewChild(HTMLElement) blurinput: HTMLElement

  ngOnInit(): void {
    //console.log(Object.entries(this.displayItem));
    //this.displayItem = this.data.map((value) => String(value));
    // console.log("this.displayItem", this.displayItem);
    // console.log("this.displayItem.id", this.displayItem.id);
    // console.log("this.displayItem.constructor.name", this.displayItem.constructor.name );
    // console.log("Object.keys(this.displayItem)", Object.keys(this.displayItem));
    // console.log("Object.keys(Product)", Object.keys(new Product()));
    // this.ModalSD = { product: [{ id: 90, productName: "testName", description: "testDesc", retailPrice: 1000, quantityInStock: 1000, isTaxable: false }],price: 0, quantity: 0, total: 0  };
    // this.ModalSD = { product: [],price: 0, quantity: 0, total: 0  };
    // this.ModalSD.products = [{ id: 90, productName: "testName", description: "testDesc", retailPrice: 1000, quantityInStock: 1000, isTaxable: false }];

    // this.apiHelper.getProducts().subscribe((products) => {
    //   return this.ModalSD.product = products;
    // })

    console.log("this.itemform.value",this.formItemSaleDetail.value);
    
    this.DisplayModal$ = this.apiHelper.getProducts();
    console.log("ModalSD", this.ModalSD);



    // console.log("this.ModalSD", this.ModalSD);
    

    if (this.displayItem.id != undefined) {
      if (this.displayItem.id == "") {
        this.Title = `Add new ${this.displayItem.constructor.name}`;
      } else {
        this.Title = `Editing ${this.displayItem.constructor.name}  ${this.displayItem.id}`;
      }
    } else {
      this.Title = "Id was not found";
    }
    

    
    this.DisplayModal$.subscribe(prods => {
      this.ModalSD.product = prods

      this.GenerateFormFromObject(this.ModalSD)
    })


    

    console.log("this.itemProperties", this.itemProperties);
    
    // console.log(this.itemFormArray);
    // console.log(`Item Propertes ${JSON.stringify(this.itemProperties)}`);
    // console.log(this.formControlsArray);

    // this.itemform = this.fb.group({ itemFormArray: this.itemFormArray });

    // console.log("this.itemform.controls.client", this.itemform.controls.client);
    // console.log("this.itemform", this.itemform);
    // console.log("this.selectInputData", this.selectInputData);

    // this.blurinput.blur();

  }

  onSubmit() {
    this.dialogRef.close(this.formItemSaleDetail.value);
  }

  closeDialog(){
    this.dialogRef.close(undefined);
  }

  formatText(text: string) {
    text =
      text[0].toLocaleUpperCase() +
      text.replace(/([a-z])([A-Z])/g, "$1 $2").slice(1);
    return text;
  }

  displayFn(client: Client): string {
    return client && client.firstName ? client.firstName : "";
  }
  
  displayFnSD(product: Product): string {
    return product && product.productName ? product.productName : "";
  }

  //this methos is for getting the type of the object injected into this class
  //to dinamically change the material dialoge title
  getType(object) {
    // Object.keys(object).
  }

  AddClient() {
    const newClient = new Client();

    // this.dialog
    //   .open(DisplayModalComponent, {
    //     data: newClient,
    //     panelClass: "DisplayModal",
    //   })
    //   .afterClosed()
    //   .subscribe((res) => {
    //     if(!this.objectHasEmptyProperties(res)){
    //       this.itemform.controls.client.setValue(res) 
    //       // this.autoCompleteValue = res;
    //     }
    //   });
  }

  autoCompleteIsEmpty(prop): boolean {
    // console.log("prop",prop);
    
    if (prop.formControlName !== 'product' ){
      return true;
    }else{
      const formControlValue = this.formItemSaleDetail.get(prop.formControlName).value
      // console.log("formControlValue", formControlValue);
      if (typeof formControlValue === 'object' && formControlValue !== null){
        return this.objectHasEmptyProperties(formControlValue);
      }
    }
  }

  resetAutoComplete(prop){
    this.formItemSaleDetail.get(prop.formControlName).setValue({});
    this.formItemSaleDetail.get("price").setValue(0);

  }

  objectHasEmptyProperties(object){
    if (Object.values(object).every((x) => x === null || x === "" || x === 0 || x === undefined)) {
      return true;
    } else {
      return false;
    }
  }

  getItem(id: string){
    console.log(this.apiHelper.getByID("products", id));
     
    this.apiHelper.getByID("products", id).subscribe(product => {
      console.log(product);
      
      this.formItemSaleDetail.get('price').setValue(product.retailPrice);
    })
    console.log(this.formItemSaleDetail);
    
  }

  GenerateFormFromObject(object: ModalSaleDetail) {
    this.itemProperties = Object.keys(object)
      .map((prop) => {

        
        let Included = true;
        let isBoolean = false;
        let needSelectInput = false;
        let needDatePicker = false;

        

        if (prop === "product") {
          console.log("sucess");

          needSelectInput = true;
          console.log("this.selectInputData Before", this.selectInputData);
          console.log("object[prop]", object[prop]);
          // this.selectInputData = [{ id: 90, productName: "testName", description: "testDesc", retailPrice: 1000, quantityInStock: 1000, isTaxable: false }]
          this.selectInputData = object[prop]

          // this.apiHelper.getProducts().subscribe(products => {
          //   object.products = products;
          // });

          console.log("this.selectInputData After", this.selectInputData);
        }



        if (prop.toLowerCase().includes("date")) {
          needDatePicker = true;
          this.formItemSaleDetail.addControl(
            prop,
            new FormControl(new Date(object[prop]))
          );
        } else {
          this.formItemSaleDetail.addControl(
            prop,
            new FormControl(object[prop])
          );
        }
        // }

        // console.log(`${prop} string Length ${prop.length}`);
        // console.log(` string Length ${this.displayItem[prop].length}`);

        // if (
        //   this.displayItem[prop] != null ||
        //   this.displayItem[prop] != undefined
        // ) {
        //   String(this.displayItem[prop]);
        // }

        let needTextArea = false;
        if (prop === "description" || this.displayItem[prop]?.length > 20) {
          needTextArea = true;
        }


        if (prop.match(/id/gi)) {
          console.log(prop);
          Included = false;
        }

        let width: string = "";

        switch (prop) {
          case "firstName":
            width = "350";
            break;

          case "lastName":
            width = "50";
            break;

          default:
            width = "100";
            break;

        }

        // this.formControlsArray.push({this.itemform. : this.fb.control("")});
        return {
          labelsText: this.formatText(prop),
          formControlName: prop,
          value: object[prop],
          isBoolean: isBoolean,
          Included: Included,
          needTextArea: needTextArea,
          needSelectInput: needSelectInput,
          needDatePicker: needDatePicker,
          width: width,
        };
      }).filter((item) => item.Included);
  }

  
}
