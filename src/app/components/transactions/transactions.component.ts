import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransactionService } from '../../transaction.service';
import { Person, Transaction, TransactionType } from '../../transaction';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, combineLatest, filter, map, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  readonly form = this.fb.nonNullable.group({
    type: this.fb.nonNullable.control<TransactionType | undefined>(undefined, {
      validators: Validators.required,
    }),
    from: this.fb.nonNullable.control<Person | undefined>(undefined, {
      validators: Validators.required,
    }),
    to: this.fb.nonNullable.control<Person | undefined>(undefined, {
      validators: Validators.required,
    }),
    amount: this.fb.nonNullable.control(0, {
      validators: [Validators.required, Validators.min(0.1)],
    }),
  });

  private readonly persons = signal(this.financeService.getPeople());

  readonly filteredPersonsFrom = combineLatest({
    type: this.form.controls.type.valueChanges.pipe(startWith(undefined)),
    persons: toObservable(this.persons),
  }).pipe(
    map(({ type, persons }) => {
      switch (type) {
        case TransactionType.Borrow:
          return persons;
        case TransactionType.Lend:
          return persons;
        case TransactionType.Repay:
          return persons.filter((v) =>
            v.transactions.some((t) => t.type === TransactionType.Borrow)
          );
        default:
          return persons;
      }
    })
  );

  readonly filteredPersonsTo = combineLatest({
    type: this.form.controls.type.valueChanges.pipe(startWith(undefined)),
    from: this.form.controls.from.valueChanges.pipe(startWith(undefined)),
    persons: toObservable(this.persons),
  }).pipe(
    map(({ type, from, persons }) => {
      switch (type) {
        case TransactionType.Borrow:
          return persons.filter((v) => v.id !== from?.id);
        case TransactionType.Lend:
          return persons.filter((v) => v.id !== from?.id);
        case TransactionType.Repay:
          const borrowers = from?.transactions
            .filter((v) => v.type === TransactionType.Borrow)
            .map((v) => v.lenderId);
          return persons.filter((v) => borrowers?.includes(v.id));
        default:
          return persons;
      }
    })
  );

  readonly transactionTypes: TransactionType[] = [
    TransactionType.Borrow,
    TransactionType.Lend,
    TransactionType.Repay,
  ];

  readonly subscription = new Subscription();

  constructor(
    private financeService: TransactionService,
    public fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Set amount for repay transaction to choosen person
    this.subscription.add(
      combineLatest({
        type: this.form.controls.type.valueChanges.pipe(startWith(undefined)),
        from: this.form.controls.from.valueChanges.pipe(startWith(undefined)),
        to: this.form.controls.to.valueChanges.pipe(startWith(undefined)),
      })
        .pipe(
          filter(({ type }) => type === TransactionType.Repay),
          map((v) =>
            v.to?.transactions.filter(
              (t) =>
                t.type === TransactionType.Lend &&
                t.lenderId === v.to?.id &&
                t.borrowerId === v.from?.id
            )
          ),
          map((v) =>
            v?.map((transaction) => transaction.amount).reduce((a, b) => a + b)
          )
        )
        .subscribe((v) => this.form.controls.amount.setValue(v ?? 0))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  makeTransaction(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const { type, from, to, amount } = this.form.getRawValue();

    if (type && from && to && amount) {
      const transaction: Transaction = {
        id: Math.random().toString(),
        lenderId: from?.id,
        borrowerId: to.id,
        amount,
        type,
      };

      // push transaction to persons array and update debt and loan
      this.persons.update((v) => {
        switch (type) {
          case TransactionType.Borrow:
            v.forEach((person) => {
              if (person.id === to.id) {
                person.debt += amount;
                person.transactions.push(transaction);
              } else if (person.id === from.id) {
                person.loan += amount;
                person.transactions.push({
                  ...transaction,
                  type: TransactionType.Lend,
                });
              }
            });
            break;
          case TransactionType.Lend:
            v.forEach((person) => {
              if (person.id === to.id) {
                person.debt += amount;
                person.transactions.push({
                  ...transaction,
                  type: TransactionType.Borrow,
                });
              } else if (person.id === from.id) {
                person.loan += amount;
                person.transactions.push(transaction);
              }
            });
            break;
          case TransactionType.Repay:
            v.forEach((person) => {
              if (person.id === from.id) {
                person.debt -= amount;

                const transaction = person.transactions.find(
                  (t) => t.borrowerId === from.id && t.lenderId === to.id
                );

                // remove transaction only if amount is equal to transaction amount
                transaction && transaction?.amount !== amount
                  ? (transaction.amount -= amount)
                  : (person.transactions = person.transactions.filter(
                      (t) => t.id !== transaction?.id
                    ));
              } else if (person.id === to.id) {
                person.loan -= amount;

                const transaction = person.transactions.find(
                  (t) => t.borrowerId === from.id && t.lenderId === to.id
                );

                // remove transaction only if amount is equal to transaction amount
                transaction && transaction?.amount !== amount
                  ? (transaction.amount -= amount)
                  : (person.transactions = person.transactions.filter(
                      (t) => t.id !== transaction?.id
                    ));
              }
            });
            break;
        }
        return v;
      });

      this.financeService.updateSessionStorage();
      this.form.reset();
    }
  }
}
