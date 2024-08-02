export interface Reminder {
  id: number;
  dateTime: Date;
  text: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  tags: string[];
  category: string | undefined;  // Allow undefined
  images: string[];
  reminders: Reminder[];
}
