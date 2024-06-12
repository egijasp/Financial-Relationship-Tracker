import { Injectable, signal } from '@angular/core';
import { Person, Transaction } from './transaction';
import { people } from './mock-data';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private people: Person[] = JSON.parse(
    sessionStorage.getItem('people') || '[]'
  );

  constructor() {
    if (!this.people || this.people.length === 0) {
      this.people = people;
      this.updateSessionStorage();
    }
  }

  getPeople(): Person[] {
    return this.people;
  }

  updateSessionStorage(): void {
    sessionStorage.setItem('people', JSON.stringify(this.people));
  }

  transactionHistory(transaction: Transaction): string {
    const fromPerson = this.people.find(
      (p) => p.id === transaction.lenderId
    )?.name;
    const toPerson = this.people.find(
      (p) => p.id === transaction.borrowerId
    )?.name;
    if (transaction.type === 'borrow') {
      return `${toPerson} borrowed €${transaction.amount} from ${fromPerson}`;
    } else if (transaction.type === 'lend') {
      return `${fromPerson} lent €${transaction.amount} to ${toPerson}`;
    } else if (transaction.type === 'repay') {
      return `${fromPerson} repaid €${transaction.amount} to ${toPerson}`;
    }
    return '';
  }

  largestLender(): Person[] {
    const maxLoan = Math.max(...this.people.map((person) => person.loan));
    return this.people.filter(
      (person) => person.loan === maxLoan && maxLoan > 0
    );
  }

  largestBorrower(): Person[] {
    const maxDebt = Math.max(...this.people.map((person) => person.debt));
    return this.people.filter(
      (person) => person.debt === maxDebt && maxDebt > 0
    );
  }
}
