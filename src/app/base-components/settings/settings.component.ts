import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataProviderService } from 'src/app/services/data-provider.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @Output() cancel = new EventEmitter();
  @Output() save = new EventEmitter();
  settingsForm:FormGroup = new FormGroup({
    kotPrinter: new FormControl(this.dataProvider.currentProject.kotPrinter,[Validators.required]),
    billPrinter: new FormControl(this.dataProvider.currentProject.billPrinter,[Validators.required]),
    projectName: new FormControl(this.dataProvider.currentProject.projectName,[Validators.required]),
    phoneNumber: new FormControl(this.dataProvider.currentProject.phoneNumber,[Validators.required]),
    address: new FormControl(this.dataProvider.currentProject.address,[Validators.required]),
    gstNumber: new FormControl(this.dataProvider.currentProject.gstNumber,[Validators.required]),
    fssaiNo: new FormControl(this.dataProvider.currentProject.fssaiNo,[Validators.required]),
    counterNo: new FormControl(this.dataProvider.currentProject.counterNo,[Validators.required]),
    cashierName: new FormControl(this.dataProvider.currentProject.cashierName,[Validators.required]),
    deviceName: new FormControl(this.dataProvider.currentProject.deviceName,[Validators.required]),
  })
  printers:string[] = [
    'printer1',
    'printer2',
    'printer3'
  ]
  categories:any[] = []
  constructor(private dataProvider:DataProviderService,private databaseService:DatabaseService) { }
  cancelSettings(){
    this.cancel.emit()
  }
  
  ngOnInit(): void {
    fetch('http://127.0.0.1:8080/getPrinters',{method:'GET'}).then(res=>res.json()).then(res=>{
      console.log("PRINTERS",res)
      this.printers = res.printers
    })
    if (localStorage.getItem('printerSettings')){
      this.settingsForm.patchValue(JSON.parse(localStorage.getItem('printerSettings')!))
    }
    this.databaseService.getCheckerCategories().then((res:any)=>{
      this.categories = []
      res.forEach((data:any)=>{
        this.categories.push({...data.data(),id:data.id,control:new FormControl(''),checked:false})
      })
      console.log(this.categories);
    })
  }

  setPrinters(){
    
  }

  saveSettings(){
    // filter settings value that are empty
    let settings = Object.keys(this.settingsForm.value).reduce((acc:any,curr:any)=>{
      if (this.settingsForm.value[curr]){
        acc[curr] = this.settingsForm.value[curr]
      }
      return acc
    },{})
    console.log("filtered settings",settings)
    console.log(this.settingsForm.value,this.dataProvider.projects);
    this.dataProvider.allProjects.forEach((project:any,index:number)=>{
      if (project.projectId === this.dataProvider.currentProject.projectId){
        // this.dataProvider.currentProject = project
        console.log({...project,...settings});
        this.dataProvider.allProjects[index] = {...project,...settings}
      }
    })
    // console.log(this.dataProvider.allProjects);
    this.databaseService.updateProject(this.dataProvider.allProjects)
    // this.save.emit(this.settingsForm.value)
  }

}
