import {ProductDto} from './product.dto';
import {Transaction} from './transaction';

export interface Leltar {
  id: string;
  userEmail: string;
  soldItems: Transaction[];
  remainingItems: ProductDto[];
  mostPopularItems: { soldItem: ProductDto; totalCount: number }[]
  leltarDate: Date;
}
