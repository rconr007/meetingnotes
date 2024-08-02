import { Component, inject } from '@angular/core';
import { SuperNotesService } from '../services/super-notes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss']
})
export class NotesListComponent {
  protected service = inject(SuperNotesService);

  ngOnInit() {
    console.log('Initial notes:', this.service.notes());
    console.log('Initial filtered notes:', this.service.filteredNotes());
  }

  selectNote(id: number) {
    this.service.selectNote(id);
  }

  createNewNote() {
    this.service.createNewNote();
  }

  updateSearchTerm(term: string) {
    this.service.updateSearchTerm(term);
  }

  getSanitizedContent(content: string): string {
    // Create a temporary element to parse the HTML content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;

    // Extract text content, which automatically removes all HTML tags
    let sanitized = tempElement.textContent || tempElement.innerText || '';

    // Replace HTML line breaks with a special character (e.g., '|')
    sanitized = sanitized.replace(/\n/g, '|');

    // Remove all other whitespace characters
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim leading and trailing whitespace
    sanitized = sanitized.trim();

    // Find the first non-empty content after line breaks
    const firstContentIndex = sanitized.split('|').findIndex(part => part.trim() !== '');
    if (firstContentIndex > -1) {
      sanitized = sanitized.split('|').slice(firstContentIndex).join(' ');
    }

    // Limit to 50 characters
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50) + '...';
    }

    return sanitized;
  }

  getCategoryColor(categoryName: string | undefined): string {
    return this.service.getCategoryColor(categoryName);
  }
}
