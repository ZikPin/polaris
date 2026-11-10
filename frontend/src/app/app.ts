import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
import { CourseColor } from './core/course-color';
import { Icon } from './core/icon';
import { CourseApi } from './features/courses/course-api';
import { TagApi } from './features/tags/tag-api';
import { TagsDialog } from './features/tags/tags-dialog';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CourseColor, Icon, TagsDialog],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(Auth);
  protected readonly courseApi = inject(CourseApi);
  private readonly tagApi = inject(TagApi);
  private readonly router = inject(Router);

  protected readonly tagsOpen = signal(false);
  protected readonly coursesOpen = signal(true);
  protected readonly menuOpen = signal(false);
  protected readonly menuCourses = computed(() => this.courseApi.all().filter((course) => !course.hidden));

  constructor() {
    // The navigation and the filters list the courses and tags of whoever is logged in.
    effect(() => {
      if (this.auth.user()) {
        this.courseApi.refresh();
        this.tagApi.refresh();
      } else {
        this.courseApi.all.set([]);
        this.tagApi.all.set([]);
        this.tagsOpen.set(false);
      }
    });
  }

  /** Choosing a page closes the menu of the narrow layout. */
  protected closeMenuOnLink(event: Event) {
    if ((event.target as Element).closest('a')) {
      this.menuOpen.set(false);
    }
  }

  protected logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
