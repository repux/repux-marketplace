import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileSizeComponent } from './file-size.component';

describe('FileSizeComponent', () => {
  let component: FileSizeComponent;
  let fixture: ComponentFixture<FileSizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileSizeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display value with proper unit', () => {
    component.bytes = 100;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('100B');

    component.bytes = 1001;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1kB');

    component.bytes = 1256;
    component.ngOnChanges();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('1.26kB');
  });
});
