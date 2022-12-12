import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
})
export class PosComponent implements OnInit {
  selectedCategory: string = '';
  allTables: any[] = [];
  constructor(
    private databaseService: DatabaseService,
    private dataProvider: DataProviderService
  ) {
    // localStorage.setItem('tables',JSON.stringify(this.allTables))
  }
  rooms: any[] = [];
  billStreamSubscription: Subscription = Subscription.EMPTY;
  roomsStreamSubscription: Subscription = Subscription.EMPTY;
  ngOnInit(): void {
    console.log("this.dataProvider.settings",this.dataProvider.settings)
    this.databaseService.setSettings();
    this.databaseService.getTables().subscribe(async (tables)=>{
      this.dataProvider.tables = await Promise.all(tables.map(async(table:any) => {
        table  = {...table.data(),id:table.id}
        if (table.bill){
          const data = await this.databaseService.getBill(table.bill)
          table.billData = data.data();
          return table;
        } else {
          return table;
        }
      }))
      console.log("this.dataProvider.tables",this.dataProvider.tables)
      // sort all tables on table no
      this.dataProvider.tables.sort((a:any,b:any)=>{
        return Number(a.tableNo) - Number(b.tableNo)
      })
    })
    this.databaseService.getRooms().subscribe(async (tables)=>{
      this.dataProvider.rooms = await Promise.all(tables.map(async(table:any) => {
        table  = {...table.data(),id:table.id}
        if (table.bill){
          const data = await this.databaseService.getBill(table.bill)
          table.billData = data.data();
          return table;
        } else {
          return table;
        }
      }))
      console.log("this.dataProvider.tables",this.dataProvider.tables)
      // sort all tables on table no
      this.dataProvider.rooms.sort((a:any,b:any)=>{
        return Number(a.tableNo) - Number(b.tableNo)
      })
    })
  }
}
