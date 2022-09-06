import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectSelectorComponent } from './project-selector.component';

const routes: Routes = [{ path: '', component: ProjectSelectorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectSelectorRoutingModule { }
