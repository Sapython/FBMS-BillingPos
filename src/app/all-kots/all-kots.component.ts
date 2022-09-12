import { Component, OnInit, Inject } from '@angular/core';
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
  constructor(
    @Inject(DIALOG_DATA) public bill: any,
    private databaseService: DatabaseService,
    private dataProvider: DataProviderService,
    private alertify: AlertsAndNotificationsService
  ) {}
  kots: any[] = [];
  async ngOnInit(): Promise<void> {
    // this.bill.kots.forEach((element:any) => {

    // });
    // console.log('Saptam', this.bill.kots);
    this.dataProvider.pageSetting.blur = true;
    const bill: DocumentSnapshot<DocumentData> = await this.databaseService.getBill(this.bill.id);
    const data = bill.data();
    if (!data) {
      this.alertify.presentToast('No bill found');
      return;
    } else if (data!=undefined) {
      for (const kotId of data['kots']) {
        // console.log('kotId', kotId);
        // console.log('bill', this.bill);
        const data: any = await this.databaseService.getKot(
          kotId.id,
          this.bill.id
        );
        // console.log('KOT: ', data.data(), data);
        this.kots.push({
          kotId: kotId.id,
          kot: data.data(),
        });
      }
      // console.log('kots shivams', this.kots);
      this.dataProvider.pageSetting.blur = false;
    }
  }
}
