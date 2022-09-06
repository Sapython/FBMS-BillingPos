import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import {
  provideAnalytics,
  getAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import {
  provideRemoteConfig,
  getRemoteConfig,
} from '@angular/fire/remote-config';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { BaseComponentsModule } from './base-components/base-components.module';
import { LockComponent } from './lock/lock.component';
import { DataProviderService } from './services/data-provider.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from './services/database.service';
import { AuthenticationService } from './services/authentication.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertsAndNotificationsService } from './services/uiService/alerts-and-notifications.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SelectProjectComponent } from './modals/select-project/select-project.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TablesComponent } from './tables/tables.component';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [AppComponent, LockComponent, SelectProjectComponent, TablesComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    providePerformance(() => getPerformance()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    BaseComponentsModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatButtonModule
  ],
  providers: [
    ScreenTrackingService,
    UserTrackingService,
    DataProviderService,
    DatabaseService,
    AuthenticationService,
    AlertsAndNotificationsService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
