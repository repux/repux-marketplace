import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IpfsFile } from 'ipfs-api';
import { Buffer } from 'buffer';
import { readFileAsArrayBuffer } from '../shared/utils/read-file-as-array-buffer';

declare global {
  interface Window {
    IpfsApi: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class IpfsService {
  private ipfs;

  constructor() {
    this.ipfs = new window.IpfsApi(environment.ipfs);
  }

  getInstance(): any {
    return this.ipfs;
  }

  async uploadFile(file: File | Blob): Promise<IpfsFile> {
    const arrayBuffer = await readFileAsArrayBuffer(file);

    return this.upload(Buffer.from(arrayBuffer));
  }

  async upload(buffer: Buffer): Promise<IpfsFile> {
    return new Promise<IpfsFile>((resolve, reject) => {
      this.ipfs.files.add(buffer, (error: string, files: IpfsFile[]) => {
        if (error) {
          return reject(error);
        }

        return resolve(files[ 0 ]);
      });
    });
  }
}
