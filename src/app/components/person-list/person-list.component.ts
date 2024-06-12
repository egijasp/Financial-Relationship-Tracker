import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Person } from '../../transaction';
import { TransactionService } from '../../transaction.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    MatListModule,
    CommonModule,
    MatDividerModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  templateUrl: './person-list.component.html',
  styleUrl: './person-list.component.scss',
})
export class PersonListComponent implements OnInit {
  persons: Person[] = this.financeService.getPeople();
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  showFirstLastButtons = true;
  hidePageSize = false;
  pageIndex = 0;
  length = this.persons.length;
  pagedPersons: Person[] = [];

  constructor(public financeService: TransactionService) {}

  ngOnInit(): void {
    this.updatePagedPeople();
  }

  handlePageEvent(e: PageEvent) {
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.updatePagedPeople();
  }

  updatePagedPeople(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedPersons = this.persons.slice(startIndex, endIndex);
  }
}
