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
    // this.databaseService.getRooms().subscribe((rooms:any)=>{
    //   this.rooms = []
    //   rooms.forEach((room:any)=>{
    //     this.rooms.push(room.data())
    //   })
    //   // this.dataProvider.rooms = this.rooms
    //   console.log('rooms',this.rooms)
    //   // localStorage.setItem('tables',JSON.stringify(this.allTables))
    //   // this.dataProvider.rooms = [];
    //     this.rooms.forEach((table: any) => {
    //       const bill: any = rooms.filter((bill: any) => bill.table.id == table.id);
    //       if (bill.length > 0) {
    //         if (bill.completed == false) {
    //           this.dataProvider.rooms.push({...table,booked:false});
    //         } else {
    //           this.dataProvider.rooms.push({...table,booked:true});
    //         }
    //       } else {
    //         this.dataProvider.rooms.push(table);
    //       }
    //     });
    //     // console.log("new tables",this.dataProvider.tables);
    //   //   // sort all tables on the basis of tableNo
    //   //   this.dataProvider.tables.sort((a: any, b: any) => {
    //   //     return a.tableNo - b.tableNo;
    //   //   })
    // })
    this.databaseService.getTables().subscribe((data: any) => {
      this.allTables = [];
      data.forEach((doc: any) => {
        this.allTables.push({ id: doc.id, ...doc.data() });
      });
      // localStorage.setItem('tables',JSON.stringify(this.allTables))
      // console.log("tables",this.dataProvider.tables,this.allTables);
      this.roomsStreamSubscription.unsubscribe();
      this.roomsStreamSubscription = this.databaseService.getRooms().subscribe((rooms: any) => {
        this.rooms = [];
        rooms.forEach((room: any) => {
          this.rooms.push({...room.data(),id:room.id});
        });
        this.billStreamSubscription.unsubscribe();
        this.billStreamSubscription = this.databaseService
          .getBillsStream()
          .subscribe((bills: any) => {
            this.dataProvider.tables = [];
            this.dataProvider.rooms = [];
            bills = Array.from(bills);
            this.rooms.forEach((table: any) => {
              const bill: any = bills.filter((bill: any) => bill.table.id == table.id);
              if (bill.length > 0) {
                if (bill[0].completed == false) {
                  this.dataProvider.rooms.push({ ...table, booked: false, status:table.status || 'occupied',type:'room' });
                } else {
                  this.dataProvider.rooms.push({ ...table, booked: true, status:table.status || 'occupied',type:'room' });
                }
              } else {
                this.dataProvider.rooms.push({...table, status:table.status || 'available',type:'room'});
              }
            })
            this.allTables.forEach((table: any) => {
              const bill: any = bills.filter(
                (bill: any) => bill.table.id == table.id
              );
              // // console.log("bill",bill);
              if (bill.length > 0) {
                if (bill.completed == false) {
                  this.dataProvider.tables.push({ ...table, booked: false,type:'table' });
                } else {
                  this.dataProvider.tables.push({ ...table, booked: true,type:'table' });
                }
              } else {
                this.dataProvider.tables.push({...table,type:'table'});
              }
            });
            // console.log("new tables",this.dataProvider.tables);
            // sort all tables on the basis of tableNo
            this.dataProvider.tables.sort((a: any, b: any) => {
              return a.tableNo - b.tableNo;
            });
          });
      });
    });
  }
}
