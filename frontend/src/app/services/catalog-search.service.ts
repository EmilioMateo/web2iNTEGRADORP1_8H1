import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogSearchService {
  searchTerm = signal('');

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }
}
