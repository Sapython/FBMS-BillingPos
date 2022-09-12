import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataProviderService } from '../services/data-provider.service';
import { SetupComponent } from '../setup/setup.component';

@Component({
  selector: 'app-project-selector',
  templateUrl: './project-selector.component.html',
  styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit {

  constructor(public dataProvider:DataProviderService,private router:Router,private dialog:MatDialog ) {}

  ngOnInit(): void {
    if (this.dataProvider.projects.length == 0){
      // console.log('no projects');
      this.router.navigate(['../setup']);
    }
    // this.dialog.open(ProjectSelectorComponent)
  }

}
