import {Component, OnInit} from '@angular/core';
import {first} from 'rxjs/operators';

import {AccountService} from '@app/_services';

@Component({templateUrl: 'list-employee.component.html'})
export class ListEmployeeComponent implements OnInit {
  employee = null;
  isLoading = false;

  constructor(private accountService: AccountService) {
  }

  ngOnInit() {
    this.accountService.getAllEmployee()
      .pipe(first())
      .subscribe((res) => {
        this.employee = res;
        this.isLoading = true;
      });

    if (this.employee === null) {
      this.isLoading = false;
    } else {
      this.isLoading = true;
    }
  }

  deleteEmployee(id: string) {
    const employee = this.employee.find(x => x.id === id);
    employee.isDeleting = true;
    this.accountService.delete(id)
      .pipe(first())
      .subscribe(() => this.employee = this.employee.filter(x => x.id !== id));
  }
}
