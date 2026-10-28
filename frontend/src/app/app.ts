import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
