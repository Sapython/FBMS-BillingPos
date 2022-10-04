import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import Fuse from 'fuse.js';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';
import { AlertsAndNotificationsService } from '../services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-manage-bill',
  templateUrl: './manage-bill.component.html',
  styleUrls: ['./manage-bill.component.scss']
})
export class ManageBillComponent implements OnInit {
  @Output() print:EventEmitter<any> = new EventEmitter();
  @Output() cancel:EventEmitter<any> = new EventEmitter();
  discounts: any[] = [];
  selectDiscounts: any[] = [];
  isNonChargeable:boolean = false;
  complimentaryName:string = '';
  filteredOptions:any[] = []
  autocompleteValue:string = '';
  constructor(
    @Inject(DIALOG_DATA) public table: any,
    private databaseService: DatabaseService,
    private dataProvider: DataProviderService,
    private alertify: AlertsAndNotificationsService
  ) {
    this.databaseService.getDiscounts().subscribe((discounts) => {
      this.discounts = discounts;
    });
  }
  kots: any[] = [];
  async ngOnInit() {
    console.log('table', this.table);
  }
  removeItem(kot:any,product:any[]){
    kot.products.splice(kot.products.indexOf(product),1)
  }
  setComplimentary(event:any){
    console.log(event)
    if (event.target.checked){
      let res:any = ''
      while (res==''){
        res = prompt("Enter Name of Complimentary Person")
        console.log('res',res)
      }
      if(res){
        this.complimentaryName = res
        this.table.billData.complimentaryName = res
        console.log('passed')
      } else {
        setTimeout(()=>{
          this.isNonChargeable = false
          this.table.billData.isNonChargeable = false
        },100)
        console.log('failed')
      }
    }
  }

  addProduct(product:any){
    console.log(this.table.billData)
    product.option.value.quantity = 1
    this.table.billData.kots[this.table.billData.kots.length-1].products.push(product.option.value)
  }

  searchProduct(data:any){
    if (data) {
      const options = {
        keys: ['dishName', 'sellingPrice', 'onlinePrice'],
      };
      const fuse = new Fuse(this.dataProvider.products, options); // "list" is the item array
      const result = fuse.search(data);
      this.filteredOptions = [];
      result.forEach((product: any) => {
        this.filteredOptions.push(product.item);
      });
    } else {
      this.filteredOptions = [];
    }
  }

}
