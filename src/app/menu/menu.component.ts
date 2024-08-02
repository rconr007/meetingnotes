import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  menuItems = [
    { icon: 'description', text: 'All Notes', active: true },
    { icon: 'notifications', text: 'Notifications', active: false },
    { icon: 'settings', text: 'Settings', active: false },
    { icon: 'local_offer', text: 'All Tags', active: false },
    { icon: 'help', text: 'Help & Support', active: false },
    { icon: 'delete', text: 'Trash', active: false },
  ];
}
