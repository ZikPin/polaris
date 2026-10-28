import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api-error';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly error = signal('');

  protected submit(event: Event, email: string, password: string) {
    event.preventDefault();
    this.auth.register(email, password).subscribe({
      next: () => this.router.navigateByUrl('/courses'),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
