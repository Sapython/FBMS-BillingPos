import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @Output() cancel = new EventEmitter();
  @Output() save = new EventEmitter();
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
  cancelSettings(){
    this.cancel.emit()
  }
  
  ngOnInit(): void {
    if (localStorage.getItem('printerSettings')){
      this.settingsForm.patchValue(JSON.parse(localStorage.getItem('printerSettings')!))
    }
  }

  saveSettings(){
    console.log(this.settingsForm.value);
    this.save.emit(this.settingsForm.value)
  }

}
