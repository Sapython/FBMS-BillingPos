import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DataProviderService } from '../services/data-provider.service';

@Component({
  selector: 'app-reprint-kot',
  templateUrl: './reprint-kot.component.html',
  styleUrls: ['./reprint-kot.component.scss']
})
export class ReprintKotComponent implements OnInit {
  @Output() close:EventEmitter<any> = new EventEmitter();
  constructor(@Inject(DIALOG_DATA) public bill: any,private dataProvider:DataProviderService) { }

  ngOnInit(): void {

  }
  print(kot:any){
    const data = {
      "printer": this.dataProvider.currentProject.kotPrinter,
      "currentProject":this.dataProvider.currentProject,
      "tokenNo": kot!.tokenNo,
      "currentTable": this.bill.table,
      "allProducts":kot!.products,
      "mode":"normal",
      "billNo":this.bill.billNo,
    }
    console.log(data)
      fetch('http://127.0.0.1:8080/printKot',{
        method:'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log("Contente",res)
      }).catch((err) => {
        console.log("Error",err)
      })
  }

}
