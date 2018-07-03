import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[appMarketplaceDataProductListDetailRow]'
})
export class MarketplaceDataProductListDetailDirective {
  private row: any;
  private tRef: TemplateRef<any>;

  constructor(public vcRef: ViewContainerRef) {
  }

  @Input()
  set appMarketplaceDataProductListDetailRow(value: any) {
    if (value !== this.row) {
      this.row = value;
      this.render();
    }
  }

  @Input('appMarketplaceDataProductListDetailTpl')
  set template(value: TemplateRef<any>) {
    if (value !== this.tRef) {
      this.tRef = value;
      this.render();
    }
  }

  private render(): void {
    this.vcRef.clear();
    if (this.tRef && this.row) {
      this.vcRef.createEmbeddedView(this.tRef, { $implicit: this.row });
    }
  }
}
