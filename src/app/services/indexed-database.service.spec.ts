import { TestBed } from '@angular/core/testing';

import { IndexedDatabaseService } from './indexed-database.service';

describe('IndexedDatabaseService', () => {
  let service: IndexedDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndexedDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
