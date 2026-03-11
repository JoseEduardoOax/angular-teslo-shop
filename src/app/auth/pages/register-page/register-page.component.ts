import { AuthService } from '@/auth/auth.service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  router = inject(Router);

  authService = inject(AuthService);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })

  onSubmit() {
    if (this.registerForm.invalid) {
      this.showError();
      return;
    }

    const { fullName = '', email = '', password = '' } = this.registerForm.value;

    this.authService
      .register(fullName!, email!, password!)
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }

        this.showError();
      })
  }

  private showError() {
    this.hasError.set(true);

    setTimeout(() => {
      this.hasError.set(false);
    }, 2000)
  }
}
