import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[appDataProductListDetailRow]'
})
export class DataProductListDetailDirective {
  private row: any;
  private tRef: TemplateRef<any>;

  @Input()
  set appDataProductListDetailRow(value: any) {
    if (value !== this.row) {
      this.row = value;
      this.render();
    }
  }

  @Input('appDataProductListDetailTpl')
  set template(value: TemplateRef<any>) {
    if (value !== this.tRef) {
      this.tRef = value;
      this.render();
    }
  }

  constructor(public vcRef: ViewContainerRef) {
  }

  private render(): void {
    this.vcRef.clear();
    if (this.tRef && this.row) {
      this.vcRef.createEmbeddedView(this.tRef, { $implicit: this.row });
    }
  }
}
