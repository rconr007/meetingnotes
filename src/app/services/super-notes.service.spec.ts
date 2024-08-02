import { TestBed } from '@angular/core/testing';

import { SuperNotesService } from './super-notes.service';

describe('SuperNotesService', () => {
  let service: SuperNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
