import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { renderIcon } from '@download/blockies';

@Component({
  selector: 'app-blocky-identicon',
  template: '<canvas #identiconContainer></canvas>'
})
export class BlockyIdenticonComponent implements OnInit {
  @Input() seed: string;
  @Input() size = 8;
  @Input() scale = 4;
  @Input() color;
  @Input() backgroundColor;
  @Input() spotColor;

  @ViewChild('identiconContainer') container: ElementRef;

  ngOnInit() {
    renderIcon({
      seed: this.seed,
      color: this.color,
      bgcolor: this.backgroundColor,
      size: this.size,
      scale: this.scale,
      spotcolor: this.spotColor
    }, this.container.nativeElement);
  }
}
