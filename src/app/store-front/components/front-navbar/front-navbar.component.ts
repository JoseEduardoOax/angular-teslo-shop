import { AuthService } from '@/auth/auth.service';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'front-navbar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './front-navbar.component.html'
})
export class FrontNavbarComponent {
  authService = inject(AuthService)
}
