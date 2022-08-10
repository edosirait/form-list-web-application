import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LayoutComponent} from './layout.component';
import {ListEmployeeComponent} from './list-employee.component';
import {AddEditEmployeeComponent} from './add-edit-employee.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      { path: '', component: ListEmployeeComponent },
      { path: 'add-employee', component: AddEditEmployeeComponent },
      { path: 'edit-employee/:id', component: AddEditEmployeeComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
