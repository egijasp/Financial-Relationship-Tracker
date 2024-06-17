import { Transaction } from './transaction';

export interface Person {
  id: string;
  name: string;
  debt: number;
  loan: number;
  transactions: Transaction[];
}
