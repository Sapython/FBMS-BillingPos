import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllKotsComponent } from './all-kots.component';

describe('AllKotsComponent', () => {
  let component: AllKotsComponent;
  let fixture: ComponentFixture<AllKotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllKotsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllKotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
