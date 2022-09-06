import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations:[
    trigger('sidebarAnimation',[
      transition(':leave',[
        animate('0.5s cubic-bezier(0.65, 0, 0.35, 1)',keyframes([
          style({transform:'translateX(0)',offset:0}),
          style({transform:'translateX(-100%)',offset:1})
        ]))
      ]),
      transition(':enter',[
        animate('0.5s cubic-bezier(0.65, 0, 0.35, 1)',keyframes([
          style({transform:'translateX(-100%)',offset:0}),
          style({transform:'translateX(0)',offset:1})
        ]))
      ]),
    ])
  ]
})
export class SidebarComponent implements OnInit {
  @Output() close:EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

}
