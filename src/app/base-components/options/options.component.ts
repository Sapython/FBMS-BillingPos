import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReprintKotComponent } from 'src/app/reprint-kot/reprint-kot.component';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  // items = [
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  //   {
  //     tableNo: 'C34',
  //     waiterName: 'Sujit',
  //     id: '#579',
  //     dishName: 'Caser Salad',
  //     peopleOdered: 4,
  //     topping: 'Chix',
  //     extra: 'Dressing on Slide',
  //     timeLeft: '6M:47S',
  //     time: '10:34 PM',
  //   },
  // ]
  currentBill: any;
  today: Date = new Date();
  bills: any[] = [];
  taxableValue: number = 0;
  totalQuantity: number = 0;
  totalTaxAmount: number = 0;
  subTotal: number = 0;
  constructor(
    private databaseService: DatabaseService,
    private alertify: AlertsAndNotificationsService,
    public dataProvider: DataProviderService,
    private dialog:Dialog
  ) {}
  customers: any[] = [];
  cancelledBills: any[] = [];
  range = new FormGroup({
    start: new FormControl<Date | null>(null, [Validators.required]),
    end: new FormControl<Date | null>(null, [Validators.required]),
  });
  ngOnInit(): void {
    this.getCustomers();
    this.getCancelledBills();
    this.range.valueChanges.subscribe((value) => {
      if (value.start && value.end) {
        if (value.start?.getTime() == value.end?.getTime()) {
          value.end?.setHours(24);
        }
        this.getBills(value.start, value.end);
      }
    });
  }
  joinByComma(kotTokens?: any[]) {
    // console.log("kotTokens",kotTokens)
    if (kotTokens) {
      let res = '';
      kotTokens.forEach((token: any) => {
        res = res + token + ',  ';
      });
      return res.slice(0, -1);
    }
    return '';
  }
  toFixedValue(value: number) {
    if (value) {
      return value.toFixed(2);
    }
    return '0.00';
  }
  getCustomers() {
    this.databaseService.getCustomers().subscribe((docs) => {
      this.customers = [];
      docs.forEach((doc: any) => {
        // console.log("savedBills",doc.data())
        this.customers.push({ ...doc.data(), id: doc.id });
      });
    });
  }

  getBills(start: Date, end: Date) {
    this.databaseService
      .getCompletedBills(start, end)
      .subscribe((docs: any) => {
        this.bills = [];
        docs.forEach((element: any) => {
          this.bills.push({ ...element.data(), id: element.id });
          console.log('bills', this.bills);
        });
      });
  }

  getCancelledBills() {
    this.databaseService.getCancelledBills().subscribe((docs) => {
      this.cancelledBills = [];
      docs.forEach((doc: any) => {
        this.cancelledBills.push({ ...doc.data(), id: doc.id });
      });
    });
  }

  recover(deletedMenu: any) {
    this.databaseService.recoverBill(deletedMenu.id).then(() => {
      this.alertify.presentToast('Bill Recovered', 'info', 3000);
      this.getCancelledBills();
      this.getCustomers();
    });
  }

  reprintBill(bill: any) {
    console.log(bill)
    let allKotProducts: any[] = [];
    bill?.kots.forEach((kot: any) => {
      if (!kot.cancelled) {
        kot.products.forEach((product: any) => {
          console.log('product.quantity', product.quantity);
          this.taxableValue += product.shopPrice * product.quantity;
          this.subTotal += product.shopPrice * product.quantity;
          this.totalQuantity += product.quantity;
          allKotProducts.push(product);
        });
      }
    });
    const sgst = (this.taxableValue / 100) * 2.5;
    const cgst = (this.taxableValue / 100) * 2.5;
    const data = {
      printer: this.dataProvider.currentProject.billPrinter,
      currentProject: this.dataProvider.currentProject,
      isNonChargeable: bill.isNonChargeable,
      complimentaryName: bill.complimentaryName,
      customerInfoForm: bill.customerInfo,
      kotsToken: this.joinByComma(bill.kotTokens),
      tokenNo: bill!.billNo,
      currentTable: bill.table,
      date: (bill.date.toDate()).toLocaleDateString(),
      allProducts: allKotProducts,
      selectDiscounts: bill.selectDiscounts,
      specialInstructions: 'Modified',
      totalQuantity: this.totalQuantity,
      taxableValue: this.subTotal,
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      grandTotal: bill.grandTotal.toFixed(2),
      paymentMethod: bill.paymentType,
      id: bill!.id,
      billNo: bill!.billNo,
    };
    console.log(data);
    fetch('http://127.0.0.1:8080/printBill', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        console.log('Contente', res);
      })
      .catch((err) => {
        console.log('Error', err);
        alert('Error occurredd while printing bill');
      });
  }

  rePrintKot(bill:any){
    const inst = this.dialog.open(ReprintKotComponent,{data:bill})
    inst.componentInstance?.close.subscribe((data:any)=>{
      inst.close()
    })
  }
}
