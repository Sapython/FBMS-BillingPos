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
  HostListener,
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
export class BillComponent implements OnInit, OnChanges {
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
  subTotal: number = 0;
  cgst: number = 0;
  sgst: number = 0;
  totalTaxAmount: number = 0;
  deskKot: boolean = false;
  customerInfoForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('', [Validators.email]),
    phone: new FormControl('', [Validators.pattern('[0-9]{10}')]),
    address: new FormControl(''),
  });
  cancelledtokenNo: number = 0;
  today: Date = new Date();
  currentTable: Table | undefined;
  totalQuantity: number = 0;
  grandTotal = 0;
  paymentMethod: string = '';
  cancelledItems: any[] = [];
  reprintKotItems: any[] = [];
  reprinttokenNo: number = 0;
  complimentaryName: string = '';
  kotModificationMode: any;
  deletedItems:any[] = []

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
    this.dataProvider.clearTableFunc = this.clearCurrentTable.bind(this);
  }

  @HostListener('window:keydown',['$event'])
  logKeyEvent(event:any){
    if(this.currentBill){
      if(event.key=='f6'){
        event.preventDefault()
        this.finalizeKot()
      } else if(event.key=='f8'){
        event.preventDefault()
        this.finalizeBill()
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.calculateTaxAndPrices()
      if(this.currentKot?.products && this.currentKot?.products.length > 0){
        this.dataProvider.kotActive = true;
      } else {
        this.dataProvider.kotActive = false;
      }
      const onlineKot = this.currentBill!.kots.filter((kot) => kot.finalized);
      if (onlineKot.length > 0) {
        this.dataProvider.kotFinalizedActive = true;
      } else {
        this.dataProvider.kotFinalizedActive = false;
      }
  }

  clearCurrentTable() {
    if (this.currentTable?.type=='table') {
      this.databaseService.emptyTable(this.currentTable!.id);
    } else {
      this.databaseService.emptyRoom(this.currentTable!.id);
    }
  }

  ngOnInit(): void {
    this.dataProvider.tableChanged.subscribe(async (table) => {
      this.resetValues();
      // this.currentKot!.products = []
      // this.currentKot = undefined
      // this.allKotProducts = []
      this.offlineKot = []
      this.currentTable = table;
      if (this.currentTable && this.currentTable.bill) {
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
        // alert('Table has bill '+this.currentKot?.products.length);
        if(this.currentKot?.products && this.currentKot?.products.length > 0){
          this.dataProvider.kotActive = true;
        } else {
          this.dataProvider.kotActive = false;
        }
        this.changeDetection.detectChanges()
      } else {
        // alert('No Bill exists on current table. Creating one');
        this.createBill();
      }
    });
    this.dataProvider.selectedProduct.subscribe(async (product) => {
      if (!this.currentTable && !this.dataProvider.takeawayMode) {
        this.alertify.presentToast('Please select a table', 'error');
        this.dataProvider.openTableFunction();
        return;
      }
      console.log("selectedProduct",product)
      if(!this.currentBill){
        this.createBill();
        // alert("Created a bill")
      }
      // quantity handler
      const onlineKot = this.currentBill!.kots.filter((kot) => !kot.finalized);
      console.log('onlineKot', onlineKot);
      if (onlineKot && onlineKot.length > 0) {
        // alert("Adding to existing kot")
        this.currentKot = onlineKot[0];
        console.log('this.currentBill!.kotTokens',this.currentBill)
        if(this.currentKot && !(this.currentKot.tokenNo in this.currentBill!.kotTokens || [])){
          // check if kottokns is an array
          if(this.currentBill!.kotTokens && this.currentBill!.kotTokens.length > 0){
            this.currentBill?.kotTokens.push(...[this.currentKot.tokenNo])
          } else {
            this.currentBill!.kotTokens = [this.currentKot.tokenNo]
          }
        }
        let productIndex = this.currentKot!.products.findIndex(
          (p) => p.id == product.id
        );
        if (productIndex != -1) {
          // alert("Product already exists in kot")
          this.currentKot!.products[productIndex].quantity += 1;
        } else {
          // alert("Product does not exist in kot")
          this.currentKot!.products.push({
            ...product,
            quantity: product.quantity || 1,
          });
        }
        console.log("this.currentKot",this.currentKot)
        this.updateBill();
        // alert('Table has bill '+this.currentKot?.products.length);
        if(this.currentKot?.products && this.currentKot?.products.length > 0){
          this.dataProvider.kotActive = true;
        } else {
          this.dataProvider.kotActive = false;
        }
        this.changeDetection.detectChanges()
      } else {
        // alert("Creating a new kot")
        this.currentKot = {
          id: this.generateRandomId(),
          products: [product],
          date: new Date(),
          finalized: false,
          tokenNo: this.dataProvider.currentTokenNo+1,
          cancelled:false
        };
        if(this.currentKot && !(this.currentKot.tokenNo in this.currentBill!.kotTokens || [])){
          if(this.currentBill!.kotTokens && this.currentBill!.kotTokens.length > 0){
            this.currentBill?.kotTokens.push(...[this.currentKot.tokenNo])
          } else {
            this.currentBill!.kotTokens = [this.currentKot.tokenNo]
          }
        }
        this.databaseService.addTokenNo();
        this.currentBill!.kots.push(
          JSON.parse(JSON.stringify(this.currentKot))
        );
        if(this.currentKot?.products && this.currentKot?.products.length > 0){
          this.dataProvider.kotActive = true;
        } else {
          this.dataProvider.kotActive = false;
        }
        const onlineKot = this.currentBill!.kots.filter((kot) => kot.finalized);
        if (onlineKot.length > 0) {
          this.dataProvider.kotFinalizedActive = true;
        } else {
          this.dataProvider.kotFinalizedActive = false;
        }
        this.changeDetection.detectChanges()
      }
      alert("Cont")
      if (this.currentTable && !this.dataProvider.takeawayMode){
        alert("Passed")
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
        } else {
          this.createBill();
        }
      } else if (this.dataProvider.takeawayMode) {
        alert("Takeaway")
        console.log('Takeaway')
        this.createBill();
      } else {
        alert("Unknown mode selected")
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
        tokenNo:this.dataProvider.currentTokenNo + 1,
        cancelled:false
      };
      this.currentBill?.kotTokens.push(this.currentKot.tokenNo);
      this.databaseService.addTokenNo()
      this.currentBill!.kots.push(JSON.parse(JSON.stringify(this.currentKot)));
    }
  }

  generateRandomId() {
    return Math.floor(Math.random() * 100000000000000000).toString();
  }

  setDiscount(event:any){
    this.currentBill!.selectedDiscounts = event.value
    this.updateBill();
  }

  calculateTaxAndPrices() {
    this.taxableValue = 0;
    this.totalQuantity = 0;
    this.totalTaxAmount = 0;
    this.subTotal = 0;
    this.currentBill?.kots.forEach((kot) => {
        if(!kot.cancelled){
          kot.products.forEach((product: any) => {
            console.log("product.quantity",product.quantity)
            this.taxableValue += product.shopPrice * product.quantity;
            this.subTotal += product.shopPrice * product.quantity;
            this.totalQuantity += product.quantity;
          });
        }
    });
    this.selectDiscounts.forEach((discount,index) => {
      if (discount.discountType == 'flat') {
        const val = discount.discountValue;
        this.discountValues.push(val);
        this.taxableValue -= val;
      } else if (discount.discountType == 'percentage') {
        const val = (this.taxableValue / 100) * discount.discountValue;
        this.discountValues.push(val);
        this.taxableValue -= val;
        this.selectDiscounts[index].appliedDiscountValue = Math.floor(val);
      }
    });
    this.sgst = (this.taxableValue / 100) * 2.5;
    this.cgst = (this.taxableValue / 100) * 2.5;
    this.totalTaxAmount = this.sgst + this.cgst;
    this.taxableValue = Math.ceil(this.taxableValue);
    this.grandTotal = Math.ceil(this.taxableValue + this.totalTaxAmount);
    if (this.isNonChargeable) {
      this.grandTotal = 0;
      this.changeDetection.detectChanges();
    }
  }

  toFixedValue(value: number) {
    return value.toFixed(2);
  }

  delete(id: string, item: any) {
    const index = this.currentKot!.products.findIndex((p) => p.id == id);
    this.deletedItems.push(item.product);
    if (index != -1) {
      this.currentKot!.products.splice(index, 1);
    }
    this.updateBill();
  }

  updateQuantity(ref: any,event:any) {
    let productIndex = this.currentKot!.products.findIndex(
      (p) => p.id == ref.id
    );
    let kotIndex = this.currentBill!.kots.findIndex(
      (kot) => kot.tokenNo == this.currentKot!.tokenNo
    );
    if (productIndex != -1) {
      // alert("Product already exists in kot")
      this.currentBill!.kots[kotIndex].products[productIndex].quantity = Number(event.target.value);
    } else {
      // alert("Product does not exist in kot")
      this.currentBill!.kots[kotIndex].products.push(ref);
    }
    console.log(ref,event, this.currentKot);
    this.calculateTaxAndPrices();
    this.updateBill()
  }

  updateBill(finalizedKot: boolean = false) {
    console.log(this.currentBill,this.currentKot,finalizedKot)
    if (finalizedKot) {
      this.dataProvider.pageSetting.blur = true;
    }
    if (this.currentBill) {
      this.updateBillData(this.currentBill, this.currentBill.id).finally(() => {
        if (finalizedKot) {
          this.dataProvider.pageSetting.blur = false;
          this.currentKot!.products = [];
          console.log('Damn', this.currentKot, this.currentBill);
          this.databaseService.getBill(this.currentTable!.bill).then((bill) => {
            this.currentBill = bill.data() as Bill;
            console.log('Damn', this.currentKot, this.currentBill);
            this.calculateTaxAndPrices()
          })
        }
        this.calculateTaxAndPrices();
      });
    } else {
      this.alertify.presentToast('No bill to update', 'error');
    }
  }
  saveBill(){
    this.updateBill();
    this.calculateTaxAndPrices();
  }

  createBill() {
    this.dataProvider.kotActive = true;
    if (!this.dataProvider.takeawayMode){
      this.currentBill = {
        settled: false,
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
        selectedDiscounts: [],
        specialInstructions: '',
        tokenNo: this.dataProvider.currentTokenNo + 1,
        kotTokens:[]
      };
      this.currentTable!.bill = this.currentBill.id;
      console.log(this.currentBill);
      this.dataProvider.allBills.find((bill) => bill.id === this.currentBill!.id)
        ? null
        : this.dataProvider.allBills.push(this.currentBill);
      this.databaseService.createBill(this.currentBill, this.currentBill.id);
    } else {
      alert('CCreatig tkwy')
      this.currentBill = {
        settled: false,
        date: new Date(),
        customerInfo: this.customerInfoForm.value,
        completed: false,
        deviceId: this.dataProvider.deviceData.deviceId,
        dineMethod: 'dineIn',
        kots: this.offlineKot,
        paymentType: 'cash',
        project: this.dataProvider.currentProject,
        user: this.dataProvider.userData?.userId || '',
        grandTotal: this.grandTotal,
        id: this.generateRandomId(),
        isNonChargeable: false,
        selectedDiscounts: [],
        specialInstructions: '',
        tokenNo: this.dataProvider.currentTokenNo + 1,
        kotTokens:[]
      };
      // this.currentTable!.bill = this.currentBill.id;
      console.log(this.currentBill);
      this.dataProvider.allBills.find((bill) => bill.id === this.currentBill!.id)
        ? null
        : this.dataProvider.allBills.push(this.currentBill);
      this.databaseService.createBill(this.currentBill, this.currentBill.id);
    }
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
    this.deskKot = false;
    this.changeDetection.detectChanges();
    if(this.currentKot && !(this.currentKot.tokenNo in this.currentBill!.kotTokens || [])){
      this.currentBill?.kotTokens.push(...[this.currentKot.tokenNo])
    }
    console.log('finalizing kot', this.currentKot!.products);
    if (this.kotModificationMode){
      const data = {
        "printer": this.dataProvider.currentProject.kotPrinter,
        "currentProject":this.dataProvider.currentProject,
        "tokenNo": this.kotModificationMode.tokenNo,
        "currentTable": this.currentTable,
        "allProducts":this.currentKot!.products,
        "deleted":this.deletedItems,
        "date":(new Date()).toLocaleString('en-GB'),
        "mode":"edited",
        "billNo":this.currentBill!.billNo
      }
      console.log("modified",data)
        fetch('http://127.0.0.1:8080/printKot',{
          method:'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((res) => {
          console.log("Contente",res)
        }).catch((err) => {
          console.log("Error",err)
        }).finally(() => {this.kotModificationMode=false;})
    } else {
      const data = {
        "printer": this.dataProvider.currentProject.kotPrinter,
        "currentProject":this.dataProvider.currentProject,
        "tokenNo": this.currentKot!.tokenNo,
        "currentTable": this.currentTable,
        "allProducts":this.currentKot!.products,
        "mode":"normal",
        "date":(new Date()).toLocaleString('en-GB'),
        "billNo":this.currentBill!.billNo
      }
      console.log(data)
        fetch('http://127.0.0.1:8080/printKot',{
          method:'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((res) => {
          console.log("Contente",res)
        }).catch((err) => {
          console.log("Error",err)
        })
    }
    this.currentBill!.kots[this.currentBill!.kots.length - 1]['finalized'] =
      true;
    this.updateBill(true);
    this.dataProvider.kotActive = false;
    this.changeDetection.detectChanges();
  }

  async finalizeBill() {
    if (this.paymentMethod == 'pickUp' && !this.customerInfoForm.value.name && !this.customerInfoForm.value.address) {
      alert('Cannot finalize bill without customer name and address');
      return;
    }
    console.log('CURRENT BILL BEFORE FINAL', this.currentBill);
    this.allKotProducts = [];
    await this.setBillNo(this.currentBill!)
    this.databaseService.getBill(this.currentBill!.id).then((bill) => {
      var billData:any = bill.data()
      if (billData){
        this.currentBill = billData;
        this.calculateTaxAndPrices();
      } else {
        this.alertify.presentToast('Bill not found', 'error');
        return 
      };
      const allKOTsTokens:string[] = []
      console.log('CURRENT KOTS BEFORE FINAL', JSON.parse(JSON.stringify(billData?.['kots'])));
      JSON.parse(JSON.stringify(billData?.['kots'])).forEach((kot:any) => {
        if (kot.cancelled==false){
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
            // check if product exists in allKotProducts if not add it or else add quantity
            this.allKotProducts.find(
              (p) => p.id === product.id
            )
              ? (this.allKotProducts.find(
                  (p) => p.id === product.id
                )!.quantity += product.quantity)
              : this.allKotProducts.push(product);
          });
          if (kot.products.length > 0){
            allKOTsTokens.push(kot.tokenNo)
          }
        }
      });
      console.log('CURRENT KOTS AFTER FINAL', JSON.parse(JSON.stringify(this.allKotProducts)));
      this.currentBill!.grandTotal = this.grandTotal;
      this.currentBill!.kotTokens = allKOTsTokens;
      this.changeDetection.detectChanges();
      const modifiedDiscounts = JSON.parse(JSON.stringify(this.selectDiscounts))
      const data = {
        "printer":this.dataProvider.currentProject.billPrinter,
        "currentProject":this.dataProvider.currentProject,
        "isNonChargeable":this.isNonChargeable,
        "complimentaryName":this.complimentaryName,
        "customerInfoForm":this.customerInfoForm.value,
        "kotsToken":this.joinByComma(this.currentBill!.kotTokens),
        "currentTable":this.currentTable,
        "allProducts":this.allKotProducts,
        "selectDiscounts":this.selectDiscounts,
        "specialInstructions":this.specialInstructions,
        "totalQuantity":this.totalQuantity,
        "taxableValue":this.subTotal,
        "date": (new Date()).toLocaleDateString('en-GB'),
        "time": (new Date()).toLocaleTimeString('en-GB'),
        "cgst":(this.cgst).toFixed(2),
        "sgst":(this.sgst).toFixed(2),
        "grandTotal":(this.grandTotal).toFixed(2),
        "paymentMethod":this.paymentMethod,
        "id":this.currentBill!.id,
        "billNo":this.isNonChargeable ? "NC-" + (this.currentBill!.billNo)!.toString() : this.currentBill!.billNo,
      }
      this.currentBill!.sgst = (this.sgst).toFixed(2)
      this.currentBill!.cgst = (this.cgst).toFixed(2)
      this.currentBill!.grandTotalString = (this.grandTotal).toFixed(2)
      this.currentBill!.subTotal = this.subTotal

      this.updateBill()

      console.log("SHIT",data)
      fetch('http://127.0.0.1:8080/printBill',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log("Contente",res)
      }).catch((err) => {
        console.log("Error",err)
        alert("Error occurred while printing bill")
      })
      if (this.currentTable?.type=='table') {
        this.databaseService.finalizeTable(this.currentTable!.id);
        // alert("Clearing table")
      } else {
        this.databaseService.finalizeRoom(this.currentTable!.id);
        // alert("Clearing room")
      }
      this.currentBill!.completed = true;
      this.updateBill();
      this.dataProvider.openTableFunction();
      this.resetValues()
      this.currentKot!.products = []
      this.currentKot = undefined
      this.allKotProducts = []
      this.offlineKot = []
    });
  }

  cancel() {
    const allProds = []
    this.currentBill?.kots.forEach((kot:any) => {
      kot.products.forEach((prod:any) => {
        allProds.push(prod)
      })
    })
    if (allProds.length > 0){  
      const inst = this.dialog.open(CancelModalComponent, {
        data: {},
      });
      inst.componentInstance?.completed.subscribe((data) => {
        console.log(this.currentBill,data);
        if (data && data.phone && data.reason) {
          this.dataProvider.pageSetting.blur = true;
          this.databaseService
          .deleteBill(this.currentBill!.id, data.reason, data.phone.toString(),data.type)
          .then((data) => {
            this.alertify.presentToast('Bill cancelled.');
            inst.close();
          })
          .catch((error) => {
            console.error('error', error);
            this.alertify.presentToast('Error cannot cancel bill.', 'error');
          })
          .finally(() => {
            console.log("Finally",this.currentTable)
            if(this.currentTable?.type=='room'){
              this.databaseService.emptyRoom(this.currentTable!.id);
            } else {
              this.databaseService.emptyTable(this.currentTable!.id);
            }
            this.dataProvider.openTableFunction()
              this.resetValues();
              this.dataProvider.pageSetting.blur = false;
            });
        } else {
          inst.close();
        }
      });
    } else {
      if (this.currentTable?.type=='table') {
        this.databaseService.emptyTable(this.currentTable!.id);
      } else {
        this.databaseService.emptyRoom(this.currentTable!.id);
      }
      this.dataProvider.openTableFunction()
    }
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
    const inst = this.dialog.open(CustomerInfoModalComponent,{
      data:this.customerInfoForm.value
    });
    inst.componentInstance?.done.subscribe((data) => {
      console.log(data)
      if (data) {
        this.customerInfoForm.patchValue(data);
        this.currentBill!.customerInfo = data;
        this.updateBill();
      }
      inst.close();
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
        inst.componentInstance?.deleteKots.subscribe((data) => {
          console.log(data)
          const found = this.currentBill?.kots.find((kot) => kot.id == data.id)
          if (found){
            this.printCancelledKot(found.products,found.tokenNo)
            // this.currentBill!.kots.find((kot) => kot.id == data.id)!.products = [];
            this.currentBill!.kots.find((kot) => kot.id == data.id)!.cancelled = true;
          }
          this.updateBill();
          inst.close();
        })
        inst.componentInstance?.reprint.subscribe((data) => {
          console.log("edit kot",data)
          const found = this.currentBill?.kots.find((kot) => kot.id == data.id)
          if (found){
            this.rePrintKot(found.products,found.tokenNo)
            // this.currentBill!.kots.find((kot) => kot.id == data.id)!.products = [];
          }
          inst.close();
          this.updateBill();
        })
        inst.componentInstance?.editKots.subscribe((data) => {
          console.log("edit kot",data)
          const found = this.currentBill?.kots.find((kot) => kot.id == data.id)
          if (found){
            // this.printCancelledKot(found.products,found.tokenNo)
            this.kotModificationMode = data
            this.currentBill!.kots.find((kot) => kot.id == data.id)!.cancelled = true;
            // const res= JSON.parse(JSON.stringify(this.currentBill!.kots.find((kot) => kot.id == data.id)!.products));
            // console.log(res)
            console.log("found.products",found.products)
            found.products.forEach((product:any)=>{
              this.dataProvider.selectedProduct.next(product);
            })
            // this.currentBill!.kots.find((kot) => kot.id == data.id)!.products = [];
          }
          inst.close();
          this.updateBill();
        })
      })
      .finally(() => {
        this.dataProvider.pageSetting.blur = false;
      })
      .catch((error) => {
        console.error('error', error);
        this.alertify.presentToast('Error cannot fetch bill.', 'error');
      });
  }
  printKot(products: any[], tokenNo: number) {
    console.log(products);
    const data = {
      "printer": this.dataProvider.currentProject.kotPrinter,
      "currentProject":this.dataProvider.currentProject,
      "tokenNo": tokenNo,
      "currentTable": this.currentTable,
      "allProducts":this.currentKot!.products,
      "billNo": this.currentBill?.billNo,
      "date":(new Date()).toLocaleString(),
    }
    console.log(data)
      fetch('http://127.0.0.1:8080/printKot',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log("Contente",res)
      }).catch((err) => {
        console.log("Error",err)
      })
  }
  printCancelledKot(products:any[],tokenNo:number){
    this.cancelledItems = products
    this.cancelledtokenNo = tokenNo
    this.changeDetection.detectChanges();
    const data = {
      "printer": this.dataProvider.currentProject.kotPrinter,
      "currentProject":this.dataProvider.currentProject,
      "tokenNo": this.cancelledtokenNo,
      "currentTable": this.currentTable,
      "allProducts":this.cancelledItems,
      "cancelled":true,
      "billNo": this.currentBill?.billNo,
      "date":(new Date()).toLocaleString(),
    }
    console.log(data)
      fetch('http://127.0.0.1:8080/printKot',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log("Contente",res)
      }).catch((err) => {
        console.log("Error",err)
      })
  }
  rePrintKot(products:any[],tokenNo:number){
    this.reprintKotItems = products
    this.reprinttokenNo = tokenNo
    this.changeDetection.detectChanges();
    const data = {
      "printer": this.dataProvider.currentProject.kotPrinter,
      "currentProject":this.dataProvider.currentProject,
      "tokenNo": this.reprinttokenNo,
      "currentTable": this.currentTable,
      "allProducts":this.reprintKotItems,
      "billNo": this.currentBill?.billNo,
      "date":(new Date()).toLocaleString(),
    }
    console.log(data)
      fetch('http://127.0.0.1:8080/printKot',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log("Contente",res)
      }).catch((err) => {
        console.log("Error",err)
      })
  }
  setComplimentary(event:any){
    console.log("event",event)
    if (event.checked){
      let res:any = ''
      while (res==''){
        res = prompt("Enter Name of Complimentary Person")
        console.log('res',res)
      }
      if(res){
        this.complimentaryName = res
        this.isNonChargeable = true
        this.currentBill!.isNonChargeable = true
        console.log('passed')
      } else {
        setTimeout(()=>{
          this.isNonChargeable = false
          this.calculateTaxAndPrices()
        },100)
        this.changeDetection.detectChanges()
        console.log('failed')
      }
    }
  }

  joinByComma(kotTokens?:any[]){
    // console.log("kotTokens",kotTokens)
    if(kotTokens){
      let res = ''
      kotTokens.forEach((token:any)=>{
        res = res + token + ', '
      })
      return res.slice(0,-1)
    } return ''
  }
  setBillNo(bill:Bill){
    // alert(bill.isNonChargeable ? 'True':'False')
    if (bill.isNonChargeable){
      // alert(this.dataProvider.ncBillNo)
      bill.billNo = this.dataProvider.ncBillNo
      this.databaseService.addNcBillNo()
      this.updateBill()
    } else {
      // alert(this.dataProvider.billNo)
      bill.billNo = this.dataProvider.billNo
      this.databaseService.addBillNo()
      this.updateBill()
    }
  }
}

export type Bill = {
  settled: boolean;
  id: string;
  billNo?:number,
  completed: boolean;
  customerInfo: any;
  date: any;
  tokenNo: number;
  selectedDiscounts: any[];
  deviceId: string;
  dineMethod: 'dineIn' | 'pickUp';
  kots: any[];
  paymentType: 'cash' | 'card';
  project: any;
  table?: Table;
  tableId?: string;
  user: string;
  isNonChargeable: boolean;
  specialInstructions: string;
  kotTokens:any[];
  sgst?: string;
  cgst?: string;
  grandTotalString?: string;
  subTotal?: number;
  discount?: any[];
  grandTotal: number;
};

export type Tax = {
  value: number;
  type: 'percentage' | 'flat';
  name: string;
  id?: string;
};

export type Kot = {
  id: string;
  date: any;
  products: any[];
  finalized: boolean;
  tokenNo: number;
  cancelled:boolean;
};

export type Table = {
  id: string;
  bill: string;
  maxOccupancy: string;
  name: string;
  status: 'available' | 'occupied';
  tableNo: string;
  type: 'table' | 'room';
};
