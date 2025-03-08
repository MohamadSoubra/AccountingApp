import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { FormsModule } from '@angular/forms';
import { DataPropertyGetterPipe } from './data-property-getter/data-property-getter-pipe';



@NgModule({
  // declarations: [TableComponent, DataPropertyGetterPipe],
  declarations: [TableComponent, DataPropertyGetterPipe],
  imports: [CommonModule, AngularMaterialModule, FormsModule],
  exports: [TableComponent, DataPropertyGetterPipe],
})
export class TableModule {}
