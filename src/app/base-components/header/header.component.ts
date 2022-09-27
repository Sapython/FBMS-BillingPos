import { trigger, transition, style, animate } from '@angular/animations';
import { Dialog } from '@angular/cdk/dialog';
import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { AlertsAndNotificationsService } from 'src/app/services/uiService/alerts-and-notifications.service';
import { TablesComponent } from 'src/app/tables/tables.component';
import { OptionsComponent } from '../options/options.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('headerAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('.1s', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [
        animate('.1s', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit {
  @ViewChild('search') searchInput!: ElementRef;
  openMenu: boolean = false;
  extraSearchClass: string = '';
  placeholders: string[] = [
    'Search Bills',
    'Search Products',
    'Search Customers',
    'Search Users',
    'Search Orders',
    'Search Payments',
    'Search Invoices',
    'Search Vendors',
  ];
  selectedTable: any;
  placeholder: string = this.placeholders[0];
  constructor(
    public dataProvider: DataProviderService,
    private dialog: Dialog,
    private alertify: AlertsAndNotificationsService,
    public authService: AuthenticationService
  ) {}
  syncing: boolean = false;
  tableInst: any;
  allInst: any[] = [];
  ngOnInit(): void {
    this.dataProvider.openTableFunction = this.newOrder.bind(this);
    this.dataProvider.openTable.subscribe((data) => {
      this.newOrder();
      console.log('Open Table', data);
    });
    this.dataProvider.syncer.subscribe((data) => {
      this.syncing = data;
    });
    this.dataProvider.tableChanged.subscribe((table: string) => {
      this.selectedTable = table;
      this.dataProvider.selectedTable = table;
      // alert(table)
    });
    this.dataProvider.menuSelected.subscribe((data) => {
      this.selectedTable = data;
    });
    setInterval(() => {
      this.placeholder =
        this.placeholders[Math.floor(Math.random() * this.placeholders.length)];
    }, 1000);
  }

  fireEvent() {
    const event = new CustomEvent('app-notify', {
      detail: { message: 'Hello World' },
    });
    // console.log(event);
    document.dispatchEvent(event);
    // console.log("Dispatched event")
  }

  newOrder() {
    // alert(this.dataProvider.kotActive)
    if (this.dataProvider.kotActive) {
      if(confirm('ALERT! You have NOT finalized your KOT.Do you want to delete selected items ?')){
      // if(confirm('ALERT! Do you want to delete selected items ?')){
      if (!this.dataProvider.kotFinalizedActive){
        this.dataProvider.clearTableFunc();
      }  
        this.closeTableModal();
        const inst = this.dialog.open(TablesComponent, { disableClose: true });
        inst.disableClose = true;
        this.allInst.push(inst);
        inst.componentInstance?.close.subscribe(() => {
          // inst.close()
          this.closeTableModal();
        });
        // inst.backdropClick.subscribe(() => {
        //   this.closeTableModal();
        // });  
      }
      return
    } else {
      this.closeTableModal();
      const inst = this.dialog.open(TablesComponent, { disableClose: true });
      inst.disableClose = true;
      this.allInst.push(inst);
      inst.componentInstance?.close.subscribe(() => {
        // inst.close()
        this.closeTableModal();
      });
      // inst.backdropClick.subscribe(() => {
      //   this.closeTableModal();
      // });
    }
  }

  openOptions() {
    this.dialog.open(OptionsComponent);
  }

  closeTableModal() {
    this.allInst.forEach((inst) => {
      inst.close();
    });
  }

  noTablesAlert() {
    this.alertify.presentToast(
      'No tables found. Please select a table to search.',
      'error'
    );
  }
  // ctrl + s
  @HostListener('document:keydown.control.s', ['$event'])
  save(event: KeyboardEvent) {
    event.preventDefault();
    this.searchInput.nativeElement.focus();
  }

  @HostListener('document:keydown.control.t', ['$event'])
  showTable(event: KeyboardEvent) {
    event.preventDefault();
    this.newOrder();
  }
  changeBillerMode(event: any) {
    console.log('Change Biller Mode', event);
    this.dataProvider.openTableFunction();
    this.dataProvider.modeSelected.next(event.value);
  }
}
