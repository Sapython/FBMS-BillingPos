import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  items = [
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
    {
      tableNo: 'C34',
      waiterName: 'Sujit',
      id: '#579',
      dishName: 'Caser Salad',
      peopleOdered: 4,
      topping: 'Chix',
      extra: 'Dressing on Slide',
      timeLeft: '6M:47S',
      time: '10:34 PM',
    },
  ]
  kots: any[] = [];
  constructor(private databaseService:DatabaseService,private alertify:AlertsAndNotificationsService) { }
  customers:any[] = []
  cancelledBills:any[] = []
  ngOnInit(): void {
    this.getBills()
    this.getKots()
    this.getCancelledBills()
  }

  getBills(){
    this.databaseService.getCustomers().subscribe((docs)=>{
      this.customers = []
      docs.forEach((doc:any)=>{
        console.log("savedBills",doc.data())
        this.customers.push({...doc.data(),id:doc.id})
      })
    })
  }

  getKots(){
    this.databaseService.getBills().subscribe((docs:any)=>{
      this.kots = []
      docs.forEach((element:any) => {
        this.kots.push({...element.data(),id:element.id})
      });
    })
  }

  getCancelledBills(){
    this.databaseService.getCancelledBills().subscribe((docs)=>{
      this.cancelledBills = []
      docs.forEach((doc:any)=>{
        this.cancelledBills.push({...doc.data(),id:doc.id})
      })
    })
  }

  recover(deletedMenu:any){
    this.databaseService.recoverBill(deletedMenu.id).then(()=>{
      this.alertify.presentToast("Bill Recovered",'info',3000)
      this.getCancelledBills();
      this.getBills();
    })
  }

}
