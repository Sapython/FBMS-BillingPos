import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ManageBillComponent } from '../manage-bill/manage-bill.component';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';
import { AlertsAndNotificationsService } from '../services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-settle-bill',
  templateUrl: './settle-bill.component.html',
  styleUrls: ['./settle-bill.component.scss']
})
export class SettleBillComponent implements OnInit {
  isNonChargeable:boolean = false;
  complimentaryName:string = '';
  taxableValue: number = 0;
  totalQuantity: any;
  subTotal: any;
  cgst: any;
  sgst: any;
  grandTotal: any;
  totalTaxAmount: number = 0;
  discountValues: any[] = [];
  changeDetection: any;
  constructor(@Inject(DIALOG_DATA) public table: any,private databaseService:DatabaseService,public dataProvider:DataProviderService,private alertify:AlertsAndNotificationsService,private dialog:Dialog) {}
  customerInfoForm:FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('',[Validators.email]),
    phone: new FormControl('',[Validators.pattern('[0-9]{10}')]),
    address:new FormControl('')
  })
  paymentMethod:string = 'cash';
  close: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {
  }
  cancel(){
    this.close.emit();
  }
  manageBill(){
    const inst = this.dialog.open(ManageBillComponent,{data:this.table});
    inst.componentInstance?.cancel.subscribe(()=>{
      inst.close();
    })
    inst.componentInstance?.print.subscribe((modifiedData:any)=>{
      this.databaseService.saveBillModification(this.table.billData,modifiedData).then(()=>{
        this.alertify.presentToast('Bill modified successfully')
        let allKotProducts:any[] = []
        let kotTokens:string[] = []
        modifiedData?.kots.forEach((kot:any) => {
          if (kot.cancelled==false){
            kotTokens.push(kot.tokenNo)
            kot.products.forEach((product: any) => {
              // check if product exists in allKotProducts if not add it or else add quantity
              allKotProducts.find(
                (p) => p.id === product.id
              )
                ? (allKotProducts.find(
                    (p) => p.id === product.id
                  )!.quantity += product.quantity)
                : allKotProducts.push(product);
            });
          }
        });
        this.taxableValue = 0;
        this.totalQuantity = 0;
        this.totalTaxAmount = 0;
        this.subTotal = 0;
        modifiedData?.kots.forEach((kot:any) => {
            if(!kot.cancelled){
              kot.products.forEach((product: any) => {
                console.log("product.quantity",product.quantity)
                this.taxableValue += product.shopPrice * product.quantity;
                this.subTotal += product.shopPrice * product.quantity;
                this.totalQuantity += product.quantity;
              });
            }
        });
        modifiedData.selectDiscounts.forEach((discount:any,index:number) => {
          if (discount.discountType == 'flat') {
            const val = discount.discountValue;
            this.discountValues.push(val);
            this.taxableValue -= val;
          } else if (discount.discountType == 'percentage') {
            const val = (this.taxableValue / 100) * discount.discountValue;
            this.discountValues.push(val);
            this.taxableValue -= val;
            modifiedData.selectDiscounts[index].appliedDiscountValue = Math.floor(val);
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
        const data = {
          "printer":this.dataProvider.currentProject.billPrinter,
          "currentProject":this.dataProvider.currentProject,
          "isNonChargeable":this.isNonChargeable,
          "complimentaryName":this.complimentaryName,
          "customerInfoForm":this.customerInfoForm.value,
          "kotsToken":this.joinByComma(kotTokens),
          "tokenNo":modifiedData!.tokenNo,
          "currentTable":this.table,
          "allProducts":allKotProducts,
          "selectDiscounts":modifiedData.selectDiscounts,
          "specialInstructions":"Modified",
          "totalQuantity":this.totalQuantity,
          "taxableValue":this.subTotal,
          "date":(new Date()).toLocaleDateString('en-GB'),
          "cgst":(this.cgst).toFixed(2),
          "sgst":(this.sgst).toFixed(2),
          "grandTotal":(this.grandTotal).toFixed(2),
          "paymentMethod":this.paymentMethod,
          "id":modifiedData!.id,
          "billNo":modifiedData!.billNo,
        }
        console.log(data)
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
          alert("Error occurredd while printing bill")
        })
      })
    })
  }
  joinByComma(kotTokens?:any[]){
    // console.log("kotTokens",kotTokens)
    if(kotTokens){
      let res = ''
    kotTokens.forEach((token:any)=>{
      res = res + token + ',  '
    })
      return res.slice(0,-1)
    } return ''
  }
  settleBill(){
    if (this.table?.type=='table') {
      this.databaseService.emptyTable(this.table!.id);
      // alert("Clearing table")
    } else {
      this.databaseService.emptyRoom(this.table!.id);
      // alert("Clearing room")
    }
    this.databaseService.settleBill(this.table.billData,this.customerInfoForm.value,this.paymentMethod).then(()=>{
      this.alertify.presentToast('Bill settled successfully')
    }).catch((err)=>{
      this.alertify.presentToast('Error settling bill','error')
    });
    this.close.emit();
  }
}
