import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperNotesComponent } from './super-notes.component';

describe('SuperNotesComponent', () => {
  let component: SuperNotesComponent;
  let fixture: ComponentFixture<SuperNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperNotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
