import { Injectable } from '@angular/core';
import { NamedApi } from '../../core/named-api';

export interface Tag {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class TagApi extends NamedApi<Tag> {
  constructor() {
    super('/api/tag', 'value');
  }
}
