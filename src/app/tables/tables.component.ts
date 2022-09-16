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
    // console.log('shivam', this.dataProvider.tables);
  }

  selectRoom(table: any) {
    this.dataProvider.tableChanged.next(table);
    this.close.emit();
  }
  emptyTable(table:any){
    this.databaseService.emptyTable(table.id);
    this.close.emit();
  }
  selectMenu(table:any){
    this.dataProvider.tableChanged.next(table);
    this.close.emit();
  }
}
