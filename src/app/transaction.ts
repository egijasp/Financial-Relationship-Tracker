export enum TransactionType {
  Borrow = 'borrow',
  Lend = 'lend',
  Repay = 'repay',
}

export interface Transaction {
  id: string;
  lenderId: string;
  borrowerId: string;
  amount: number;
  transactionDate?: Date;
  type: TransactionType;
}

export interface Person {
  id: string;
  name: string;
  debt: number;
  loan: number;
  transactions: Transaction[];
}
