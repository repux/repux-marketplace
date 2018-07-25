import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EulaType } from 'repux-lib';
import { FormControl, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { BlobDownloader } from '../../shared/utils/blob-downloader';
import { FileName } from '../../shared/utils/file-name';

export interface EulaSelection {
  type: EulaType;
  file: File;
}

export async function createEulaSelection(): Promise<EulaSelection> {
  const eula = environment.repux.eulaUrls[ 0 ];

  return {
    type: eula.type,
    file: new File(
      [ await new BlobDownloader().fetchBlobContents(eula.url) ],
      new FileName().getFileNameFromPath(eula.url)
    )
  };
}

@Component({
  selector: 'app-marketplace-eula-selector',
  templateUrl: './marketplace-eula-selector.component.html',
  styleUrls: [ 'marketplace-eula-selector.component.scss' ],
})
export class MarketplaceEulaSelectorComponent {
  @Input() formControl = new FormControl();

  public blobDownloader = new BlobDownloader();

  public eulaType = EulaType;

  public eulaUrls = environment.repux.eulaUrls;

  public fileInputFormControl = new FormControl([], [
    Validators.required
  ]);

  public fileNameUtil = new FileName();

  public maxFileSize = environment.ipfs.maxFileSize;

  public selectedFile: File;

  public selectedType: EulaType;

  async changeType(event: MatRadioChange): Promise<void> {
    this.selectedType = event.value;
    const selectedUrl = this.eulaUrls.find(eula => eula.type === this.selectedType).url;

    this.selectedFile = await this.fetchFile(selectedUrl);

    this.updateValue();
  }

  async fetchFile(selectedUrl: string): Promise<File> {
    if (!selectedUrl) {
      return;
    }

    return new File(
      [ await this.blobDownloader.fetchBlobContents(selectedUrl) ],
      this.fileNameUtil.getFileNameFromPath(selectedUrl)
    );
  }

  onFileSelect(files: FileList): void {
    if (files.length && this.fileInputFormControl.invalid) {
      delete this.selectedFile;
    } else {
      this.selectedFile = files[ 0 ];
    }

    this.updateValue();
  }

  updateValue(): void {
    if (!this.selectedFile) {
      this.formControl.setValue(null);

      return;
    }

    const result: EulaSelection = {
      type: this.selectedType,
      file: this.selectedFile
    };

    this.formControl.setValue(result);
  }
}
