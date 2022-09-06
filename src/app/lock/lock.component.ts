import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {
  password:string = '';
  constructor() { }

  ngOnInit(): void {
  }
  unlock(){
    if(this.password == '1234'){
      document.dispatchEvent(new Event("app-notify"));
    }
  }
}
