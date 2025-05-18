import {Component, OnDestroy, OnInit} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {Store} from '@ngrx/store';
import {selectLeltar} from '../../store/leltar/leltar.selector';
import {LeltarActions} from '../../store/leltar/leltar.actions';
import {Leltar} from '../../interfaces/leltar';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-nap-vegi-leltar',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './nap-vegi-leltar.component.html',
  styleUrl: './nap-vegi-leltar.component.css'
})
export class NapVegiLeltarComponent implements OnInit, OnDestroy {
  totalRevenue: number = 0;
  totalItemsSold: number = 0;
  topSellingProducts: { name: string, quantity: number, totalPrice: number }[] = [];
  leftoverProducts: { name: string, quantity: number }[] = [];

  displayedColumnsTop = ['name', 'quantity', 'totalPrice'];
  displayedColumnsLeftover = ['name', 'quantity'];

  leltar$ = this.store.select(selectLeltar);

  constructor(
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    const { startOfDay, endOfDay } = this.getTodayBounds();
    this.store.dispatch(LeltarActions.leltarList({ startDate: startOfDay, endDate: endOfDay }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(LeltarActions.clearState());
  }

  getTotalRevenue(leltar: Leltar): number {
    const revenue = leltar.soldItems.map((item) => item.itemCount * item.soldItem.price).reduce((a, b) => a + b, 0);
    this.totalRevenue = revenue;
    return revenue;
  }

  getTotalItemsSold(leltar: Leltar): number {
    const totalItems = leltar.soldItems.map((item) => item.itemCount).reduce((a, b) => a + b, 0);
    this.totalItemsSold = totalItems;
    return totalItems;
  }

  private getTodayBounds(): { startOfDay: Date; endOfDay: Date } {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { startOfDay, endOfDay };
  }

}
