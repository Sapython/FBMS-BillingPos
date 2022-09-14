import { Component, Input, OnInit } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';
import Fuse from 'fuse.js';
import { isEmpty } from 'rxjs';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';
import { TablesComponent } from 'src/app/tables/tables.component';

import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  constructor(
    private databaseService: DatabaseService,
    private dataProvider: DataProviderService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog
  ) {}
  products: any[] = [];
  filteredProducts: any[] = [];
  searchedProducts: any[] = [];
  table: any;
  ngOnInit(): void {
    this.dataProvider.menuSelected.subscribe((data) => {
      this.table = data;
    })
    this.dataProvider.tableChanged.subscribe((table: string) => {
      this.table = table;
    });
    this.dataProvider.selectedCategory.subscribe((data: any) => {
      if (!this.table) {
        this.alertify.presentToast('Please select a table first', 'error');
        this.dataProvider.openTableFunction()
      }
      this.filterProducts(data.name);
    });
    this.dataProvider.searchEvent.subscribe((data: string) => {
      // console.log('searchEvent', data);
      const options = {
        keys: ['dishName', 'sellingPrice', 'onlinePrice'],
      };
      const fuse = new Fuse(this.dataProvider.products, options); // "list" is the item array
      const result = fuse.search(data);
      this.searchedProducts = [];
      // console.log('result', result);
      result.forEach((product: any) => {
        this.searchedProducts.push(product.item);
      });
    });
  }
  filterProducts(mainCategory: string) {
    this.filteredProducts = this.dataProvider.products.filter((item) => {
      return item && item.categories && item.categories.name == mainCategory;
    });
  }

  addToBill(product: any) {
    // // console.log(product);
    if (!product.quantity) {
      product.quantity = 1;
    }
    this.dataProvider.selectedProduct.next(product);
  }
}
