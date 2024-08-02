import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  getCategoryColor(category: string | undefined): string {
    switch (category) {
      case 'Work':
        return '#ff5555';
      case 'Personal':
        return '#55ff55';
      case 'Ideas':
        return '#5555ff';
      default:
        return '#888888';
    }
  }
}
