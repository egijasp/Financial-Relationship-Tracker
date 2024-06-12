import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { PersonListComponent } from './components/person-list/person-list.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { MatTabsModule } from '@angular/material/tabs';
import { StatisticsComponent } from './components/statistics/statistics.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    PersonListComponent,
    TransactionsComponent,
    StatisticsComponent,
    MatTabsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
