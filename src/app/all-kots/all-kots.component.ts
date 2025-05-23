import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { Dialog, DIALOG_DATA } from '@angular/cdk/dialog';
import { DatabaseService } from '../services/database.service';
import { DataProviderService } from '../services/data-provider.service';
import { DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { AlertsAndNotificationsService } from '../services/uiService/alerts-and-notifications.service';
@Component({
  selector: 'app-all-kots',
  templateUrl: './all-kots.component.html',
  styleUrls: ['./all-kots.component.scss'],
})
export class AllKotsComponent implements OnInit {
  @Output() done:EventEmitter<any> = new EventEmitter();
  @Output() editKots:EventEmitter<any> = new EventEmitter();
  @Output() deleteKots:EventEmitter<any> = new EventEmitter();
  @Output() reprint:EventEmitter<any> = new EventEmitter();
  constructor(
    @Inject(DIALOG_DATA) public bill: any,
    private databaseService: DatabaseService,
    private dataProvider: DataProviderService,
    private alertify: AlertsAndNotificationsService
  ) {}
  kots: any[] = [];
  async ngOnInit() {
    console.log('bill', this.bill);
  }

  deleteKot(kot:any){
    this.deleteKots.emit(kot) 
  }
  editKot(kot:any){
    this.editKots.emit(kot)
  }

  reprintKot(kot:any){
    this.reprint.emit(kot)
  }
}
