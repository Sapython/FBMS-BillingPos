import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-info-modal',
  templateUrl: './customer-info-modal.component.html',
  styleUrls: ['./customer-info-modal.component.scss']
})
export class CustomerInfoModalComponent implements OnInit {
  done:EventEmitter<any> = new EventEmitter();
  constructor() { }
  customerInfoForm:FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('',[Validators.email]),
    phone: new FormControl('',[Validators.pattern('[0-9]{10}')]),
    address:new FormControl('')
  })

  ngOnInit(): void {}
  submit(){
    this.done.emit(this.customerInfoForm.value);
  }
  cancel(){
    this.done.emit(null);
  }
}
