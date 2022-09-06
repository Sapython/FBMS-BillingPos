import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

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
  constructor(private databaseService:DatabaseService) { }
  savedBills:any[] = []
  ngOnInit(): void {
    this.databaseService.getBills().then((docs)=>{
      docs.forEach((doc:any)=>{
        console.log("savedBills",doc.data())
        this.savedBills.push({...doc.data(),id:doc.id})
      })
    })
    this.databaseService.getKots().then((docs:any)=>{
      docs.forEach((element:any) => {
        this.kots.push({...element.data(),id:element.id})
      });
    })
  }

}
