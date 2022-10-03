import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Bill } from '../pos/bill/bill.component';
import { DatabaseService } from '../services/database.service';
import { AlertsAndNotificationsService } from '../services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-settle-bill',
  templateUrl: './settle-bill.component.html',
  styleUrls: ['./settle-bill.component.scss']
})
export class SettleBillComponent implements OnInit {

  constructor(@Inject(DIALOG_DATA) public table: any,private databaseService:DatabaseService,private alertify:AlertsAndNotificationsService) { }
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
  settleBill(){
    if (this.table?.type=='table') {
      this.databaseService.emptyTable(this.table!.id);
    } else {
      this.databaseService.emptyRoom(this.table!.id);
    }
    this.databaseService.settleBill(this.table.billData,this.customerInfoForm.value,this.paymentMethod).then(()=>{
      this.alertify.presentToast('Bill settled successfully')
    }).catch((err)=>{
      this.alertify.presentToast('Error settling bill','error')
    });
    this.close.emit();
  }
}
