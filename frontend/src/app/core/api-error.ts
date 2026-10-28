import { HttpErrorResponse } from '@angular/common/http';

/** The message of an API error response (format: see ARCHITECTURE.md), or a generic one. */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.error?.error) {
    const fields: Record<string, string[]> = error.error.fields ?? {};
    const details = Object.entries(fields)
      .map(([field, messages]) => `${field}: ${messages.join(' ')}`)
      .join('; ');
    return details ? `${error.error.error} (${details})` : error.error.error;
  }
  return 'Something went wrong.';
}
