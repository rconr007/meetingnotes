import { Component, Input, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Note } from '../models/note.model';
import { SuperNotesService } from '../services/super-notes.service';

@Component({
  selector: 'app-note-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-view.component.html',
  styleUrls: ['./note-view.component.scss']
})
export class NoteViewComponent implements AfterViewInit {
  @Input() note!: Note;
  @ViewChild('noteContent') noteContent!: ElementRef;
  @ViewChild('content') content!: ElementRef;

  private service = inject(SuperNotesService);
  private sanitizer = inject(DomSanitizer);

  getCategoryColor(categoryName: string): string {
    return this.service.getCategoryColor(categoryName);
  }

  getSafeHtml(content: string): SafeHtml {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.querySelectorAll('.resizable-image-container').forEach(container => {
      container.classList.remove('selected');
    });
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkScrollability();
    }, 0);
  }

  private checkScrollability() {
    const contentElement = this.content.nativeElement;
    const noteContentElement = this.noteContent.nativeElement;

    console.log('Content height:', contentElement.offsetHeight);
    console.log('Note content height:', noteContentElement.offsetHeight);
    console.log('Note content scroll height:', noteContentElement.scrollHeight);

    if (noteContentElement.scrollHeight > noteContentElement.offsetHeight) {
      console.log('Content is scrollable');
    } else {
      console.log('Content is not scrollable');
    }
  }
}
