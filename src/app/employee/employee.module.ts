import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {ListEmployeeComponent} from './list-employee.component';
import {LayoutComponent} from './layout.component';
import {AddEditEmployeeComponent} from './add-edit-employee.component';
import {EmployeeRoutingModule} from './employee.routing.module';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmployeeRoutingModule,
  ],
  declarations: [
    LayoutComponent,
    ListEmployeeComponent,
    AddEditEmployeeComponent
  ],
})
export class EmployeeModule { }
