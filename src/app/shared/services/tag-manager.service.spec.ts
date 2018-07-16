import { TestBed, inject } from '@angular/core/testing';

import { TagManagerService } from './tag-manager.service';

describe('TagManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TagManagerService]
    });
  });

  it('should be created', inject([TagManagerService], (service: TagManagerService) => {
    expect(service).toBeTruthy();
  }));
});
