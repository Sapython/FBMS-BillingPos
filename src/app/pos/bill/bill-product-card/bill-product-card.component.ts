import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-bill-product-card',
  templateUrl: './bill-product-card.component.html',
  styleUrls: ['./bill-product-card.component.scss']
})
export class BillProductCardComponent implements OnInit {
  @Input() product:any;
  @Output() deleted: EventEmitter<any> = new EventEmitter();
  @Output() quantityChanged: EventEmitter<any> = new EventEmitter();
  
  deleting:boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
