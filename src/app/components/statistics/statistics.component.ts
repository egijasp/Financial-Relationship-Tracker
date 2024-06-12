import { Component } from '@angular/core';
import { TransactionService } from '../../transaction.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent {
  readonly largestDebt = this.financeService.largestBorrower();
  readonly largestLoan = this.financeService.largestLender();

  constructor(private financeService: TransactionService) {}
}
