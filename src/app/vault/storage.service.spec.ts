import { TestBed, inject } from '@angular/core/testing';

import { StorageService, StorageServiceFactory } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {
        provide: StorageService,
        useFactory: StorageServiceFactory
      } ]
    });
  });

  it('should be created', inject([ StorageService ], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));
});
