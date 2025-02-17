import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './header/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OptionsComponent } from './options/options.component';
import { MatTabsModule } from '@angular/material/tabs';

import {MatAutocompleteModule} from '@angular/material/autocomplete'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { SettingsComponent } from './settings/settings.component'; 
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox'; 

const comps = [HeaderComponent,
  FooterComponent]

@NgModule({
  declarations: [
    comps,
    SidebarComponent,
    OptionsComponent,
    SettingsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    DialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
  ],
  exports:comps
})
export class BaseComponentsModule { }
