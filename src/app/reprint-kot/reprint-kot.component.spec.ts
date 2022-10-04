import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReprintKotComponent } from './reprint-kot.component';

describe('ReprintKotComponent', () => {
  let component: ReprintKotComponent;
  let fixture: ComponentFixture<ReprintKotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReprintKotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReprintKotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
