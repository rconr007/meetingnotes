import { Component, inject } from '@angular/core';
import { SuperNotesService } from './../services/super-notes.service';
import { NoteViewComponent } from '../note-view/note-view.component';
import { NoteEditComponent } from '../note-edit/note-edit.component';
import { Note } from './../models/note.model';

@Component({
  selector: 'app-note-details',
  standalone: true,
  imports: [NoteViewComponent, NoteEditComponent],
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})
export class NoteDetailsComponent {
  private service = inject(SuperNotesService);
  selectedNote = this.service.selectedNote;
  isEditing = this.service.isEditing;

  startEditing() {
    this.service.startEditing();
  }

  saveNote(note: Note) {
    this.service.saveNote(note);
  }

  cancelEditing() {
    this.service.cancelEditing();
  }
}
