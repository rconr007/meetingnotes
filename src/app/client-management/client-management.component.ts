import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Note {
  id: number;
  title: string;
  content: string;
  date?: string;
  image?: string;
  details?: {
    dateTime: string;
    actionItems: { text: string; done: boolean }[];
    clientPreferences: string[];
    attachments: { name: string; size: string }[];
  };
}

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.scss']
})
export class ClientManagementComponent {
  notes = signal<Note[]>([
    {
      id: 1,
      title: 'Meeting Notes',
      content: 'Date/Time 4-19 11:00 am<br>Action Items Pha...<br><br>Open listings Spr... +1',
      date: '15 min ago',
      image: 'assets/images/meeting-room.jpg',
      details: {
        dateTime: '4-19 / 11:00 am',
        actionItems: [
          { text: 'Schedule meeting', done: false },
          { text: 'Send walk-through info', done: true }
        ],
        clientPreferences: [
          'Island kitchen', 'High ceilings', 'Near middle school',
          'Tons of natural light', 'Bike-friendly area'
        ],
        attachments: [
          { name: '🎵 meeting-recording.wav', size: '16 MB' },
          { name: '📄 All Listings.pdf', size: '197 KB' }
        ]
      }
    },
    {
      id: 2,
      title: 'Property Listings',
      content: 'A curated selection of available listings, se...',
      date: '2 hr ago',
      image: 'assets/images/modern-house.jpg'
    },
    {
      id: 3,
      title: 'My Tasks',
      content: '• Pick up groceries<br>• Email electrician<br>• Send invoices - Get proof of new logo',
      date: 'Feb 4'
    },
    {
      id: 4,
      title: 'Closing the sale',
      content: 'Paperwork Deed Bill of sale inspection re...<br><br>Min Riley',
      date: 'Jan 11'
    },
    {
      id: 5,
      title: 'Walk-through Procedure',
      content: 'Before each walk-through... 1. Ask buyer to bring contract/paperwork 2. Verify most recent repairs 3. Open/inspect doors...<br><br>Ariel priority',
      date: 'Dec 15, 2020'
    },
    {
      id: 6,
      title: 'Outdoor Living Space',
      content: 'garden home pool',
      date: 'Nov 19, 2020',
      image: 'assets/images/outdoor-living-space.jpg'
    },
    // Add more notes as needed...
  ]);

  selectedNoteId = signal<number | null>(1);
  showNewNoteForm = signal(false);
  newNote = signal<Partial<Note>>({
    title: '',
    content: ''
  });

  selectedNote = computed(() =>
    this.notes().find(note => note.id === this.selectedNoteId())
  );

  selectNote(id: number) {
    this.selectedNoteId.set(id);
  }

  toggleNewNoteForm() {
    this.showNewNoteForm.update(value => !value);
  }

  addNewNote() {
    if (this.newNote().title && this.newNote().content) {
      const newId = Math.max(...this.notes().map(n => n.id)) + 1;
      const noteToAdd: Note = {
        id: newId,
        title: this.newNote().title!,
        content: this.newNote().content!,
        date: new Date().toLocaleString()
      };
      this.notes.update(notes => [noteToAdd, ...notes]);
      this.newNote.set({ title: '', content: '' });
      this.showNewNoteForm.set(false);
      this.selectNote(newId);
    }
  }
}
