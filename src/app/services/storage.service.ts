import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage = localStorage;

  getItem(key: string): any {
    const saved = this._storage.getItem(key);

    if (saved) {
      return JSON.parse(saved);
    }

    return null;
  }

  setItem(key: string, value: any): void {
    this._storage.setItem(key, JSON.stringify(value));
  }
}
