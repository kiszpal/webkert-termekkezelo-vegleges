import {TransactionActions} from '../../store/transactions/transactions.actions';
import {TransactionSaveRequest} from '../../interfaces/requests/transaction.request';
import {ProductDto} from '../../interfaces/product.dto';
import {CartItem} from '../../interfaces/cart-item';
import {Product} from '../../interfaces/product';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {ProductActions} from '../../store/product/product.actions';
import { Store } from '@ngrx/store';
import {User} from '../../interfaces/user';
import {selectProducts} from '../../store/product/product.selector';
import {ProductCardComponent} from '../product-card/product-card.component';
import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {NgForOf} from '@angular/common';
import {PricePipe} from '../../pipes/price.pipe';
import {MatCard} from '@angular/material/card';
import {LeltarActions} from '../../store/leltar/leltar.actions';
import {CurrencyPosition} from '../../enums/currency-position.enum';
import {SelectionDeleteModePipe} from '../../pipes/selection-delete-mode.pipe';

@UntilDestroy()
@Component({
  selector: 'app-home',
  imports: [
    MatMiniFabButton,
    NgForOf,
    MatButton,
    PricePipe,
    ProductCardComponent,
    MatCard,
    SelectionDeleteModePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChildren(ProductCardComponent) productCards!: QueryList<ProductCardComponent>;

  products$ = this.store.select(selectProducts);
  products: Product[] = [];
  user: User = JSON.parse(localStorage.getItem('user') ?? '');
  cart: CartItem[] = [];
  selectionMode = false;

  constructor(
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.store.dispatch(ProductActions.productList({ userEmail: this.user.email }));
    this.products$
      .pipe(untilDestroyed(this))
      .subscribe((value: Product[]) => {
        this.products = value;
      });
  }

  ngOnDestroy() {
    this.store.dispatch(ProductActions.clearState());
  }

  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.products.forEach(product => product.isClicked = false);
    }
  }

  get totalPrice(): number {
    return this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  addToCart(product: Product) {
    this.cart.push({ id: product.id, name: product.name, quantity: 1, totalPrice: product.price });
  }

  updateQuantity(item: CartItem, change: number) {
    item.quantity += change;
    if (item.quantity < 1) {
      this.cart = this.cart.filter(p => p.id !== item.id);
      this.resetProductSelection(item.id);
    } else {
      item.totalPrice = item.quantity * this.products.find(p => p.id === item.id)!.price;
    }
  }

  resetProductSelection(productId: string) {
    this.productCards.forEach(card => {
      if (card.product?.id === productId) {
        card.isClicked = false;
      }
    });
  }

  async pay() {
    this.cart.forEach((cartItem) => {
      const request: TransactionSaveRequest = {
        soldItem: this.products.find((v) => v.id == cartItem.id) as unknown as ProductDto,
        itemCount: cartItem.quantity,
        userEmail: this.user.email
      };
      this.store.dispatch(TransactionActions.transactionSave({ req: request }));
    });
    this.cart = [];
    this.products.forEach(product => this.resetProductSelection(product.id));
    return Promise.resolve();
  }

  payAndCloseDay(): void {
    const { startOfDay, endOfDay } = this.getTodayBounds();
    this.store.dispatch(LeltarActions.leltarCreate({ startDate: startOfDay, endDate: endOfDay }));
  }

  deleteSingleProduct(product: Product): void {
    this.store.dispatch(ProductActions.productDelete({ id: product.id }));
    this.store.dispatch(ProductActions.productList({ userEmail: this.user.email }));
  }

  private getTodayBounds(): { startOfDay: Date; endOfDay: Date } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { startOfDay, endOfDay };
  }

  protected readonly CurrencyPosition = CurrencyPosition;
}
