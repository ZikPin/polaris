import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api-error';
import { Auth } from '../../core/auth';
import { Icon } from '../../core/icon';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, Icon],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly token = inject(ActivatedRoute).snapshot.queryParamMap.get('token') ?? '';

  protected readonly error = signal('');

  protected submit(event: Event, password: string) {
    event.preventDefault();
    this.auth.resetPassword(this.token, password).subscribe({
      next: () => this.router.navigateByUrl('/courses'),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }
}
