import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperNotesService } from '../services/super-notes.service';

@Component({
  selector: 'app-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent {
  protected service = inject(SuperNotesService);
  allTags = this.service.allTags;
  selectedTag = this.service.selectedTag;
  selectedNoteId = this.service.selectedNoteId;
  newTagName: string = '';
  isEditing = false;

  selectTag(tag: string | null) {
    if (!this.isEditing) {
      this.service.selectTag(tag);
    }
  }

  addNewTag() {
    if (this.newTagName.trim()) {
      this.service.addTag(this.newTagName.trim(), this.selectedNoteId());
      this.newTagName = '';
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Deselect the tag when exiting edit mode
      this.service.selectTag(null);
    }
  }

  removeTag(tag: string, event: Event) {
    event.stopPropagation(); // Prevent tag selection when removing
    if (tag !== 'All') {
      this.service.removeTag(tag);
    }
  }

  clearAllTags() {
    if (confirm('Are you sure you want to clear all tags? This action cannot be undone.')) {
      this.service.clearAllTags();
      this.isEditing = false;
    }
  }

  getTagColor(tag: string): string {
    // Implement logic to get color for each tag
    // For now, return a default color
    return '#cccccc';
  }
}
