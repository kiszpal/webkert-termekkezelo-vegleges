import {inject, Injectable} from '@angular/core';
import {
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDocs,
  query,
  Query,
  setDoc,
  where
} from '@angular/fire/firestore';
import {Transaction} from '../interfaces/transaction';
import {ProductDto} from '../interfaces/product.dto';
import {User} from '../interfaces/user';
import {Leltar} from '../interfaces/leltar';
import { v4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class LeltarService {
  private firestore: Firestore = inject(Firestore);

  async createLeltar(startDate: Date, endDate: Date): Promise<void> {
    const soldProducts = await this.getTransactionsBetween(startDate, endDate);
    const products = await this.getProducts();
    const topSellingProducts: { soldItem: ProductDto; totalCount: number }[] = await this.getTopSoldItems();
    const user = JSON.parse(localStorage.getItem('user') ?? '') as User;

    const newLeltar: Leltar = {
      id: v4(),
      userEmail: user.email,
      soldItems: soldProducts,
      mostPopularItems: topSellingProducts,
      remainingItems: products,
      leltarDate: startDate
    };
    const collectionRef = collection(this.firestore, 'leltar');
    const docRef = doc(collectionRef);
    await setDoc(docRef, newLeltar);
  }

  async listLeltar(startDate: Date, endDate: Date): Promise<Leltar> {
    const user = JSON.parse(localStorage.getItem('user') ?? '') as User;
    const collectionRef = collection(this.firestore, 'leltar');
    const q = query(collectionRef,
      where('userEmail', '==', user.email),
      where('leltarDate', '>=', startDate),
      where('leltarDate', '<', endDate)
    );

    try {
      const result = await getDocs(q);
      return result.docs[0]?.data() as Leltar;
    } catch (e) {
      console.log(e);
    }
    return {} as Leltar;
  }

  private async getTransactionsBetween(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const collectionRef: CollectionReference = collection(this.firestore, 'transactions');
    const q: Query = query(
      collectionRef,
      where('transactionDate', '>=', startDate),
      where('transactionDate', '<=', endDate)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Transaction);
  }

  private async getProducts(): Promise<ProductDto[]> {
    const user = JSON.parse(localStorage.getItem('user') ?? '') as User;
    const collectionRef = collection(this.firestore, 'products');
    const q = query(collectionRef,
      where('userEmail', '==', user.email),
      where('quantity', '>', 0)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs.map((value) => value.data() as ProductDto);
      } else {
        return [];
      }
    } catch (e) {
      console.log(e);
    }
    return [] as ProductDto[];
  }

  private async getTopSoldItems(limit = 3): Promise<{soldItem: ProductDto, totalCount: number }[]> {
    const collectionRef = collection(this.firestore, 'transactions');
    const snapshot = await getDocs(collectionRef);

    const aggregated: Record<string, { soldItem: any, totalCount: number }> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const id = data['soldItem'].id;

      if (!aggregated[id]) {
        aggregated[id] = {
          soldItem: data['soldItem'],
          totalCount: 0
        };
      }

      aggregated[id].totalCount += data['itemCount'];
    });

    return Object.values(aggregated)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);
  }
}
