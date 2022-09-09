import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit {
  selectedCategory:string = '';
  allTables:any[] = []
  constructor(private databaseService:DatabaseService,private dataProvider:DataProviderService) { }
  billStreamSubscription:Subscription = Subscription.EMPTY;
  ngOnInit(): void {
    this.databaseService.getTables().then((data:any) => {
      data.forEach((doc: any) => {
        this.allTables.push({ id: doc.id, ...doc.data() });
      });
      console.log("tables",this.dataProvider.tables,this.allTables);
      this.billStreamSubscription.unsubscribe()
      this.billStreamSubscription = this.databaseService.getBillsStream().subscribe((bills: any) => {
        this.dataProvider.tables = [];
        bills = Array.from(bills);
        this.allTables.forEach((table: any) => {
          const bill: any = bills.filter((bill: any) => bill.table.id == table.id);
          console.log("bill",bill);
          if (bill.length > 0) {
            if (bill.completed == false) {
              this.dataProvider.tables.push({...table,booked:false});
            } else {
              this.dataProvider.tables.push({...table,booked:true});
            }
          } else {
            this.dataProvider.tables.push(table);
          }
        });
        console.log("new tables",this.dataProvider.tables);
        // sort all tables on the basis of tableNo
        this.dataProvider.tables.sort((a: any, b: any) => {
          return a.tableNo - b.tableNo;
        })
      });
    });
  }

}
