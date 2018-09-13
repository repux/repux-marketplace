import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IpfsFile, IpfsFileContent, IpfsFileHash } from 'ipfs-api';
import { Buffer } from 'buffer';
import { readFileAsArrayBuffer } from '../shared/utils/read-file-as-array-buffer';
import { BlobDownloader } from '../shared/utils/blob-downloader';

const IpfsApi = require('ipfs-api/dist');

@Injectable({
  providedIn: 'root'
})
export class IpfsService {
  private ipfs;
  private blobDownloader: BlobDownloader;

  constructor() {
    this.ipfs = new IpfsApi(environment.ipfs);
    this.blobDownloader = new BlobDownloader();
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

  async downloadAndSave(fileHash: IpfsFileHash, fileName: string): Promise<void> {
    const downloadedFile = await this.download(fileHash);
    const blob = new Blob([ downloadedFile ]);
    this.blobDownloader.downloadBlob(URL.createObjectURL(blob), fileName);
  }

  async download(fileHash: IpfsFileHash): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
      this.ipfs.files.get(fileHash, (error: string, files: IpfsFileContent[]) => {
        if (error) {
          return reject(error);
        }

        return resolve(files[ 0 ].content);
      });
    });
  }
}
