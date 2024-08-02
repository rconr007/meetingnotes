import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClientManagementComponent } from './client-management/client-management.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NoteDetailsComponent } from './note-details/note-details.component';
import { CommonModule } from '@angular/common';
import { NotesListComponent } from './notes-list/notes-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    NotesListComponent,
    NoteDetailsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Super Notes';
}
