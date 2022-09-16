import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectSelectorRoutingModule } from './project-selector-routing.module';
import { ProjectSelectorComponent } from './project-selector.component';


@NgModule({
  declarations: [
    ProjectSelectorComponent
  ],
  imports: [
    CommonModule,
    ProjectSelectorRoutingModule
  ]
})
export class ProjectSelectorModule { }
