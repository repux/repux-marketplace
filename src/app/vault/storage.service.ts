import { Injectable } from '@angular/core';

interface Storage {
  getItem(name: string): string;
  setItem(name: string, value: string): void;
}

@Injectable({
  providedIn: 'root',
  useFactory: StorageServiceFactory
})
export class StorageService {

  constructor(private storage: Storage) {
  }

  getItem(name: string): string {
    return this.storage.getItem(name);
  }

  setItem(name: string, value: string) {
    this.storage.setItem(name, value);
  }
}

export function StorageServiceFactory() {
  return new StorageService(localStorage as Storage);
}
