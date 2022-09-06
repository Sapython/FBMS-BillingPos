import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillProductCardComponent } from './bill-product-card.component';

describe('BillProductCardComponent', () => {
  let component: BillProductCardComponent;
  let fixture: ComponentFixture<BillProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillProductCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillProductCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
