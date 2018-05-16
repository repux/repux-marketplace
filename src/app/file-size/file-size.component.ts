import { Component, Input, OnChanges } from '@angular/core';
import { FileSize, sizeShortcut, maxUnitBySize } from '../file-size';

@Component({
  selector: 'app-file-size',
  templateUrl: './file-size.component.html',
  styleUrls: ['./file-size.component.scss']
})
export class FileSizeComponent implements OnChanges {
  @Input() public bytes: number;
  @Input() public forceUnit: FileSize;
  public value: number;
  public unit: string;

  constructor() {
  }

  ngOnChanges() {
    let unit,
      divBy = this.forceUnit;

    if (this.forceUnit) {
      unit = sizeShortcut(this.forceUnit);
    } else {
      divBy = maxUnitBySize(this.bytes);
      unit = sizeShortcut(divBy);
    }

    this.value = Math.round(this.bytes / divBy * 100) / 100;
    this.unit = unit;
  }
}
