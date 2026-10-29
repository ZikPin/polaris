import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api-error';
import { Auth } from '../../core/auth';
import { Icon } from '../../core/icon';

@Component({
  selector: 'app-login',
  imports: [RouterLink, Icon],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly error = signal('');

  protected submit(event: Event, email: string, password: string) {
    event.preventDefault();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/courses'),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
