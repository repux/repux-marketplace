import { TestBed, inject } from '@angular/core/testing';

import { KeyStoreService } from './key-store.service';

describe('KeyStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ KeyStoreService ]
    });
  });

  it('should be created', inject([ KeyStoreService ], (service: KeyStoreService) => {
    expect(service).toBeTruthy();
  }));
});
