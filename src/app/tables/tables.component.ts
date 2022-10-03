import { Dialog } from '@angular/cdk/dialog';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';
import { SettleBillComponent } from '../settle-bill/settle-bill.component';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit {
  constructor(
    public dataProvider: DataProviderService,
    public databaseService:DatabaseService,
    private dialog:Dialog
  ) {}
  close: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {
    this.getTableBills()
    this.databaseService.getTables().subscribe(()=>{
      alert("tables changed")
      this.getTableBills()
    })
    this.dataProvider.tableChanged.subscribe((tables) => {
      alert("tables changed in")
      this.getTableBills()
    })
  }
  async getTableBills(){
    this.dataProvider.tables = await Promise.all(this.dataProvider.tables.map(async(table) => {
      if (table.status == 'occupied'){
        const data = await this.databaseService.getBill(table.bill)
        table.billData = data.data();
        return table;
      } else {
        return table;
      }
    }))
    console.log("this.dataProvider.tables",this.dataProvider.tables)
  }

  selectRoom(table: any) {
    if(table.type=='room'){
      this.dataProvider.modeSelected.next('room');
    } else {
      this.dataProvider.modeSelected.next('dineIn');
    }
    this.dataProvider.tableChanged.next(table);
    this.close.emit();
  }
  emptyTable(table:any){
    if(table.status=='occupied'){
      alert('Please either finalize bill or cancel order to empty table')
      return
    }
    if(table.type=='room'){  
      this.databaseService.emptyRoom(table.id);
    } else {
      this.databaseService.emptyTable(table.id);
    }
  }
  selectMenu(table:any){
    if(table.type=='room'){
      this.dataProvider.modeSelected.next('room');
    } else {
      this.dataProvider.modeSelected.next('dineIn');
    }
    this.dataProvider.tableChanged.next(table);
    this.close.emit();
  }

  settleTable(table:any){
    const inst = this.dialog.open(SettleBillComponent,{
      data:table
    })
    inst.componentInstance?.close.subscribe(()=>{
      inst.close();
    })
    
  }
}
