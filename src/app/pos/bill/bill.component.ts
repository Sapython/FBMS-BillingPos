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
import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { Dialog } from '@angular/cdk/dialog';
import Fuse from 'fuse.js';
import { DatabaseService } from 'src/app/services/database.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';
import { AllKotsComponent } from 'src/app/all-kots/all-kots.component';
import { DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { CancelModalComponent } from 'src/app/cancel-modal/cancel-modal.component';
import { Subject, Subscription } from 'rxjs';
import { CustomerInfoModalComponent } from 'src/app/customer-info-modal/customer-info-modal.component';

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
export class BillComponent implements OnInit {
  currentBill: Bill | undefined;
  currentKot: Kot | undefined;
  discounts: any[] = [];
  offlineKot: any[] = [];
  offlineKotSubject: Subject<any> = new Subject();
  offlineBillSubject: Subject<any> = new Subject();
  searchedProducts: any[] = [];
  allKotProducts: any[] = [];
  specialInstructions: string = '';
  isNonChargeable: boolean = false;
  selectDiscounts: any[] = [];
  discountValues: any[] = [];
  taxableValue: number = 0;
  cgst: number = 0;
  sgst: number = 0;
  totalTaxAmount: number = 0;
  deskKot: boolean = false;
  customerInfoForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    phone: new FormControl('', [Validators.pattern('[0-9]{10}')]),
  });
  today: Date = new Date();
  currentTable: Table | undefined;
  totalQuantity: number = 0;
  grandTotal = 0;
  paymentMethod: string = 'cash';

  constructor(
    public dataProvider: DataProviderService,
    private databaseService: DatabaseService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog,
    private changeDetection: ChangeDetectorRef
  ) {
    this.databaseService.getDiscounts().subscribe((discounts) => {
      this.discounts = discounts;
    });
  }

  ngOnInit(): void {
    this.dataProvider.tableChanged.subscribe(async (table) => {
      this.resetValues();
      this.currentTable = table;
      if (this.currentTable && this.currentTable.bill) {
        // alert('Bill exists on current table');
        if (!this.currentBill) {
          console.log(this.dataProvider.allBills);
          const bill = this.dataProvider.allBills.find(
            (bill) => bill.id == this.currentTable!.bill
          );
          console.log('console.log', bill, this.dataProvider.allBills);
          if (bill && false) {
            // alert('Offline Bill found');
            this.currentBill = bill;
            this.dataProvider.allBills.push(this.currentBill);
            this.setupKot();
          } else {
            // this.dataProvider.pageSetting.blur = true;
            const bill = await this.databaseService.getBill(
              this.currentTable!.bill
            );
            // alert('Online Bill found');
            this.currentBill = bill.data() as Bill;
            this.dataProvider.allBills.push(this.currentBill);
            this.setupKot();
            // this.dataProvider.pageSetting.blur = false;
          }
        }
        // alert('Updating bill');
        this.updateBill();
      } else {
        // alert('No Bill exists on current table. Creating one');
        this.createBill();
      }
    });
    this.dataProvider.selectedProduct.subscribe(async (product) => {
      if(!this.currentBill){
        this.createBill();
      }
      if (!this.currentTable) {
        this.alertify.presentToast('Please select a table', 'error');
        this.dataProvider.openTableFunction();
        return;
      }
      // quantity handler
      const onlineKot = this.currentBill!.kots.filter((kot) => !kot.finalized);
      console.log('onlineKot', onlineKot);
      if (onlineKot && onlineKot.length > 0) {
        this.currentKot = onlineKot[0];
        let productIndex = this.currentKot!.products.findIndex(
          (p) => p.id == product.id
        );
        if (productIndex != -1) {
          this.currentKot!.products[productIndex].quantity += 1;
        } else {
          this.currentKot!.products.push({
            ...product,
            quantity: 1,
          });
        }
        // update in offline bill
        // TODO: update in online bill
        // this.dataProvider.allBills.forEach((bill) => {
        //   if (bill.id == this.currentBill!.id) {
        //     bill.kots.forEach((kot: any) => {
        //       if (kot.id == this.currentKot!.id) {
        //         if (kot.products[productIndex]) {
        //         }
        //       }
        //     });
        //   }
        // });
        this.updateBill();
      } else {
        this.currentKot = {
          id: this.generateRandomId(),
          products: [product],
          date: new Date(),
          finalized: false,
        };
        this.currentBill!.kots.push(
          JSON.parse(JSON.stringify(this.currentKot))
        );
        // this.offlineKot.push(this.currentKot);
      }
      // // KOt checker

      if (this.currentTable.bill) {
        if (!this.currentBill) {
          const bill = this.dataProvider.allBills.find(
            (bill) => bill.id == this.currentTable!.bill
          );
          if (bill) {
            this.currentBill = bill;
            this.dataProvider.allBills.push(this.currentBill);
            this.setupKot();
          } else {
            this.dataProvider.pageSetting.blur = true;
            const bill = await this.databaseService.getBill(
              this.currentTable!.bill
            );
            this.currentBill = bill.data() as Bill;
            this.dataProvider.allBills.push(this.currentBill);
            this.setupKot();
            this.dataProvider.pageSetting.blur = false;
          }
        }
        // this.updateBill();
      } else {
        this.createBill();
      }
    });
  }

  setupKot() {
    const onlineKot = this.currentBill!.kots.filter((kot) => !kot.finalized);
    if (onlineKot && onlineKot.length > 0) {
      this.currentKot = onlineKot[0];
    } else {
      this.currentKot = {
        id: this.generateRandomId(),
        products: [],
        date: new Date(),
        finalized: false,
      };
      this.currentBill!.kots.push(JSON.parse(JSON.stringify(this.currentKot)));
      // this.offlineKot.push(this.currentKot);
    }
    // this.offlineKot = this.currentBill!.kots;
    // if (this.currentBill && this.currentBill.kots.length > 0) {
    //   this.currentBill.kots[this.currentBill.kots.length - 1].products.forEach(
    //     (onlineProduct: any) => {
    //       let counter = 0;
    //       this.currentKot!.products.find((product) => {
    //         if (product.id == onlineProduct.id) {
    //           product.quantity += onlineProduct.quantity;
    //         } else {
    //           counter++;
    //         }
    //       });
    //       if (counter == this.currentKot!.products.length) {
    //         this.currentKot!.products.push(onlineProduct);
    //       }
    //     }
    //   );
    //   this.updateBill();
    // }
  }

  generateRandomId() {
    return Math.floor(Math.random() * 100000000000000000).toString();
  }

  calculateTaxAndPrices() {
    this.taxableValue = 0;
    this.totalQuantity = 0;
    this.totalTaxAmount = 0;
    // alert('calculateTaxAndPrices'+this.currentBill?.kots.length);
    this.currentBill?.kots.forEach((kot) => {
      // alert("kot.products "+kot.products)
        kot.products.forEach((product: any) => {
          // alert('calculateTaxAndPrices'+product.shopPrice);
          this.taxableValue += product.shopPrice * product.quantity;
          this.totalQuantity += product.quantity;
        });
    });
    // alert('taxableValue' + this.taxableValue);
    this.selectDiscounts.forEach((discount) => {
      if (discount.discountType == 'flat') {
        const val = discount.discountValue;
        this.discountValues.push(val);
        this.taxableValue -= val;
      } else if (discount.discountType == 'percentage') {
        const val = (this.taxableValue / 100) * discount.discountValue;
        this.discountValues.push(val);
        this.taxableValue -= val;
      }
    });
    this.sgst = (this.taxableValue / 100) * 2.5;
    this.cgst = (this.taxableValue / 100) * 2.5;
    this.totalTaxAmount = this.sgst + this.cgst;
    this.taxableValue = Math.ceil(this.taxableValue);
    // console.log('taxable value', this.taxableValue);
    // console.log('total tax amount', this.totalTaxAmount);
    // console.log('total quantity', this.totalQuantity);
    this.grandTotal = Math.ceil(this.taxableValue + this.totalTaxAmount);
    if (this.isNonChargeable) {
      this.grandTotal = 0;
      this.taxableValue = 0;
      this.changeDetection.detectChanges();
    }
  }

  toFixedValue(value: number) {
    return value.toFixed(2);
  }

  delete(id: string, item: any) {
    const index = this.currentKot!.products.findIndex((p) => p.id == id);
    if (index != -1) {
      this.currentKot!.products.splice(index, 1);
    }
    this.updateBill();
  }

  updateQuantity(ref: any) {
    console.log(ref, this.currentKot);
    this.calculateTaxAndPrices();
  }

  updateBill(finalizedKot: boolean = false) {
    if (finalizedKot) {
      this.dataProvider.pageSetting.blur = true;
    }
    // alert('Upadting
    if (this.currentBill) {
      console.log('KOT PRODUCTS', this.currentKot!.products);
      this.currentBill.kots[this.currentBill.kots.length - 1].products =
        JSON.parse(JSON.stringify(this.currentKot!.products));
      // alert('Updating bill');
      this.updateBillData(this.currentBill, this.currentBill.id).finally(() => {
        if (finalizedKot) {
          this.dataProvider.pageSetting.blur = false;
          this.currentKot!.products = [];
          console.log('Damn', this.currentKot, this.currentBill);
        }
        this.calculateTaxAndPrices();
      });
    } else {
      this.alertify.presentToast('No bill to update', 'error');
    }
  }

  createBill() {
    this.currentBill = {
      date: new Date(),
      customerInfo: this.customerInfoForm.value,
      completed: false,
      deviceId: this.dataProvider.deviceData.deviceId,
      dineMethod: 'dineIn',
      kots: this.offlineKot,
      paymentType: 'cash',
      project: this.dataProvider.currentProject,
      table: this.currentTable!,
      tableId: this.currentTable!.id,
      user: this.dataProvider.userData?.userId || '',
      grandTotal: this.grandTotal,
      id: this.generateRandomId(),
      isNonChargeable: false,
      selectedDiscounts: this.discounts,
      specialInstructions: '',
      tokenNo: this.dataProvider.currentTokenNo + 1,
    };
    this.currentTable!.bill = this.currentBill.id;
    console.log(this.currentBill);
    // check in allBills if the bill doesn't exist add it
    this.dataProvider.allBills.find((bill) => bill.id === this.currentBill!.id)
      ? null
      : this.dataProvider.allBills.push(this.currentBill);
    this.databaseService.createBill(this.currentBill, this.currentBill.id);
  }

  async updateBillData(data: Bill, id: string) {
    console.log('all bills', this.dataProvider.allBills);
    console.log('current bill', data);
    try {
      const doc = await this.databaseService.updateBill(data, id);
      console.log('updated', doc);
      this.alertify.presentToast('Bill updated', 'info');
    } catch (err) {
      console.log(err);
      this.alertify.presentToast('Error updating bill', 'error');
    }
  }

  openDiscountsPanel() {}

  finalizeKot() {
    document.getElementById('bill')!.style.display = 'none';
    document.getElementById('billKot')!.style.display = 'block';
    this.deskKot = false;
    this.changeDetection.detectChanges();
    console.log('finalizing kot', this.currentKot!.products);
    window.print();
    this.deskKot = true;
    this.changeDetection.detectChanges();
    console.log('finalizing kot', this.currentKot!.products);
    window.print();
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('bill')!.style.display = 'none';
    this.currentBill!.kots[this.currentBill!.kots.length - 1]['finalized'] =
      true;
    this.updateBill(true);
    this.changeDetection.detectChanges();
  }

  finalizeBill() {
    console.log('CURRENT BILL BEFORE FINAL', this.currentBill);
    this.allKotProducts = [];
    this.databaseService.getBill(this.currentBill!.id).then((bill) => {
      var billData:any = bill.data()
      if (billData){
        this.currentBill = billData;
        this.calculateTaxAndPrices();
      } else {
        this.alertify.presentToast('Bill not found', 'error');
        return 
      };
      billData?.['kots'].forEach((kot:any) => {
        if (!kot.finalized && kot.products.length > 0) {
          if (
            confirm(
              'Products in current kot are not finalized yet. Should we finalize them?'
            )
          ) {
            this.finalizeKot();
            kot.finalized = true;
          } else {
            return;
          }
        }
        kot.products.forEach((product: any) => {
          this.allKotProducts.push(product);
        });
      });
      alert('ALlKOtPRoducstLength '+this.allKotProducts.length)
      this.changeDetection.detectChanges();
      document.getElementById('bill')!.style.display = 'block';
      document.getElementById('billKot')!.style.display = 'none';
      window.print();
      window.print();
      document.getElementById('bill')!.style.display = 'none';
      this.currentBill!.completed = true;
      this.updateBill();
      this.databaseService.emptyTable(this.currentTable!.id);
      this.dataProvider.openTableFunction();
      this.resetValues()
    });
  }

  cancel() {
    const inst = this.dialog.open(CancelModalComponent, {
      data: {},
    });
    inst.componentInstance?.completed.subscribe((data) => {
      console.log(data);
      if (data && data.phone && data.reason) {
        this.resetValues();
        this.dataProvider.pageSetting.blur = true;
        this.databaseService
          .deleteBill(this.currentBill!.id, data.reason, data.phone.toString())
          .then((data) => {
            this.alertify.presentToast('Bill cancelled.');
            inst.close();
          })
          .catch((error) => {
            console.error('error', error);
            this.alertify.presentToast('Error cannot cancel bill.', 'error');
          })
          .finally(() => {
            this.dataProvider.pageSetting.blur = false;
          });
      } else {
        inst.close();
      }
    });
  }

  resetValues() {
    this.currentBill = undefined;
    this.currentKot = undefined;
    this.searchedProducts = [];
    this.allKotProducts = [];
    this.specialInstructions = '';
    this.isNonChargeable = false;
    this.selectDiscounts = [];
    this.discountValues = [];
    this.taxableValue = 0;
    this.cgst = 0;
    this.sgst = 0;
    this.totalTaxAmount = 0;
    this.deskKot = false;
    this.totalQuantity = 0;
    this.grandTotal = 0;
    this.paymentMethod = 'cash';
    this.customerInfoForm.reset();
    this.customerInfoForm.markAsUntouched();
    this.customerInfoForm.markAsPristine();
    this.changeDetection.detectChanges();
  }

  openUserInfoModal() {
    const inst = this.dialog.open(CustomerInfoModalComponent);
    inst.componentInstance?.done.subscribe((data) => {
      if (data) {
        this.customerInfoForm.patchValue(data);
      }
    });
  }

  changeTable(event: any) {
    console.log(event);
    if (event.value) {
      this.databaseService.emptyTable(this.currentTable!.id);
      this.databaseService.useTable(event.value, this.currentBill!.id);
      this.dataProvider.selectedTable = event.value;
    }
  }
  seeAllKots() {
    // this.allKotProducts = [];
    // console.log('L', this.currentBill?.kots);
    // this.currentBill?.kots.forEach((kot) => {
    //   console.log('M', kot);
    //   if (kot.finalized) {
    //     kot.products.forEach((product: any) => {
    //       this.allKotProducts.push(product);
    //     });
    //   }
    // });
    this.dataProvider.pageSetting.blur = true;
    this.databaseService
      .getBill(this.currentBill!.id)
      .then((data) => {
        console.log('NC', this.currentBill);
        const inst = this.dialog.open(AllKotsComponent, {
          data: data.data(),
        });
        inst.componentInstance?.done.subscribe((data) => {
          if (data) {
            this.currentBill = data;
            this.updateBill();
          }
          inst.close();
        });
      })
      .finally(() => {
        this.dataProvider.pageSetting.blur = false;
      })
      .catch((error) => {
        console.error('error', error);
        this.alertify.presentToast('Error cannot fetch bill.', 'error');
      });
  }
}

type Bill = {
  id: string;
  completed: boolean;
  customerInfo: any;
  date: any;
  tokenNo: number;
  grandTotal: number;
  selectedDiscounts: any[];
  deviceId: string;
  dineMethod: 'dineIn' | 'pickUp';
  kots: any[];
  paymentType: 'cash' | 'card';
  project: any;
  table: Table;
  tableId: string;
  user: string;
  isNonChargeable: boolean;
  specialInstructions: string;
};

type Tax = {
  value: number;
  type: 'percentage' | 'flat';
  name: string;
  id?: string;
};

type Kot = {
  id: string;
  date: any;
  products: any[];
  finalized: boolean;
};

type Table = {
  id: string;
  bill: string;
  maxOccupancy: string;
  name: string;
  status: 'available' | 'occupied';
  tableNo: string;
};
