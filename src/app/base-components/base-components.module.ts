import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './header/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
const comps = [HeaderComponent,
  FooterComponent]

@NgModule({
  declarations: [
    comps,
    SidebarComponent
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    DialogModule,
    MatButtonModule,
    MatIconModule
  ],
  exports:comps
})
export class BaseComponentsModule { }
