import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { SuperNotesService } from '../services/super-notes.service';
import { Note } from '../models/note.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'app-note-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RichTextEditorComponent],
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent {
  @Input() note!: Note;
  @Output() closeNoteEvent = new EventEmitter<void>();
  isEditorExpanded = false;

  private service = inject(SuperNotesService);

  onEditorExpandChange(expanded: boolean) {
    this.isEditorExpanded = expanded;
  }

  categories = this.service.categories;
  availableTags = this.service.allTags;
  newTagName: string = '';
  isCategoryDropdownOpen = false;

  getCategoryColor(categoryName: string | undefined): string {
    return this.service.getCategoryColor(categoryName);
  }

  toggleCategoryDropdown() {
    this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
  }

  selectCategory(categoryName: string | undefined) {
    this.note.category = categoryName === 'No Category' ? undefined : categoryName;
    this.isCategoryDropdownOpen = false;
  }

  onTitleChange(newTitle: string) {
    this.note.title = newTitle;
    // Assuming you have a method to update the note in your service
    this.service.updateNote(this.note);
  }

  addImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.note.images.push(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeImage(index: number) {
    this.note.images.splice(index, 1);
  }

  toggleTag(tag: string) {
    if (tag === 'All') {
      if (this.note.tags.length === this.availableTags().filter(t => t !== 'All').length) {
        this.note.tags = [];
      } else {
        this.note.tags = this.availableTags().filter(t => t !== 'All');
      }
    } else {
      const index = this.note.tags.indexOf(tag);
      if (index > -1) {
        this.note.tags.splice(index, 1);
      } else {
        this.note.tags.push(tag);
      }
    }
  }

  addNewTag() {
    if (this.newTagName && !this.availableTags().includes(this.newTagName)) {
      this.service.addTag(this.newTagName);
      this.note.tags.push(this.newTagName);
      this.newTagName = '';
    }
  }

  removeTag(tag: string) {
    this.note.tags = this.note.tags.filter(t => t !== tag);
  }

  isAllTagsSelected(): boolean {
    return this.note.tags.length === this.availableTags().filter(tag => tag !== 'All').length;
  }

  onContentChange(newContent: string) {
    this.note.content = newContent;
  }

  onImageInserted(imageUrl: string) {
    if (!this.note.images.includes(imageUrl)) {
      this.note.images.push(imageUrl);
    }
  }

  onImageInsertedWrapper(event: Event) {
    const imageUrl = (event.target as any).value; // Adjust based on event structure
    this.onImageInserted(imageUrl);
  }

  closeNote() {
    // If it's a new note that hasn't been saved yet, remove it
    if (this.note.id === undefined) {
      this.service.removeUnsavedNote(this.note);
    }
    // Emit an event to close the note edit view
    this.closeNoteEvent.emit();
  }
  removeReminder(reminderId: number) {
    this.service.removeReminder(this.note.id, reminderId);
  }

  openReminderDialog() {
    // Implement this method to open a dialog for adding a new reminder
    // You can reuse the existing reminder dialog or create a new one
  }
}
