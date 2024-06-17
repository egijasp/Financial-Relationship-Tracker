import { TransactionType } from '../enum/transaction-type';

export interface Transaction {
  id: string;
  lenderId: string;
  borrowerId: string;
  amount: number;
  transactionDate?: Date;
  type: TransactionType;
}
