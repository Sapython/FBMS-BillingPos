import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { PageSetting } from '../structures/method.structure';
import { UserData } from '../structures/user.structure';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class DataProviderService {
  public projects:any[] = []
  public allProjects:any[] = []
  public pageSetting: PageSetting = {
    blur: false,
    lastRedirect: '',
    message: '',
    spinner: false,
    messageType: 'Error',
  };
  public selectedTable:any;
  public products:any[] = []
  public categories:any[] = []
  public currentProject:any = {}
  public locked:boolean = false;
  public deviceData:any;
  public selectedCategory:Subject<any> = new Subject();
  public selectedProduct:ReplaySubject<any> = new ReplaySubject(1);
  public searchEvent:Subject<string> = new Subject();
  public userChanged:Subject<any> = new Subject();
  public tableChanged:Subject<any> = new Subject();
  public loginEvent:LoginStatus = {loggedIn:false,status:'loading'};
  public userData:UserData | undefined;
  public loggedIn:boolean = false;
  public gettingUserData:boolean = false;
  public userID:string = '';
  public currentPage:string = '';
  public setupComplete:boolean = false;
  public tables:any[] = []
  public rooms:any[] = []
  public allBills:any[] = [];
  public currentTokenNo:number = 0;
  public billNo:number = 0;
  public ncBillNo:number = 0;
  public syncer:Subject<boolean> = new Subject();
  public openTable:Subject<boolean> = new Subject();
  public menuSelected:Subject<any> = new Subject();
  public modeSelected:Subject<'dineIn' | 'room'> = new Subject();
  public openTableFunction :any;
  public kotActive:boolean = false;
  public kotFinalizedActive:boolean = false;
  public clearTableFunc:any;
  public updateTables:Subject<any> = new Subject()
  constructor(){
    setInterval(()=>{
      this.deviceData = JSON.parse(localStorage.getItem('deviceData') || '{}');
    },3000)
  }
}

type LoginStatus = {
  loggedIn: boolean;
  status:'loggedOut' | 'noProjects' | 'withProject' | 'loading' | 'deviceNotRegistered';
  projectId?:string;
  projectName?:string;
  userData?:UserData;
}