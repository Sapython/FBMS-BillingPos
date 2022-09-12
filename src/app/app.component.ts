import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthenticationService } from './services/authentication.service';
import { DataProviderService } from './services/data-provider.service';

const appNotify = new Event("app-notify");

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isElectron:boolean = false
  routepath:string = window.location.pathname.split('/')[(window.location.pathname.split('/')).length-1];
  
  notAllowedPages:string[] = ['projectSelector','setup']
  constructor(public dataProvider:DataProviderService,public authService:AuthenticationService,private router:Router){
    this.router.events.subscribe((val) => {
      this.routepath = window.location.pathname.split('/')[(window.location.pathname.split('/')).length-1]
      // console.log("routepath",this.routepath)
    })
  }
  title = 'FBMS-BillingPos';
  notify(){
    document.dispatchEvent(appNotify);
  }
}
