import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupComponent } from './setup.component';

const routes: Routes = [{ path: '', component: SetupComponent }, { path: 'projectSelector', loadChildren: () => import('./project-selector/project-selector.module').then(m => m.ProjectSelectorModule) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
