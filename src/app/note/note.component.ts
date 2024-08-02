import { Component, Input, inject } from '@angular/core';
import { SuperNotesService } from './../services/super-notes.service';
import { Note } from './../models/note.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-note',
  standalone: true,
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent {
  @Input() note!: Note;
  @Input() isSelected = false;

  private service = inject(SuperNotesService);
  private sanitizer = inject(DomSanitizer);

  getCategoryColor(categoryName: string | undefined): string {
    return this.service.getCategoryColor(categoryName);
  }

  getSanitizedContent(): string {
    // Create a temporary element to parse the HTML content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = this.note.content;

    // Extract text content, which automatically removes all HTML tags
    let sanitized = tempElement.textContent || tempElement.innerText || '';

    // Replace multiple consecutive spaces and line breaks with a single space
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim leading and trailing whitespace
    sanitized = sanitized.trim();

    // Limit to 50 characters
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50) + '...';
    }

    return sanitized;
  }
}
