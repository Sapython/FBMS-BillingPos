import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm:FormGroup = new FormGroup({
    kotPrinter: new FormControl('',[Validators.required]),
    billPrinter: new FormControl('',[Validators.required]),
  })
  printers:string[] = [
    'printer1',
    'printer2',
    'printer3'
  ]
  constructor() { }

  ngOnInit(): void {
  }

  saveSettings(){
    console.log(this.settingsForm.value);
  }

}
