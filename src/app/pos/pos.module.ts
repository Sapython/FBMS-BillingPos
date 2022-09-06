import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosRoutingModule } from './pos-routing.module';
import { PosComponent } from './pos.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsComponent } from './products/products.component';
import { BillComponent } from './bill/bill.component';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button'; 
import {MatTabsModule} from '@angular/material/tabs'; 
import {MatButtonToggleModule} from '@angular/material/button-toggle'; 
import {MatIconModule} from '@angular/material/icon';
import { BillProductCardComponent } from './bill/bill-product-card/bill-product-card.component';
import { OptionsComponent } from './options/options.component'; 
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { RoomsComponent } from './rooms/rooms.component'; 

@NgModule({
  declarations: [
    PosComponent,
    CategoriesComponent,
    ProductsComponent,
    BillComponent,
    BillProductCardComponent,
    OptionsComponent,
    RoomsComponent,
  ],
  imports: [
    CommonModule,
    PosRoutingModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class PosModule { }
