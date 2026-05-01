import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'StartUp';

  constructor(private storageService: StorageService) {}

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {

    if (event.key === 'workmapDB_notify' && event.newValue) {

      const scope = event.newValue.split('_')[0];

      if (scope) {
        this.storageService.notifyChange(scope);
      }
    }
  }
}
