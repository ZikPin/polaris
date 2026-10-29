import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/** Focuses the input and selects its text as soon as it is shown. */
@Directive({ selector: 'input[appFocusSelect]' })
export class FocusSelect {
  constructor() {
    const input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      input.focus();
      input.select();
    });
  }
}
