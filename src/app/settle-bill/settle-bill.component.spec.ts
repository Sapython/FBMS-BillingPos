import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettleBillComponent } from './settle-bill.component';

describe('SettleBillComponent', () => {
  let component: SettleBillComponent;
  let fixture: ComponentFixture<SettleBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettleBillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettleBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
