// role-selection.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-roles-selection',
  templateUrl: './roles-selection.component.html',
  styleUrls: ['./roles-selection.component.scss'],
  imports: [MatIcon]
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
