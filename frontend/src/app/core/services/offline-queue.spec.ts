import { TestBed } from '@angular/core/testing';

import { OfflineQueue } from './offline-queue';

describe('OfflineQueue', () => {
  let service: OfflineQueue;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineQueue);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
