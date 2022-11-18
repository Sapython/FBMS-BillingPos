import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cancel-modal',
  templateUrl: './cancel-modal.component.html',
  styleUrls: ['./cancel-modal.component.scss']
})
export class CancelModalComponent implements OnInit {
  @Output() completed:EventEmitter<any> = new EventEmitter<any>();
  constructor() { }
  reason:string = "";
  phoneNumber:string = "";
  step:number = 1;
  type:'unmade' | 'made' = 'unmade';
  ngOnInit(): void {

  }
  close(){
    this.completed.emit(false);
  }
  sendOtp(){
    // generate otp
    fetch("https://ssspay-proxy-server-76zqkqboia-em.a.run.app/messaging/sendSingleSMS",{
      method:'post',
      mode:'cors',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:JSON.stringify({
        phoneNo:'9517457296',
        message:'Test',
        priority:'dnd'
      })
    })
  }
  submitReason(){
    this.completed.emit({
      reason:this.reason,
      phone:this.phoneNumber,
      type:this.type
    });
  }

}
