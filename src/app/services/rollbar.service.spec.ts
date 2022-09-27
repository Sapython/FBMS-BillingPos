import { TestBed } from '@angular/core/testing';

import { RollbarService } from './rollbar.service';

describe('RollbarService', () => {
  let service: RollbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RollbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
