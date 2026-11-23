import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
import { CourseColor } from './core/course-color';
import { Icon } from './core/icon';
import { NamesDialog } from './core/names-dialog';
import { CourseApi } from './features/courses/course-api';
import { TableTypeApi } from './features/table/table-api';
import { TagApi } from './features/tags/tag-api';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CourseColor, Icon, NamesDialog],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(Auth);
  protected readonly courseApi = inject(CourseApi);
  protected readonly tagApi = inject(TagApi);
  protected readonly tableTypeApi = inject(TableTypeApi);
  private readonly router = inject(Router);

  protected readonly tagsOpen = signal(false);
  protected readonly tablesOpen = signal(false);
  protected readonly coursesOpen = signal(true);
  protected readonly menuOpen = signal(false);
  protected readonly menuCourses = computed(() => this.courseApi.all().filter((course) => !course.hidden));

  constructor() {
    // The navigation and the filters list the courses, tags and table types of whoever is logged in.
    effect(() => {
      if (this.auth.user()) {
        this.courseApi.refresh();
        this.tagApi.refresh();
        this.tableTypeApi.refresh();
      } else {
        this.courseApi.all.set([]);
        this.tagApi.all.set([]);
        this.tableTypeApi.all.set([]);
        this.tagsOpen.set(false);
        this.tablesOpen.set(false);
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
