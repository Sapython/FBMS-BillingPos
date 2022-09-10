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
import { Dialog } from '@angular/cdk/dialog';
import Fuse from 'fuse.js';
import { DatabaseService } from 'src/app/services/database.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';
import { AllKotsComponent } from 'src/app/all-kots/all-kots.component';
import { DocumentData, DocumentSnapshot } from '@angular/fire/firestore';

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
  billCreated: boolean = false;
  constructor(
    public dataProvider: DataProviderService,
    private databaseService: DatabaseService,
    private alertify: AlertsAndNotificationsService,
    private dialog: Dialog
  ) {}
  products: any[] = [];
  totalAmount: number = 0.0;
  discountType: 'percentage' | 'flat' = 'percentage';
  discount: number = 0.0;
  taxableValue: number = 0.0;
  totalTaxAmount: number = 0.0;
  totalQuantity: number = 0.0;
  total: number = 0.0;
  additionalCharges: number = 0.0;
  tip: number = 0.0;
  grandTotal: number = 0.0;
  sgst: string = '0';
  cgst: string = '0';
  filteredTaxes: any[] = [];
  filteredCharges: any[] = [];
  grandTotalWithTaxes: number = 0.0;
  finalAmountInWords: string = '';
  searchedProducts: any[] = [];
  today: Date = new Date();
  taxes: any[] = [];
  kotVisible: boolean = false;
  table: any;
  tokenNo: number = 0;
  billSaved: boolean = false;
  dineMethod: 'dineIn' | 'delivery' | 'pickUp' = 'dineIn';
  paymentType: 'cash' | 'card' | 'wallet' | 'due' | 'other' | 'part' = 'cash';
  currentKot: any = {};
  customerInfoForm: FormGroup = new FormGroup({
    fullName: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    email: new FormControl('', [Validators.email]),
    age: new FormControl(''),
    gender: new FormControl(''),
  });
  currentBill: any = false;
  allKots: any[] = [];
  allBillProducts: any[] = [];
  ekdumConfirmProducts: any[] = [];
  ngOnInit(): void {
    this.dataProvider.menuSelected.subscribe((table) => {
      console.log('found table 1');
      if (table) {
        console.log('found table 2');
        if (this.currentBill && this.products.length > 0) {
          if (
            confirm('Bill already exists. Should we save it and continue ?')
          ) {
            this.finalizeKot();
            this.updateBill();
            this.dataProvider.pageSetting.blur = true;
            this.databaseService.getBill(table.bill).then((bill: any) => {
              this.currentBill = { ...bill.data(), id: bill.id };
              this.table = table;
              this.currentKot = bill.data().kots[bill.data().kots.length - 1];
              console.log(
                'KOT verificaiton',
                this.currentKot.id,
                this.currentBill.id
              );
              this.databaseService
                .getKot(this.currentKot.id, this.currentBill.id)
                .then((kot: any) => {
                  console.log('kot.data().products', kot.data().products);
                  this.products = kot.data().products;
                  this.calculateTaxAndPrices();
                })
                .finally(() => {
                  console.log('Mil gaya');
                });
              this.dataProvider.pageSetting.blur = false;
            });
          }
        } else {
          // alert(table.bill);
          this.dataProvider.pageSetting.blur = true;
          console.log('Table Bill', table.bill);
          if (table.bill) {
            this.databaseService.getBill(table.bill).then((bill: any) => {
              console.log('Yeraha bill', bill, bill.data());
              this.currentBill = { ...bill.data(), id: bill.id };
              this.table = table;
              this.allKots = bill.data().kots;
              this.currentKot = bill.data().kots[bill.data().kots.length - 1];
              console.log(
                'KOT verificaiton',
                this.currentKot.id,
                this.currentBill.id
              );
              this.databaseService
                .getKot(this.currentKot.id, this.currentBill.id)
                .then((kot: any) => {
                  console.log('products', kot.data().products);
                  this.products = kot.data().products;
                  this.calculateTaxAndPrices();
                })
                .catch((error: any) => {
                  console.log(error);
                })
                .finally(() => {
                  console.log('Mil gaya');
                });
              this.dataProvider.pageSetting.blur = false;
            });
          } else {
            this.dataProvider.pageSetting.blur = false;
          }
        }
      }
    });
    this.databaseService.getCounters().subscribe((counters: any) => {
      this.tokenNo = counters.bills + 1;
    });
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('bill')!.style.display = 'none';
    this.dataProvider.tableChanged.subscribe((table) => {
      this.table = table;
      if (table) {
        console.log('found table 2');
        if (this.currentBill && this.products.length > 0) {
          if (
            confirm('Bill already exists. Should we save it and continue ?')
          ) {
            this.finalizeKot();
            this.updateBill();
            this.dataProvider.pageSetting.blur = true;
            console.log('Table Bill', table.bill);
            this.databaseService.getBill(table.bill).then((bill: any) => {
              this.currentBill = { ...bill.data(), id: bill.id };
              this.table = table;
              this.currentKot = bill.data().kots[bill.data().kots.length - 1];
              console.log(
                'KOT verificaiton',
                this.currentKot.id,
                this.currentBill.id
              );
              this.databaseService
                .getKot(this.currentKot.id, this.currentBill.id)
                .then((kot: any) => {
                  console.log('kot.data().products', kot.data().products);
                  this.products = kot.data().products;
                  this.calculateTaxAndPrices();
                })
                .finally(() => {
                  console.log('Mil gaya');
                });
              this.dataProvider.pageSetting.blur = false;
            });
          }
        } else {
          // alert(table.bill);
          this.dataProvider.pageSetting.blur = true;
          console.log('Table Bill', table.bill);
          this.table = table;
          this.products = [];
          this.allKots = [];
          if (table.bill) {
            this.databaseService.getBill(table.bill).then((bill: any) => {
              console.log('Yeraha bill', bill, bill.data());
              this.currentBill = { ...bill.data(), id: bill.id };
              this.table = table;
              this.allKots = bill.data().kots;
              this.currentKot = bill.data().kots[bill.data().kots.length - 1];
              console.log(
                'KOT verificaiton',
                this.currentKot.id,
                this.currentBill.id
              );
              this.databaseService
                .getKot(this.currentKot.id, this.currentBill.id)
                .then((kot: any) => {
                  console.log('products', kot.data().products);
                  this.products = kot.data().products;
                  this.calculateTaxAndPrices();
                })
                .catch((error: any) => {
                  console.log(error);
                })
                .finally(() => {
                  console.log('Mil gaya');
                });
              this.dataProvider.pageSetting.blur = false;
            });
          } else {
            this.currentBill = null;
            this.dataProvider.pageSetting.blur = false;
          }
        }
      }
      // this.calculateTaxAndPrices();
    });
    this.dataProvider.selectedProduct.subscribe((data) => {
      if (!this.currentBill) {
        this.createBill();
      } else {
        this.addToKot();
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
  toFixedValue(num: number) {
    return parseFloat(num.toFixed(2));
  }

  generateRandomId() {
    return Math.floor(Math.random() * 100000000000000000);
  }

  async createBill() {
    this.billCreated = true;
    // alert('Creating new bill')
    this.dataProvider.syncer.next(true);
    this.dataProvider.pageSetting.blur = true;
    const billId: string = this.generateRandomId().toString();
    this.currentKot = await this.databaseService.createKot(
      this.products,
      billId
    );
    this.allKots.push(this.currentKot);
    this.databaseService
      .createBill(
        {
          table: this.table,
          kots: this.allKots,
          customerInfoForm: this.customerInfoForm.value,
          completed: false,
          date: new Date(),
          user: this.dataProvider.userID,
          project: this.dataProvider.currentProject,
          deviceId: this.dataProvider.deviceData.deviceId,
          dineMethod: this.dineMethod,
          paymentType: this.paymentType,
          tableId: this.table.id,
        },
        billId
      )
      .then((data: any) => {
        // alert('Bill created '+data.id)
        this.currentBill = { id: billId };
        console.log('currentBill', this.currentBill.id);
        // this.calculateTaxAndPrices();
      })
      .catch((error) => {
        console.error('error', error);
      })
      .finally(() => {
        this.dataProvider.syncer.next(false);
        this.dataProvider.pageSetting.blur = false;
      });
  }

  async updateBill() {
    this.dataProvider.syncer.next(true);
    try {
      const data: any = await this.databaseService.updateBill(
        {
          table: this.table,
          kots: this.allKots,
          customerInfoForm: this.customerInfoForm.value,
        },
        this.currentBill.id
      );

      this.alertify.presentToast('Bill updated');
    } catch (error) {
      console.log('currentBill', this.currentKot.id);
    } finally {
      this.dataProvider.syncer.next(false);
    }
  }

  addToKot() {
    this.dataProvider.syncer.next(true);
    this.databaseService
      .addToKot(this.products, this.currentKot.id, this.currentBill.id)
      .then((data: any) => {
        this.alertify.presentToast('Kot updated');
        console.log('currentBill', this.currentKot.id);
      })
      .catch((error) => {
        console.error('error', error);
      })
      .finally(() => {
        this.dataProvider.syncer.next(false);
      });
  }

  async finalizeKot() {
    console.log('finalizeKot', this.allKots);
    this.dataProvider.pageSetting.blur = true;
    this.dataProvider.syncer.next(true);
    // alert('Table id ' + this.table.id);
    try {
      console.log('%%', this.allKots);
      const data: any = await this.databaseService.finalizeKot(
        this.products,
        this.currentKot.id,
        this.currentBill.id,
        this.table.id
      );
      console.log('%%', this.allKots);
      this.alertify.presentToast('kot created ' + data.id);
      this.currentKot = data;
      this.allKots.push(this.currentKot);
      console.log('%%', this.allKots);
      await this.updateBill();
      console.log('currentBill', this.currentKot.id);
      this.products = [];
      console.log('%%', this.allKots);
      this.calculateTaxAndPrices();
      await this.printKot();
      console.log('%%', this.allKots);
    } catch (error) {
      console.error('error', error);
    } finally {
      this.dataProvider.pageSetting.blur = false;
      this.dataProvider.syncer.next(false);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.calculateTaxAndPrices();
    if (this.expandedBillView == 'open') {
      this.productsViewHeight = (window.innerHeight / 100) * 40 - 66;
    } else {
      this.productsViewHeight = (window.innerHeight / 100) * 60 - 66;
    }
  }

  deductStockItems() {
    // this.products.forEach((product)=>{
    //   // this.databaseService.deductStockItem(product);
    //   let deductibleItems = product.ingredients.map((ingredient:any)=>{
    //     return this.databaseService.deductStockItem(ingredient.id,ingredient.amount * product.quantity);
    //     // return ingredient.amount * product.quantity
    //   })
    //   this.dataProvider.syncer.next(true);
    //   Promise.all(deductibleItems).then((data)=>{
    //     this.alertify.presentToast('Bill finalized.');
    //   }).catch((error)=>{
    //     console.error('error', error);
    //     this.alertify.presentToast('Error cannot finalize bill.','error');
    //   }).finally(()=>{
    //     this.dataProvider.syncer.next(false);
    //   })
    //   console.log('deductibleItems',deductibleItems);
    // });
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

  async calculateTaxAndPrices() {
    // alert('calculating');
    this.totalAmount = 0;
    this.taxableValue = 0;
    this.totalTaxAmount = 0;
    if (this.products.length == 0 && this.ekdumConfirmProducts.length == 0) {
      this.dataProvider.pageSetting.blur = true;
      const bill: DocumentSnapshot<DocumentData> =
        await this.databaseService.getBill(this.currentBill.id);
      const data = bill.data();
      let kots = [];
      let products = [];
      if (!data) {
        this.alertify.presentToast('No bill found');
        return;
      } else if (data != undefined) {
        for (const kotId of data['kots']) {
          console.log('kotId', kotId);
          console.log('bill', this.currentBill);
          const data: any = await this.databaseService.getKot(
            kotId.id,
            this.currentBill.id
          );
          console.log('KOT: ', data.data(), data);
          kots.push({
            kotId: kotId.id,
            kot: data.data(),
          });
          products.push(...data.data().products);
        }
        this.allBillProducts = products;
        console.log('kots shivams', this.allBillProducts);
      }
      this.ekdumConfirmProducts = JSON.parse(
        JSON.stringify(this.allBillProducts)
      );
      // alert('Products: '+this.ekdumConfirmProducts.length)
      this.dataProvider.pageSetting.blur = false;
    }
    console.log('lelelo', this.ekdumConfirmProducts, this.products);
    if (this.ekdumConfirmProducts.length > 0) {
      this.ekdumConfirmProducts.forEach((product) => {
        this.taxableValue +=
          Number(product.shopPrice) * Number(product.quantity);
        this.totalQuantity += Number(product.quantity);
      });
    } else if (this.products.length > 0) {
      this.products.forEach((product) => {
        this.taxableValue +=
          Number(product.shopPrice) * Number(product.quantity);
        this.totalQuantity += Number(product.quantity);
      });
    }
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

    // this.filteredTaxes.forEach((tax) => {
    //   this.totalTaxAmount += (this.taxableValue / 100) * tax.amount;
    // });

    this.sgst = ((this.taxableValue / 100) * 2.5).toFixed(2);
    this.cgst = ((this.taxableValue / 100) * 2.5).toFixed(2);
    this.totalTaxAmount =
      (this.taxableValue / 100) * 2.5 + (this.taxableValue / 100) * 2.5;
    // this.filteredCharges.forEach((charge) => {
    //   this.totalTaxAmount += charge.amount;
    // });
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

  convertToWords(amount: number) {
    return numWords(amount);
  }

  async printKotAndBill() {
    console.log('All kots', this.allKots);
    console.log('Saptam', this.currentBill.kots);
    this.dataProvider.pageSetting.blur = true;
    const bill: DocumentSnapshot<DocumentData> =
      await this.databaseService.getBill(this.currentBill.id);
    const data = bill.data();
    let kots = [];
    let products = [];
    if (!data) {
      this.alertify.presentToast('No bill found');
      return;
    } else if (data != undefined) {
      for (const kotId of data['kots']) {
        console.log('kotId', kotId);
        console.log('bill', this.currentBill);
        const data: any = await this.databaseService.getKot(
          kotId.id,
          this.currentBill.id
        );
        console.log('KOT: ', data.data(), data);
        kots.push({
          kotId: kotId.id,
          kot: data.data(),
        });
        products.push(...data.data().products);
      }
      this.allBillProducts = products;
      console.log('kots shivams', this.allBillProducts);
    }
    this.ekdumConfirmProducts = JSON.parse(
      JSON.stringify(this.allBillProducts)
    );
    // alert('Products: '+this.ekdumConfirmProducts.length)
    this.dataProvider.pageSetting.blur = false;
    this.calculateTaxAndPrices();
    setTimeout(() => {
      this.printBill(true);
      this.printKot(true);
    }, 500);
  }

  async printKot(data: boolean = false) {
    console.log('ye lo', this.allKots, this.currentKot);
    if (!data) {
      this.dataProvider.pageSetting.blur = true;
      try {
        const bill: DocumentSnapshot<DocumentData> =
          await this.databaseService.getKot(
            this.allKots[this.allKots.length - 2].id,
            this.currentBill.id
          );
        const data = bill.data();
        console.log('KOT DETAILS: ', data);
        let kots = [];
        let products = [];
        if (!data) {
          this.alertify.presentToast('No bill found');
          return;
        } else if (data != undefined) {
          console.log("data['kots']", data['kots']);
          this.allBillProducts = data['products'];

          // for (const kotId of data['kots']) {
          //   console.log('kotId', kotId);
          //   console.log('bill', this.currentBill);
          //   const data: any = await this.databaseService.getKot(
          //     kotId.id,
          //     this.currentBill.id
          //   );
          //   console.log('KOT: ', data.data(), data);
          //   kots.push({
          //     kotId: kotId.id,
          //     kot: data.data(),
          //   });
          //   products.push(...data.data().products);
          // }
          // this.allBillProducts = products;
          console.log('kots shivams', this.allBillProducts);
          document.getElementById('bill')!.style.display = 'none';
          document.getElementById('billKot')!.style.display = 'block';
          window.print();
          document.getElementById('billKot')!.style.display = 'none';
          document.getElementById('bill')!.style.display = 'none';
        }
        this.ekdumConfirmProducts = JSON.parse(
          JSON.stringify(this.allBillProducts)
        );
        // alert('Products: '+this.ekdumConfirmProducts.length)
        this.dataProvider.pageSetting.blur = false;
        this.calculateTaxAndPrices();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async printBill(data: boolean = false) {
    if (!data) {
      this.dataProvider.pageSetting.blur = true;
      const bill: DocumentSnapshot<DocumentData> =
        await this.databaseService.getBill(this.currentBill.id);
      const data = bill.data();
      let kots = [];
      let products = [];
      if (!data) {
        this.alertify.presentToast('No bill found');
        return;
      } else if (data != undefined) {
        for (const kotId of data['kots']) {
          console.log('kotId', kotId);
          console.log('bill', this.currentBill);
          const data: any = await this.databaseService.getKot(
            kotId.id,
            this.currentBill.id
          );
          console.log('KOT: ', data.data(), data);
          kots.push({
            kotId: kotId.id,
            kot: data.data(),
          });
          products.push(...data.data().products);
        }
        this.allBillProducts = products;
        console.log('kots shivams', this.allBillProducts);
      }
      this.ekdumConfirmProducts = JSON.parse(
        JSON.stringify(this.allBillProducts)
      );
      // alert('Products: '+this.ekdumConfirmProducts.length)
      this.dataProvider.pageSetting.blur = false;
      this.calculateTaxAndPrices();
    }
    // console.log('kots shivams',this.kots);
    document.getElementById('bill')!.style.display = 'block';
    document.getElementById('billKot')!.style.display = 'none';
    window.print();
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('bill')!.style.display = 'none';
  }

  cancel() {
    const reason = prompt('Give us a reason to continue to delete this bill');
    let phone = this.customerInfoForm.value.phoneNumber;
    if (!phone) {
      phone = prompt("Provide customer's phone number");
      while (!phone && !phone.test(/^[0-9]{10}$/)) {
        phone = prompt("Provide customer's phone number");
      }
    }
    if (reason) {
      this.products = [];
      this.customerInfoForm.reset();
      this.databaseService
        .deleteBill(this.currentBill.id, reason, phone.toString())
        .then((data) => {
          this.alertify.presentToast('Bill cancelled.');
        })
        .catch((error) => {
          console.error('error', error);
          this.alertify.presentToast('Error cannot cancel bill.', 'error');
        });
    } else {
      this.alertify.presentToast(
        'Please give a reason to delete this bill',
        'error'
      );
    }
  }

  updatePaymentType() {
    this.dataProvider.syncer.next(true);
    this.databaseService
      .updatePaymentType(this.currentBill.id, this.paymentType)
      .then((data) => {
        this.alertify.presentToast('Payment type updated.');
      })
      .finally(() => {
        this.dataProvider.syncer.next(false);
      });
  }

  updateDineMethod() {
    this.dataProvider.syncer.next(true);
    this.databaseService
      .updateDineMethod(this.currentBill.id, this.dineMethod)
      .then((data) => {
        this.alertify.presentToast('Dine method updated.');
      })
      .finally(() => {
        this.dataProvider.syncer.next(false);
      });
  }

  seeAllKots() {
    this.dialog.open(AllKotsComponent, {
      data: { kots: this.allKots, ...this.currentBill },
    });
  }

  async finalizeBill() {
    if (this.products.length > 0) {
      if (
        confirm(
          'The products in current kot are no finalized should we finalize them?'
        )
      ) {
        await this.finalizeKot();
      } else {
        this.products = [];
      }
    }
    await this.printBill();
    this.databaseService
      .finalizeBill(this.currentBill.id, this.table)
      .then((data) => {
        this.alertify.presentToast('Bill finalized.');
        this.products = [];
        this.customerInfoForm.reset();
        this.currentBill = null;
        this.currentKot = null;
        this.allKots = [];
      })
      .catch((error) => {
        console.error('error', error);
        this.alertify.presentToast('Error cannot finalize bill.', 'error');
      });
  }
}

type Tax = {
  value: number;
  type: 'percentage' | 'flat';
  name: string;
  id?: string;
};
