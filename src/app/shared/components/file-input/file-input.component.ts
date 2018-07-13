import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: [ './file-input.component.scss' ]
})
export class FileInputComponent {
  @Input() required: boolean;
  @Input() multiple = false;
  @Input() placeholder: string;
  @Input() value: FileList;
  @Input() fileNames = '';
  @Input() formControl: FormControl = new FormControl();
  @Input() hint?: string;
  @Input() maxFileSize?: number;
  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() filesSelect = new EventEmitter<FileList>();

  openFileBrowser() {
    this.fileInput.nativeElement.click();
  }

  onChange(event) {
    event.stopPropagation();

    this.value = event.target.files;
    this.formControl.setValue(this.value);

    const names: string[] = [];
    for (let i = 0; i < event.target.files.length; i++) {
      names.push(event.target.files[ i ].name);
    }

    this.fileNames = names.join(', ');
    this.filesSelect.emit(this.value);
  }
}
