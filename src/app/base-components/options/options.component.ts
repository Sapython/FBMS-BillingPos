import { Component, OnInit } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
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
  currentBill:any;
  today:Date = new Date()
  bills: any[] = [];
  constructor(private databaseService:DatabaseService,private alertify:AlertsAndNotificationsService,public dataProvider:DataProviderService) { }
  customers:any[] = []
  cancelledBills:any[] = []
  ngOnInit(): void {
    this.getCustomers()
    this.getBills()
    this.getCancelledBills()
  }
  joinByComma(kotTokens?:any[]){
    // console.log("kotTokens",kotTokens)
    if(kotTokens){
      let res = ''
    kotTokens.forEach((token:any)=>{
      res = res + token + ','
    })
      return res.slice(0,-1)
    } return ''
  }
  toFixedValue(value: number) {
    if(value){return value.toFixed(2);}return '0.00'
  }
  getCustomers(){
    this.databaseService.getCustomers().subscribe((docs)=>{
      this.customers = []
      docs.forEach((doc:any)=>{
        // console.log("savedBills",doc.data())
        this.customers.push({...doc.data(),id:doc.id})
      })
    })
  }

  getBills(){
    this.databaseService.getCompletedBills().subscribe((docs:any)=>{
      this.bills = []
      docs.forEach((element:any) => {
        this.bills.push({...element.data(),id:element.id})
        console.log("bills",this.bills)
      });
    })
  }

  getCancelledBills(){
    this.databaseService.getCancelledBills().subscribe((docs)=>{
      this.cancelledBills = []
      docs.forEach((doc:any)=>{
        this.cancelledBills.push({...doc.data(),id:doc.id})
      })
    })
  }

  recover(deletedMenu:any){
    this.databaseService.recoverBill(deletedMenu.id).then(()=>{
      this.alertify.presentToast("Bill Recovered",'info',3000)
      this.getCancelledBills();
      this.getCustomers();
    })
  }

  reprintBill(bill:any){
    // this.currentBill = bill
    console.log("currentBill",bill)
    const allKotProducts:any[] = []
    let taxableValue:number = 0
    let totalQuantity:number = 0
    let kotTokens:any[] = []
    bill.kots.forEach((kot:any)=>{
      if(kot.finalized) {
        kot.products.forEach((product:any)=>{
          allKotProducts.push(product)
          taxableValue += product.totalPrice * product.quantity
          totalQuantity += product.quantity
        })
        kotTokens.push(kot.kotToken)
      }
    })
    let discounts:any[] = []
    bill.selectedDiscounts.forEach((discount:any)=>{
      if(discount.chcked){
        if (discount.discountType == 'flat') {
          const val = discount.discountValue;
          discounts.push({
            title:discount.title,
            discountValue:discount.discountValue,
            discountType:discount.discountType,
            discountedValue:val
          });
          taxableValue -= val;
        } else if (discount.discountType == 'percentage') {
          const val = (taxableValue / 100) * discount.discountValue;
          taxableValue -= val;
          discounts.push({
            title:discount.title,
            discountValue:discount.discountValue,
            discountType:discount.discountType,
            discountedValue:val
          });
        }
      }
    })

    bill.cgst = (taxableValue/100) * 2.5
    bill.sgst = (taxableValue/100) * 2.5
    bill.grandTotal = Math.ceil(taxableValue + bill.cgst + bill.sgst)
    document.getElementById('bill')!.style.display = 'none';
    document.getElementById('cancelledBillKot')!.style.display = 'none';
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('reprintBillKot')!.style.display = 'none';
    document.getElementById('reprintBill')!.style.display = 'block';
    window.print();
    document.getElementById('billKot')!.style.display = 'none';
    document.getElementById('bill')!.style.display = 'none';
    document.getElementById('reprintBillKot')!.style.display = 'none';
    document.getElementById('cancelledBillKot')!.style.display = 'none';
    document.getElementById('reprintBill')!.style.display = 'none';
  }
}
