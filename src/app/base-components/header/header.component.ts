import { trigger, transition, style, animate } from '@angular/animations';
import { Dialog } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { TablesComponent } from 'src/app/tables/tables.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations:[
    trigger('headerAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('.1s', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('.1s', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit {
  openMenu:boolean = false;
  extraSearchClass:string = '';
  placeholders:string[] = [
    "Search Bills",
    "Search Products",
    "Search Customers",
    "Search Users",
    "Search Orders",
    "Search Payments",
    "Search Invoices",
    "Search Vendors"
  ]
  selectedTable:any;
  placeholder:string = this.placeholders[0];
  constructor(public dataProvider:DataProviderService,private dialog:Dialog) { }

  ngOnInit(): void {
    this.dataProvider.tableChanged.subscribe((table:string)=>{
      this.selectedTable = table;
    })
    setInterval(() => {
      this.placeholder = this.placeholders[Math.floor(Math.random() * this.placeholders.length)];
    },1000)
  }

  fireEvent(){
    const event = new CustomEvent('app-notify',{detail:{message:'Hello World'}});
    console.log(event);
    document.dispatchEvent(event);
    console.log("Dispatched event")
  }


  newOrder(){
    const inst = this.dialog.open(TablesComponent)
    inst.componentInstance?.close.subscribe(()=>{
      inst.close()
    })
  }
}
