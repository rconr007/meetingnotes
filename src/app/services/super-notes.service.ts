import { Injectable, signal, computed } from '@angular/core';
import { Note } from './../models/note.model';
import { Category } from './../models/category.model';

interface Reminder {
  id: number;
  dateTime: Date;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperNotesService {
  private notesSignal = signal<Note[]>([
    { id: 1, title: 'Welcome to Super Notes', content: 'This is your first note.', date: new Date().toISOString(), tags: ['welcome'], category: 'General', images: [], reminders: [] },
    { id: 2, title: 'Work Tasks', content: 'Complete project proposal', date: new Date().toISOString(), tags: ['work', 'project'], category: 'Work', images: [] , reminders: [] },
    { id: 3, title: 'Shopping List', content: 'Milk, eggs, bread', date: new Date().toISOString(), tags: ['shopping'], category: 'Personal', images: [] , reminders: [] },
    { id: 4, title: 'Book Notes', content: 'Key ideas from chapter 1', date: new Date().toISOString(), tags: ['reading', 'books'], category: 'Learning', images: [] , reminders: [] },
    { id: 5, title: 'Workout Plan', content: 'Monday: Cardio, Tuesday: Strength', date: new Date().toISOString(), tags: ['fitness', 'health'], category: 'Personal', images: [] , reminders: [] },
    { id: 6, title: 'Travel Ideas', content: 'Places to visit: Paris, Tokyo, New York', date: new Date().toISOString(), tags: ['travel'], category: 'Personal', images: [] , reminders: [] },
    { id: 7, title: 'Recipe: Pasta Carbonara', content: 'Ingredients: pasta, eggs, bacon...', date: new Date().toISOString(), tags: ['cooking', 'recipe'], category: 'Personal', images: [] , reminders: [] },
  ]);

  private categoriesSignal = signal<Category[]>([
    { name: 'All Categories', color: '#cccccc' },
    { name: 'General', color: '#ff5555' },
    { name: 'Work', color: '#55ff55' },
    { name: 'Personal', color: '#5555ff' },
    { name: 'Learning', color: '#ffff55' }
  ]);

  private selectedNoteIdSignal = signal<number | null>(null);
  private isEditingSignal = signal(false);
  private searchTermSignal = signal('');
  private selectedTagSignal = signal<string | null>(null);
  private selectedCategorySignal = signal<string | null>(null);
  private globalTagsSignal = signal<string[]>([]);
  private originalNoteSignal = signal<Note | null>(null);
  private remindersSignal = signal<Reminder[]>([]);

  addReminder(noteId: number, dateTime: Date, text: string): number {
    const reminderId = Date.now();
    this.notesSignal.update(notes => notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          reminders: [...(note.reminders || []), { id: reminderId, dateTime, text }]
        };
      }
      return note;
    }));
    this.scheduleReminder(noteId, reminderId, dateTime, text);
    return reminderId;
  }

  removeReminder(noteId: number, reminderId: number) {
    this.notesSignal.update(notes => notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          reminders: (note.reminders || []).filter(r => r.id !== reminderId)
        };
      }
      return note;
    }));
  }

  private scheduleReminder(noteId: number, reminderId: number, dateTime: Date, text: string) {
    const now = new Date();
    const delay = dateTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.showNotification(noteId, text);
        this.removeReminder(noteId, reminderId);
      }, delay);
    }
  }

  private showNotification(noteId: number, text: string) {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Super Notes Reminder', { body: text });
        }
      });
    }
  }

  startEditing() {
    const currentNote = this.selectedNote();
    if (currentNote) {
      // Store a deep copy of the original note
      this.originalNoteSignal.set(JSON.parse(JSON.stringify(currentNote)));
    }
    this.isEditingSignal.set(true);
  }

  cancelEditing() {
    const originalNote = this.originalNoteSignal();
    if (originalNote) {
      // Revert the note to its original state
      this.notesSignal.update(notes =>
        notes.map(note => note.id === originalNote.id ? originalNote : note)
      );
      // Clear the original note
      this.originalNoteSignal.set(null);
    } else {
      // If there's no original note, it means it was a new note
      // Remove the new note from the list
      const currentNote = this.selectedNote();
      if (currentNote) {
        this.notesSignal.update(notes => notes.filter(note => note.id !== currentNote.id));
      }
    }
    this.isEditingSignal.set(false);
    // Optionally, you might want to clear the selected note
    // this.selectedNoteIdSignal.set(null);
  }

  notes = this.notesSignal.asReadonly();
  categories = computed(() =>
    this.categoriesSignal().sort((a, b) => a.name.localeCompare(b.name))
  );
  selectedNoteId = this.selectedNoteIdSignal.asReadonly();
  isEditing = this.isEditingSignal.asReadonly();
  searchTerm = this.searchTermSignal.asReadonly();
  selectedTag = this.selectedTagSignal.asReadonly();
  selectedCategory = this.selectedCategorySignal.asReadonly();

  selectedNote = computed(() =>
    this.notes().find(note => note.id === this.selectedNoteId())
  );

  filteredNotes = computed(() => {
    const filtered = this.notes().filter(note =>
      (this.searchTerm() === '' ||
        note.title.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        note.content.toLowerCase().includes(this.searchTerm().toLowerCase())) &&
      (this.selectedTag() === null || this.selectedTag() === 'All' ||
        note.tags.includes(this.selectedTag()!)) &&
      (this.selectedCategory() === null || this.selectedCategory() === 'All Categories' ||
        note.category === this.selectedCategory())
    );
    console.log('Filtered notes:', filtered);
    console.log('Search term:', this.searchTerm());
    console.log('Selected tag:', this.selectedTag());
    console.log('Selected category:', this.selectedCategory());
    return filtered;
  });

  allTags = computed(() => {
    const noteTags = Array.from(new Set(this.notes().flatMap(note => note.tags)));
    const allTags = new Set([...this.globalTagsSignal(), ...noteTags]);
    return ['All', ...Array.from(allTags).sort((a, b) => a.localeCompare(b))];
  });

  selectNote(id: number) {
    this.selectedNoteIdSignal.set(id);
    this.isEditingSignal.set(false);
  }

  createNewNote() {
    const newId = Math.max(0, ...this.notes().map(n => n.id)) + 1;
    const newNote: Note = {
      id: newId,
      title: 'New Note',
      content: '',
      date: new Date().toISOString(),
      tags: [],
      category: 'General',
      images: [],
      reminders: []  // Initialize reminders as an empty array
    };
    this.notesSignal.update(notes => [newNote, ...notes]);
    this.selectNote(newId);
    this.isEditingSignal.set(true);
  }

  saveNote(note: Note) {
    this.notesSignal.update(notes =>
      notes.map(n => n.id === note.id ? { ...note, date: new Date().toISOString() } : n)
    );
    this.isEditingSignal.set(false);
  }

  removeUnsavedNote(note: Note) {
    this.notesSignal.update(notes => notes.filter(n => n.id !== note.id));
    this.selectedNoteIdSignal.set(null);
  }

  updateSearchTerm(term: string) {
    this.searchTermSignal.set(term);
  }

  selectTag(tag: string | null) {
    this.selectedTagSignal.set(tag);
  }

  selectCategory(category: string | null) {
    this.selectedCategorySignal.set(category);
  }

  getCategoryColor(categoryName: string | undefined): string {
    const category = this.categories().find(c => c.name === categoryName);
    return category ? category.color : 'transparent';
  }

  addCategory(name: string, color: string) {
    if (name && color && !this.categories().some(c => c.name === name)) {
      this.categoriesSignal.update(categories => [...categories, { name, color }]);
    }
  }

  removeCategory(name: string) {
    if (name !== 'All Categories') {
      this.categoriesSignal.update(categories => categories.filter(c => c.name !== name));
      this.notesSignal.update(notes => notes.map(note =>
        note.category === name ? { ...note, category: undefined } : note
      ));
    }
  }

  toggleEditCategories() {
    // Implement this method if needed
  }

  addTag(tag: string, selectedNoteId: number | null = null) {
    if (!this.allTags().includes(tag) && tag !== 'All') {
      if (selectedNoteId !== null) {
        // Add the tag only to the selected note
        this.notesSignal.update(notes =>
          notes.map(note =>
            note.id === selectedNoteId
              ? { ...note, tags: [...note.tags, tag] }
              : note
          )
        );
      } else {
        // If no note is selected, add it to the global tags
        this.globalTagsSignal.update(tags => [...tags, tag]);
      }
    }
  }

  addTagToNote(noteId: number, tag: string) {
    this.notesSignal.update(notes =>
      notes.map(note =>
        note.id === noteId
          ? { ...note, tags: [...new Set([...note.tags, tag])] }
          : note
      )
    );
  }

  removeTagFromNote(noteId: number, tag: string) {
    this.notesSignal.update(notes =>
      notes.map(note =>
        note.id === noteId
          ? { ...note, tags: note.tags.filter(t => t !== tag) }
          : note
      )
    );
  }

  clearAllTags() {
    // Clear global tags
    this.globalTagsSignal.set([]);

    // Remove all tags from notes
    this.notesSignal.update(notes =>
      notes.map(note => ({ ...note, tags: [] }))
    );
  }

  removeTag(tag: string) {
    // Remove from global tags
    this.globalTagsSignal.update(tags => tags.filter(t => t !== tag));

    // Remove from all notes
    this.notesSignal.update(notes =>
      notes.map(note => ({
        ...note,
        tags: note.tags.filter(t => t !== tag)
      }))
    );
  }

  updateNote(updatedNote: Partial<Note> & { id: number }) {
    const index = this.notes().findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
      const updatedNotes = [...this.notes()];
      updatedNotes[index] = {
        ...updatedNotes[index],
        ...updatedNote,
        reminders: updatedNote.reminders || updatedNotes[index].reminders || [],
        category: updatedNote.category || updatedNotes[index].category || undefined
      };
      this.notesSignal.set(updatedNotes);
    }
  }

}
