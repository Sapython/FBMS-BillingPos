import {
  animate,
  keyframes,
  query,
  stagger,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';

import Fuse from 'fuse.js';
import { DatabaseService } from 'src/app/services/database.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';

const numWords = require('num-words');

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
  animations: [
    trigger('billSlider', [
      state(
        'open',
        style({
          height: 'calc(60vh - 30px)',
          top: '40vh',
          position: 'absolute',
          boxShadow: '0px -5px 40px rgba(0,0,0,0.3)',
        })
      ),
      state(
        'closed',
        style({
          height: 'calc(40vh - 20px)',
          top: '53vh',
          position: 'absolute',
        })
      ),
      transition('* => closed', [animate('0.3s ease-in')]),
      transition('* => open', [animate('0.3s ease-in')]),
    ]),
    trigger('billItems', [
      state(
        'open',
        style({
          height: '{{productsViewHeight}}px',
        }),
        { params: { productsViewHeight: (window.innerHeight / 100) * 40 - 66 } }
      ),
      state(
        'closed',
        style({
          height: '{{productsViewHeight}}px',
        }),
        { params: { productsViewHeight: (window.innerHeight / 100) * 60 - 66 } }
      ),
      transition('* => closed', [animate('0.3s ease-in')]),
      transition('* => open', [animate('0.3s ease-in')]),
    ]),
    trigger('dishCardState', [
      state(
        'default',
        style({
          opacity: 1,
          scale: 1,
        })
      ),
      state(
        'deleted',
        style({
          opacity: 0,
          scale: 0,
        })
      ),
      transition('default => deleted', animate('0.3s')),
      transition('deleted => default', animate('0.3s')),
    ]),
    trigger('dishCardStagger', [
      state('in', style({})),
      state('out', style({})),
      transition('* <=> *', [
        query(':enter', style({ opacity: 0 }), { optional: true }),
        query(
          ':enter',
          stagger(
            '50ms',
            animate(
              '0.3s ease-in',
              keyframes([
                style({
                  opacity: 0,
                  scale: 0,
                }),
                style({
                  opacity: 1,
                  scale: 1,
                }),
              ])
            )
          ),
          { optional: true }
        ),
        query(
          '.deleted',
          stagger('300ms', [
            animate(
              '0.3s ease-out',
              keyframes([
                style({ opacity: 1, transform: 'scale(1.1)', offset: 0 }),
                style({ opacity: 0.5, transform: 'scale(.5)', offset: 0.3 }),
                style({ opacity: 0, transform: 'scale(0)', offset: 1 }),
              ])
            ),
          ]),
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class BillComponent implements OnInit, OnChanges {
  expandedBillView: 'closed' | 'open' = 'closed';
  productsViewHeight: number = 0;
  constructor(
    public dataProvider: DataProviderService,
    private databaseService: DatabaseService,
    private alertify: AlertsAndNotificationsService
  ) {}
  products: any[] = [];
  totalAmount: number = 0.0;
  discountType: 'percentage' | 'flat' = 'percentage';
  discount: number = 0.0;
  taxableValue: number = 0.0;
  totalTaxAmount: number = 0.0;
  total: number = 0.0;
  additionalCharges: number = 0.0;
  tip: number = 0.0;
  grandTotal: number = 0.0;
  sgst: number = 0.0;
  cgst: number = 0.0;
  filteredTaxes: any[] = [];
  filteredCharges: any[] = [];
  grandTotalWithTaxes: number = 0.0;
  finalAmountInWords: string = '';
  searchedProducts: any[] = [];
  today: Date = new Date();
  taxes: any[] = [];
  kotVisible: boolean = false;
  table: any;
  billSaved: boolean = false;
  customerInfoForm: FormGroup = new FormGroup({
    fullName: new FormControl(''),
    phoneNumber: new FormControl(''),
    email: new FormControl(''),
    age: new FormControl(''),
    gender: new FormControl(''),
  });
  currentBill:any = false;
  ngOnInit(): void {
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('bill')!.style.display = 'none';
    this.dataProvider.tableChanged.subscribe((table) => {
      this.table = table;
      this.calculateTaxAndPrices();
    });
    this.dataProvider.selectedProduct.subscribe((data) => {
      if (!this.currentBill){
        this.createBill();
      } else {
        this.updateBill();
      }
      this.filterProducts(data);
      this.calculateTaxAndPrices();
      console.log('products.length', this.products.length);
    });
    this.dataProvider.searchEvent.subscribe((data: string) => {
      console.log('searchEvent', data);
      const options = {
        keys: ['name', 'bestSeasonFrom', 'bestSeasonTo', 'description'],
      };
      const fuse = new Fuse(this.products, options); // "list" is the item array
      const result = fuse.search(data);
      this.searchedProducts = [];
      console.log('result', result);
      result.forEach((product: any) => {
        this.searchedProducts.push(product.item);
      });
    });
    this.databaseService.getTaxes().then((data: any) => {
      data.forEach((element: any) => {
        console.log('tax element', element.data());
        this.taxes.push(element.data());
      });
    });
  }

  createBill(){
    alert('Creating new bill')
    this.databaseService.createBill({
      table: this.table,
      products: this.products,
      customerInfoForm:this.customerInfoForm.value,
      completed: false,
      date: new Date(),
      user: this.dataProvider.userID,
      project: this.dataProvider.currentProject,
      deviceId: this.dataProvider.deviceData.deviceId,
    }).then((data)=>{
      this.currentBill = data;
      console.log('currentBill',this.currentBill.id);
    }).catch((error)=>{
      console.error('error', error);
    }).finally(()=>{
      alert('Bill created')
    });
  }

  updateBill(){
    this.databaseService.updateBill({
      table: this.table,
      products: this.products,
      customerInfoForm:this.customerInfoForm.value
    },this.currentBill.id).then((data)=>{
      console.log('currentBill',this.currentBill.id);
    }).catch((error)=>{
      console.error('error', error);
    }).finally(()=>{
      alert('Bill updated')
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTaxAndPrices();
    if (this.expandedBillView == 'open') {
      this.productsViewHeight = (window.innerHeight / 100) * 40 - 66;
    } else {
      this.productsViewHeight = (window.innerHeight / 100) * 60 - 66;
    }
  }

  deductStockItems(){
    this.products.forEach((product)=>{
      // this.databaseService.deductStockItem(product);
      let deductibleItems = product.ingredients.map((ingredient:any)=>{
        return this.databaseService.deductStockItem(ingredient.id,ingredient.amount * product.quantity);
        // return ingredient.amount * product.quantity
      })
      Promise.all(deductibleItems).then((data)=>{
        this.alertify.presentToast('Bill finalized.');
      }).catch((error)=>{
        console.error('error', error);
        this.alertify.presentToast('Error cannot finalize bill.','error');
      })
      console.log('deductibleItems',deductibleItems);
    });
  }

  filterProducts(product: any) {
    let index = this.products.findIndex((item) => {
      return item.id == product.id;
    });

    if (index == -1) {
      console.log('New Item');
      this.products.push(product);
    } else {
      console.log('Old Item');
      if (this.products[index].quantity) {
        this.products[index].quantity++;
      } else {
        this.products[index].quantity = 1;
      }
    }
    console.log('data', this.products);
  }

  calculateTaxAndPrices() {
    this.totalAmount = 0;
    this.taxableValue = 0;
    this.totalTaxAmount = 0;
    this.products.forEach((product) => {
      this.taxableValue += Number(product.shopPrice) * Number(product.quantity);
    });
    // alert(this.taxableValue)
    this.filteredCharges = [];
    this.filteredTaxes = [];
    this.taxes.forEach((tax) => {
      if (tax.priceType == 'flat') {
        this.filteredCharges.push({
          name: tax.name,
          amount: Number(tax.amount),
        });
      } else if (tax.priceType == 'percentage') {
        this.filteredTaxes.push({ name: tax.name, amount: Number(tax.amount) });
      }
    });

    this.filteredTaxes.forEach((tax) => {
      this.totalTaxAmount += (this.taxableValue / 100) * tax.amount;
    });
    this.filteredCharges.forEach((charge) => {
      this.totalTaxAmount += charge.amount;
    });
    this.grandTotal = this.taxableValue + this.totalTaxAmount;
  }
  
  print() {
    window.print();
  }

  delete(id: string, event: any) {
    console.log((event.deleting = true));
    setTimeout(() => {
      this.products = this.products.filter((dish) => dish.id !== id);
    }, 500);
  }

  // convert finalAmount to words
  convertToWords(amount: number) {
    return numWords(amount);
  }

  printKotAndBill() {
    document.getElementById('bill')!.style.display = 'block';
    document.getElementById('billKot')!.style.display = 'none';
    window.print();
    document.getElementById('bill')!.style.display = 'none';
    document.getElementById('billKot')!.style.display = 'block';
    window.print();
  }

  printKot() {
    document.getElementById('bill')!.style.display = 'none';
    document.getElementById('billKot')!.style.display = 'block';
    window.print();
  }

  printBill() {
    document.getElementById('bill')!.style.display = 'block';
    document.getElementById('billKot')!.style.display = 'none';
    window.print();
  }

  cancel() {
    const reason = prompt('Give us a reason to continue to delete this bill');
    if (reason) {
      
      this.products = [];
    }
  }
}

type Tax = {
  value: number;
  type: 'percentage' | 'flat';
  name: string;
  id?: string;
};
