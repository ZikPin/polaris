import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api-error';
import { Auth } from '../../core/auth';
import { Icon } from '../../core/icon';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterLink, Icon],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly auth = inject(Auth);

  protected readonly sent = signal(false);
  protected readonly error = signal('');

  protected submit(event: Event, email: string) {
    event.preventDefault();
    this.auth.forgotPassword(email).subscribe({
      next: () => this.sent.set(true),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
