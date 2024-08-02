import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  images: string[];
  tags: string[];
  category?: string;
}

interface Category {
  name: string;
  color: string;
}

@Component({
  selector: 'app-super-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-notes.component.html',
  styleUrls: ['./super-notes.component.scss']
})
export class SuperNotesComponent {
  notes = signal<Note[]>([
    { id: 1, title: 'Welcome to Super Notes', content: 'Super Notes is an easy way to take notes, create to-do lists, and organize your thoughts. This note will guide you through the basic features of the app.', date: '2023-04-19', images: [], tags: ['welcome', 'tutorial'], category: 'Work' },
    { id: 2, title: 'Organizing with Tags', content: 'Tags work a bit like folders, except there\'s no limit to how many you can add to a note. Use them to categorize and easily find related notes later.', date: '2023-04-18', images: [], tags: ['organization', 'tips'], category: 'Personal' },
    { id: 3, title: 'Project Brainstorm: AI Assistant', content: 'Ideas for new AI assistant project:\n- Natural language processing\n- Machine learning algorithms\n- User-friendly interface\n- Integration with existing systems\n- Privacy and security measures', date: '2023-05-02', images: [], tags: ['project', 'AI', 'brainstorm'], category: 'Work' },
    { id: 4, title: 'Grocery List', content: '- Milk\n- Eggs\n- Bread\n- Apples\n- Chicken\n- Pasta\n- Tomato sauce\n- Cheese', date: '2023-05-10', images: [], tags: ['shopping', 'personal'], category: 'Personal' },
    { id: 5, title: 'Book Notes: "The Innovator\'s Dilemma"', content: 'Key takeaways:\n1. Disruptive innovation\n2. Sustaining vs. disruptive technologies\n3. The role of market demand\n4. Why large companies often fail to innovate\n5. The importance of creating separate divisions for disruptive projects', date: '2023-05-15', images: [], tags: ['book', 'innovation', 'business'], category: 'Learning' },
    { id: 6, title: 'Workout Routine', content: 'Monday: Chest and Triceps\n- Bench Press: 3x8\n- Incline Dumbbell Press: 3x10\n- Tricep Pushdowns: 3x12\n\nWednesday: Back and Biceps\n- Deadlifts: 3x5\n- Pull-ups: 3x8\n- Barbell Curls: 3x10\n\nFriday: Legs and Shoulders\n- Squats: 3x8\n- Leg Press: 3x12\n- Shoulder Press: 3x10', date: '2023-05-20', images: [], tags: ['fitness', 'health'], category: 'Personal' }
  ]);

  categories = signal<Category[]>([
    { name: 'Work', color: '#ff5555' },
    { name: 'Personal', color: '#55ff55' },
    { name: 'Ideas', color: '#5555ff' },
  ]);

    // Add this new method
  getCategoryColor(categoryName: string | undefined): string {
    if (!categoryName) return 'transparent';
    const category = this.categories().find(c => c.name === categoryName);
    return category ? category.color : 'transparent';
  }

  selectedNoteId = signal<number | null>(null);
  isEditing = signal(false);
  searchTerm = signal('');
  selectedTag = signal<string | null>(null);
  selectedCategory = signal<string | null>(null);
  isEditingCategories = signal(false);

  selectedNote = computed(() =>
    this.notes().find(note => note.id === this.selectedNoteId())
  );

  filteredNotes = computed(() =>
    this.notes().filter(note =>
      (this.searchTerm() === '' || note.title.toLowerCase().includes(this.searchTerm().toLowerCase()) || note.content.toLowerCase().includes(this.searchTerm().toLowerCase())) &&
      (this.selectedTag() === null || note.tags.includes(this.selectedTag()!)) &&
      (this.selectedCategory() === null || note.category === this.selectedCategory())
    )
  );

  allTags = computed(() =>
    Array.from(new Set(this.notes().flatMap(note => note.tags)))
  );

  selectNote(id: number) {
    this.selectedNoteId.set(id);
    this.isEditing.set(false);
  }

  createNewNote() {
    const newId = Math.max(0, ...this.notes().map(n => n.id)) + 1;
    const newNote: Note = {
      id: newId,
      title: 'New Note',
      content: '',
      date: new Date().toISOString().split('T')[0],
      images: [],
      tags: []
    };
    this.notes.update(notes => [newNote, ...notes]);
    this.selectNote(newId);
    this.isEditing.set(true);
  }

  saveNote(note: Note) {
    this.notes.update(notes =>
      notes.map(n => n.id === note.id ? { ...note, date: new Date().toISOString().split('T')[0] } : n)
    );
    this.isEditing.set(false);
  }

  startEditing() {
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
  }

  updateSearchTerm(term: string) {
    this.searchTerm.set(term);
  }

  addImage(note: Note, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        note.images.push(e.target.result);
        this.saveNote(note);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeImage(note: Note, index: number) {
    note.images.splice(index, 1);
    this.saveNote(note);
  }

  addTag(note: Note, tag: string) {
    if (tag && !note.tags.includes(tag)) {
      note.tags.push(tag);
      this.saveNote(note);
    }
  }

  removeTag(note: Note, tag: string) {
    note.tags = note.tags.filter(t => t !== tag);
    this.saveNote(note);
  }

  selectTag(tag: string | null) {
    this.selectedTag.set(tag);
  }

  selectCategory(category: string | null) {
    this.selectedCategory.set(category);
  }

  addCategory(name: string, color: string) {
    if (name && color && !this.categories().some(c => c.name === name)) {
      this.categories.update(categories => [...categories, { name, color }]);
    }
  }

  removeCategory(name: string) {
    this.categories.update(categories => categories.filter(c => c.name !== name));
    this.notes.update(notes => notes.map(note => note.category === name ? { ...note, category: undefined } : note));
  }

  toggleEditCategories() {
    this.isEditingCategories.update(value => !value);
  }
}
