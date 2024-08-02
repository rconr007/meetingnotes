import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperNotesService } from '../services/super-notes.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  private service = inject(SuperNotesService);
  categories = this.service.categories;
  selectedCategory = this.service.selectedCategory;
  isEditing = false;

  selectCategory(category: string | null) {
    this.service.selectCategory(category);
  }

  toggleEditCategories() {
    this.isEditing = !this.isEditing;
  }

  addCategory(name: string, color: string) {
    if (this.isValidNewCategory(name, color)) {
      this.service.addCategory(name, color);
    }
  }

  removeCategory(name: string) {
    this.service.removeCategory(name);
  }

  getCategoryColor(categoryName: string): string {
    return this.service.getCategoryColor(categoryName);
  }

  isValidNewCategory(name: string, color: string): boolean {
    return name.trim() !== '' && color !== '#cccccc';
  }

  updateColorPickerBackground(colorPicker: HTMLInputElement) {
    colorPicker.parentElement!.style.backgroundColor = colorPicker.value;
  }

  resetColorPicker(colorPicker: HTMLInputElement) {
    colorPicker.value = '#cccccc';
    colorPicker.parentElement!.style.backgroundColor = '#cccccc';
  }
}
