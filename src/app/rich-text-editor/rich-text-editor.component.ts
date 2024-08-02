import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperNotesService } from '../services/super-notes.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RichTextEditorComponent implements OnInit, AfterViewInit {
  @Input() noteId!: number;
  @Output() contentChange = new EventEmitter<string>();
  @Output() expandChange = new EventEmitter<boolean>();
  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;
  @ViewChild('reminderDialog') reminderDialog!: ElementRef<HTMLDialogElement>;

  private service = inject(SuperNotesService);

  reminderDate: string = '';
  reminderTime: string = '';
  reminderText: string = '';

  private _content = '';
  isExpanded = false;

  @Input() set content(value: string) {
    this._content = value;
    if (this.editorElement?.nativeElement) {
      this.setContent(value);
    }
  }

  get content(): string {
    return this._content;
  }

  activeStyles: Record<string, boolean> = {};
  toggleableStyles = ['bold', 'italic', 'underline', 'strikeThrough'];

  ngOnInit() {
    const style = document.createElement('style');
    style.textContent = `
      .resizable-image-container {
        display: inline-block;
        position: relative;
        max-width: 100%;
      }
      .resizable-image-container .resizer {
        width: 10px;
        height: 10px;
        background-color: #4a90e2;
        position: absolute;
        right: -5px;
        bottom: -5px;
        cursor: se-resize;
        display: none;
      }
      .resizable-image-container.selected {
        outline: 2px solid #4a90e2;
      }
      .resizable-image-container img {
        display: block;
        max-width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);
  }

  ngAfterViewInit() {
    this.setContent(this.content);
    this.editorElement.nativeElement.addEventListener('input', () => this.onContentChange());
    this.editorElement.nativeElement.addEventListener('keyup', () => this.updateActiveStyles());
    this.editorElement.nativeElement.addEventListener('mouseup', () => this.updateActiveStyles());
    this.editorElement.nativeElement.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.editorElement.nativeElement.addEventListener('drop', (e) => this.handleDrop(e));
    this.editorElement.nativeElement.addEventListener('click', (e) => {
      const clickedElement = e.target as Element;
      if (clickedElement instanceof HTMLImageElement) {
        this.makeImagesResizable(clickedElement);
      }
    });
    this.editorElement.nativeElement.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  setContent(content: string) {
    if (this.editorElement.nativeElement.innerHTML !== content) {
      this.editorElement.nativeElement.innerHTML = content;
      this.applyResizableToAllImages();
      this.updateActiveStyles();
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleEnterKey();
    }
  }

  handleEnterKey() {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (range) {
      const currentNode = range.commonAncestorContainer;
      const listItem = this.getListItem(currentNode);

      if (listItem) {
        if (this.isListItemEmpty(listItem)) {
          this.outdentListItem(listItem);
        } else {
          this.insertNewListItem(listItem);
        }
      } else {
        this.insertLineBreak();
      }
    }
    this.onContentChange();
  }

  getListItem(node: Node): HTMLLIElement | null {
    while (node && node !== this.editorElement.nativeElement) {
      if (node.nodeName === 'LI') {
        return node as HTMLLIElement;
      }
      node = node.parentNode!;
    }
    return null;
  }

  isListItemEmpty(listItem: HTMLLIElement): boolean {
    return listItem.textContent?.trim() === '';
  }

  outdentListItem(listItem: HTMLLIElement) {
    const parentList = listItem.parentElement as HTMLUListElement | HTMLOListElement;
    if (parentList.childElementCount === 1) {
      // If this is the only item in the list, replace the list with a paragraph
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      parentList.parentNode!.replaceChild(p, parentList);
      this.setCaretToEnd(p);
    } else {
      // Otherwise, just remove this list item
      const nextSibling = listItem.nextElementSibling;
      parentList.removeChild(listItem);
      if (nextSibling) {
        this.setCaretToStart(nextSibling as HTMLElement);
      } else {
        this.setCaretToEnd(parentList.lastElementChild as HTMLElement);
      }
    }
  }

  insertNewListItem(currentListItem: HTMLLIElement) {
    const newListItem = document.createElement('li');
    newListItem.innerHTML = '<br>';
    currentListItem.parentNode!.insertBefore(newListItem, currentListItem.nextSibling);
    this.setCaretToStart(newListItem);
  }

  insertLineBreak() {
    document.execCommand('insertLineBreak');
  }

  setCaretToEnd(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  setCaretToStart(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  formatText(command: string) {
    document.execCommand(command, false);
    this.editorElement.nativeElement.focus();
    this.onContentChange();
    this.updateActiveStyles();
  }

  insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
    this.editorElement.nativeElement.focus();
    this.onContentChange();
  }

  insertImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        if (range) {
          range.insertNode(img);
          range.setStartAfter(img);
          range.setEndAfter(img);
          selection?.removeAllRanges();
          selection?.addRange(range);
        } else {
          this.editorElement.nativeElement.appendChild(img);
        }

        this.makeImagesResizable(img);
        this.editorElement.nativeElement.focus();
        this.onContentChange();
      };
      reader.readAsDataURL(input.files[0]);
    }
    input.value = '';
  }

  onContentChange() {
    const newContent = this.editorElement.nativeElement.innerHTML;
    if (this._content !== newContent) {
      this._content = newContent;
      this.contentChange.emit(this._content);
      this.updateActiveStyles();
    }
  }

  private updateActiveStyles() {
    const styles = [
      'bold', 'italic', 'underline', 'strikeThrough',
      'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
      'insertUnorderedList', 'insertOrderedList'
    ];

    styles.forEach(style => {
      this.activeStyles[style] = document.queryCommandState(style);
    });
  }

  isStyleActive(style: string): boolean {
    return this.activeStyles[style] || false;
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;
    if (dt) {
      const html = dt.getData('text/html');
      if (html && html.includes('<img')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const img = tempDiv.querySelector('img');
        if (img) {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (range) {
            range.insertNode(img);
            this.makeImagesResizable(img);
            this.onContentChange();
          }
        }
      }
    }
  }

  private applyResizableToAllImages() {
    const images = this.editorElement.nativeElement.querySelectorAll('img');
    images.forEach((img) => {
      this.makeImagesResizable(img);
    });
  }

  private makeImagesResizable(img: Element) {
    if (!(img instanceof HTMLImageElement)) return;

    let container: HTMLElement;
    if (!img.parentElement?.classList.contains('resizable-image-container')) {
      container = document.createElement('div');
      container.className = 'resizable-image-container';
      img.parentNode?.insertBefore(container, img);
      container.appendChild(img);
    } else {
      container = img.parentElement;
    }

    // Remove existing resizers
    container.querySelectorAll('.resizer').forEach(el => el.remove());

    // Remove 'selected' class from all containers
    this.editorElement.nativeElement.querySelectorAll('.resizable-image-container').forEach(el => el.classList.remove('selected'));

    // Add 'selected' class to this container
    container.classList.add('selected');

    const corners = ['se'];  // We'll just use the southeast corner for simplicity
    corners.forEach(corner => {
      const resizer = document.createElement('div');
      resizer.className = `resizer ${corner}`;
      container.appendChild(resizer);
    });

    this.addResizeListeners(container, img);

    // Set initial size
    container.style.width = `${img.width}px`;
    container.style.height = `${img.height}px`;

    // Ensure the image fills the container
    img.style.width = '100%';
    img.style.height = '100%';
  }

  insertTable() {
    const rows = prompt('Enter number of rows:', '3');
    const cols = prompt('Enter number of columns:', '3');

    if (rows && cols) {
      const table = this.createTable(parseInt(rows), parseInt(cols));
      document.execCommand('insertHTML', false, table);
      this.onContentChange();
    }
  }

  private createTable(rows: number, cols: number): string {
    let table = '<table style="border-collapse: collapse; width: 100%;">';
    for (let i = 0; i < rows; i++) {
      table += '<tr>';
      for (let j = 0; j < cols; j++) {
        table += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
      }
      table += '</tr>';
    }
    table += '</table>';
    return table;
  }

  insertRow() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      let cell = range.startContainer;
      while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
        cell = cell.parentNode as Node;
      }
      if (cell) {
        const row = (cell as HTMLTableCellElement).parentNode as HTMLTableRowElement;
        const newRow = row.cloneNode(true) as HTMLTableRowElement;
        Array.from(newRow.cells).forEach(cell => cell.innerHTML = '&nbsp;');
        row.parentNode!.insertBefore(newRow, row.nextSibling);
        this.onContentChange();
      }
    }
  }

  deleteRow() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      let cell = range.startContainer;
      while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
        cell = cell.parentNode as Node;
      }
      if (cell) {
        const row = (cell as HTMLTableCellElement).parentNode as HTMLTableRowElement;
        row.parentNode!.removeChild(row);
        this.onContentChange();
      }
    }
  }

  insertColumn() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      let cell = range.startContainer;
      while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
        cell = cell.parentNode as Node;
      }
      if (cell) {
        const table = (cell as HTMLTableCellElement).closest('table');
        const cellIndex = (cell as HTMLTableCellElement).cellIndex;
        Array.from(table!.rows).forEach(row => {
          const newCell = row.insertCell(cellIndex + 1);
          newCell.innerHTML = '&nbsp;';
          newCell.style.border = '1px solid #ddd';
          newCell.style.padding = '8px';
        });
        this.onContentChange();
      }
    }
  }

  deleteColumn() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const range = selection.getRangeAt(0);
      let cell = range.startContainer;
      while (cell && cell.nodeName !== 'TD' && cell.nodeName !== 'TH') {
        cell = cell.parentNode as Node;
      }
      if (cell) {
        const table = (cell as HTMLTableCellElement).closest('table');
        const cellIndex = (cell as HTMLTableCellElement).cellIndex;
        Array.from(table!.rows).forEach(row => {
          if (row.cells.length > 1) { // Ensure we don't delete the last column
            row.deleteCell(cellIndex);
          }
        });
        this.onContentChange();
      }
    }
  }

  private addResizeListeners(container: HTMLElement, img: HTMLImageElement) {
    let isResizing = false;
    let originalWidth: number;
    let originalHeight: number;
    let originalX: number;
    let originalY: number;
    let originalMouseX: number;
    let originalMouseY: number;
    let aspectRatio: number;

    const resizer = container.querySelector('.resizer') as HTMLElement;

    const startResize = (e: MouseEvent) => {
      isResizing = true;
      originalWidth = container.offsetWidth;
      originalHeight = container.offsetHeight;
      originalX = container.offsetLeft;
      originalY = container.offsetTop;
      originalMouseX = e.pageX;
      originalMouseY = e.pageY;
      aspectRatio = originalWidth / originalHeight;
      e.preventDefault();
    };

    const resize = (e: MouseEvent) => {
      if (!isResizing) return;

      const width = originalWidth + (e.pageX - originalMouseX);
      const height = width / aspectRatio;

      if (width > 30 && height > 30) {  // Minimum size
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
      }
    };

    const stopResize = () => {
      isResizing = false;
      this.onContentChange();
    };

    resizer.addEventListener('mousedown', startResize);
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);

    // Show resizer on hover
    container.addEventListener('mouseover', () => resizer.style.display = 'block');
    container.addEventListener('mouseout', () => {
      if (!isResizing) {
        resizer.style.display = 'none';
      }
    });
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.expandChange.emit(this.isExpanded);
  }

  insertDate() {
    const currentDate = new Date().toLocaleDateString();
    this.insertTextAtCursor(currentDate);
  }

  insertTime() {
    const currentTime = new Date().toLocaleTimeString();
    this.insertTextAtCursor(currentTime);
  }

  insertReminder() {
    this.reminderDialog.nativeElement.showModal();
  }
  setReminder() {
    const reminderDateTime = new Date(`${this.reminderDate}T${this.reminderTime}`);
    const reminderId = this.service.addReminder(this.noteId, reminderDateTime, this.reminderText);

    // const reminderHtml = `<span class="reminder" data-reminder-id="${reminderId}">🔔 Reminder: ${this.reminderText} (${reminderDateTime.toLocaleString()})</span>`;
    // this.insertTextAtCursor(reminderHtml);

    this.closeReminderDialog();
  }

  closeReminderDialog() {
    this.reminderDialog.nativeElement.close();
    this.reminderDate = '';
    this.reminderTime = '';
    this.reminderText = '';
  }

  private insertTextAtCursor(text: string) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      if (text.startsWith('<') && text.endsWith('>')) {
        // If the text appears to be HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        range.insertNode(fragment);
      } else {
        // For plain text
        range.insertNode(document.createTextNode(text));
      }

      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      if (text.startsWith('<') && text.endsWith('>')) {
        // If the text appears to be HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        while (tempDiv.firstChild) {
          this.editorElement.nativeElement.appendChild(tempDiv.firstChild);
        }
      } else {
        // For plain text
        this.editorElement.nativeElement.appendChild(document.createTextNode(text));
      }
    }
    this.onContentChange();
  }

}
