import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileInputComponent } from './file-input.component';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatIconModule, MatInputModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaxFileSizeDirective } from './max-file-size.directive';
import { FileSizePipe } from '../../pipes/file-size.pipe';

describe('FileInputComponent', () => {
  let component: FileInputComponent;
  let fixture: ComponentFixture<FileInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FileInputComponent,
        MaxFileSizeDirective,
        FileSizePipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatIconModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#openFileBrowser()', () => {
    it('should call click on fileInput.nativeElement', () => {
      component.fileInput.nativeElement.click = jasmine.createSpy();
      component.openFileBrowser();
      expect(component.fileInput.nativeElement.click.calls.count()).toBe(1);
    });
  });

  describe('#onChange', () => {
    it('should assign event my-active-listings to value property', () => {
      const files = <any> [ { name: 'FILE' } ];
      const event = {
        target: { files },
        stopPropagation: jasmine.createSpy()
      };

      component.onChange(event);

      expect(event.stopPropagation.calls.count()).toBe(1);
      expect(component.value).toBe(files);
    });

    it('should concat all file names and assign to fileNames property', () => {
      const files = <any> [ { name: 'FILE 1' }, { name: 'file2.jpg' }, { name: 'file-3' } ];
      const event = {
        target: { files },
        stopPropagation: jasmine.createSpy()
      };

      component.onChange(event);

      expect(event.stopPropagation.calls.count()).toBe(1);
      expect(component.fileNames).toBe('FILE 1, file2.jpg, file-3');
    });
  });

  describe('#DOM', () => {
    it('should render all elements', () => {
      const element: HTMLElement = fixture.nativeElement;

      let input = element.querySelector('input:nth-child(1)');
      expect(input.getAttribute('type')).toBe('file');

      input = element.querySelector('input:nth-child(2)');
      expect((<any> input).value).toBe('');

      const fileNames = 'VALUE';
      const placeholder = 'PLACEHOLDER';
      component.fileNames = fileNames;
      component.placeholder = placeholder;
      component.required = true;
      component.formControl = new FormControl('', [ Validators.required ]);
      fixture.detectChanges();
      input = element.querySelector('input:nth-child(2)');
      expect((<any> input).value).toBe(fileNames);
      expect(input.getAttribute('placeholder')).toBe(placeholder);
      expect((<any> input).required).toBeTruthy();


      component.multiple = true;
      fixture.detectChanges();
      input = element.querySelector('input:nth-child(2)');

      input.dispatchEvent(new CustomEvent('focus'));
      input.dispatchEvent(new CustomEvent('blur'));
      fixture.detectChanges();
      const error = element.querySelector('mat-error');
      expect(error.textContent.trim()).toBe('PLACEHOLDER is required');
    });

    it('should call openFileBrowser when user clicks on it', () => {
      component.openFileBrowser = jasmine.createSpy();
      const element: HTMLElement = fixture.nativeElement;
      const formField = element.querySelector('mat-form-field');
      formField.dispatchEvent(new CustomEvent('click'));
      expect((<any> component.openFileBrowser).calls.count()).toBe(1);
    });
  });
});
