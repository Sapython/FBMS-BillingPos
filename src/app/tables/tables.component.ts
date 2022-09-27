import { Component, EventEmitter, OnInit } from '@angular/core';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],
})
export class TablesComponent implements OnInit {
  constructor(
    public dataProvider: DataProviderService,
    public databaseService:DatabaseService
  ) {
    
  }
  close: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {
    console.log('TABLEs',this.dataProvider.tables)
    console.log('ROOMS',this.dataProvider.rooms)

    // console.log('shivam', this.dataProvider.tables);
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
}
