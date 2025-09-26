// role-selection.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-selection',
  templateUrl: './roles-selection.component.html',
  styleUrls: ['./roles-selection.component.scss']
})
export class RoleSelectionComponent {
goToRegister() {
  this.router.navigate(['/register']);
}

  constructor(private router: Router) {}

  selectRole(role: string) {
    localStorage.setItem('userRole', role);
    this.router.navigate(['/login']);
  }
}
