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
    public dataProvider: DataProviderService
  ) {
    
  }
  close: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {}

  selectRoom(table: any) {
    this.dataProvider.tableChanged.next(table);
    this.close.emit();
  }
}
