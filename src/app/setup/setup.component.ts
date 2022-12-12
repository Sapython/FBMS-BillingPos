import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { DataProviderService } from '../services/data-provider.service';
import { DatabaseService } from '../services/database.service';
import { AlertsAndNotificationsService } from '../services/uiService/alerts-and-notifications.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class SetupComponent implements OnInit, OnDestroy {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });
  deviceName: FormControl = new FormControl('');
  allowAnalytics: FormControl = new FormControl(true);
  offlineMode: FormControl = new FormControl(true);
  startTutorial: FormControl = new FormControl(true);
  enableNotifications: FormControl = new FormControl(true);
  firstTimeSetup: FormGroup = new FormGroup({
    allowAnalytics: this.allowAnalytics,
    offlineMode: this.offlineMode,
    startTutorial: this.startTutorial,
    enableNotifications: this.enableNotifications,
  });

  secondStepForm: FormGroup = new FormGroup({
    deviceName: this.deviceName,
    address: new FormControl(''),
    phoneNumber: new FormControl(''),
    gstNo: new FormControl(''),
    counterNo: new FormControl(''),
    fssaiNo: new FormControl(''),
    cashierName: new FormControl(''),
  });

  step: number = 1;
  loginStatus:any;
  logoFile: File | undefined = undefined;
  constructor(
    public authService: AuthenticationService,
    public dataProvider: DataProviderService,
    private databaseService: DatabaseService,
    private alertify: AlertsAndNotificationsService,
    private router: Router
  ) {
    // console.log(this.dataProvider.loginEvent)
    this.loginStatus = this.dataProvider.loginEvent;
    this.dataProvider.userChanged.subscribe((data) => {
      // console.log(this.dataProvider.loginEvent)
      this.loginStatus = this.dataProvider.loginEvent;
    })
  }
  setValue(control: string) {
    this.firstTimeSetup.get(control)!.setValue(true);
  }
  login() {
    this.authService
      .signInWithEmailAndPassword(
        this.loginForm.value.email,
        this.loginForm.value.password
      )
      .then((data) => {
        if (data) {
          this.step = 2;
        }
      })
      .catch((error) => {});
  }
  ngOnInit(): void {
    this.dataProvider.currentPage = 'setup';
  }

  ngOnDestroy(): void {
    this.dataProvider.currentPage = '';
  }
  async finishStepTwo() {
    // this.step = 3;
    if (this.secondStepForm.valid) {
      this.dataProvider.pageSetting.blur = true;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          // console.log('position', position);
          this.databaseService
            .continueDeviceSetup(position, this.secondStepForm.value)
            .then((data) => {
              if (data) {
                this.dataProvider.pageSetting.blur = false;
                this.step = 3;
              } else {
                this.alertify.presentToast(
                  'Error setting device details, check your internet and location'
                );
              }
              this.dataProvider.pageSetting.blur = false;
            });
        });
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    } else {
      this.alertify.presentToast('Please fill all the fields');
    }
  }
  finishSetup() {
    this.authService.setSettings()
    this.router.navigate(['']);
  }
}
