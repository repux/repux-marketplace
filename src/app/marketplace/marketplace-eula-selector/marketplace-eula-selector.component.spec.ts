import { MarketplaceEulaSelectorComponent } from './marketplace-eula-selector.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../material.module';
import { MatRadioChange } from '@angular/material';
import { EulaType } from 'repux-lib';
import { environment } from '../../../environments/environment';
import { readFileAsArrayBuffer } from '../../shared/utils/read-file-as-array-buffer';
import { MaxFileSizeDirective } from '../../shared/components/file-input/max-file-size.directive';
import { FileInputComponent } from '../../shared/components/file-input/file-input.component';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { EulaTypePipe } from '../../shared/pipes/eula-type.pipe';

describe('MarketplaceEulaSelectorComponent', () => {
  let component: MarketplaceEulaSelectorComponent;
  let fixture: ComponentFixture<MarketplaceEulaSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MarketplaceEulaSelectorComponent,
        FileInputComponent,
        MaxFileSizeDirective,
        FileSizePipe,
        EulaTypePipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule,
        MaterialModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceEulaSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('#changeType()', () => {
    it('should change selected type and should call this.fetchFile()', async () => {
      const file = <any> { name: 'FILE' };
      const event = <MatRadioChange> {
        value: EulaType.STANDARD
      };
      const fetchFile = jasmine.createSpy().and.returnValue(Promise.resolve(file));
      const updateValue = jasmine.createSpy();
      component.fetchFile = fetchFile;
      component.updateValue = updateValue;

      await component.changeType(event);

      expect(fetchFile.calls.count()).toBe(1);
      expect(fetchFile.calls.allArgs()[ 0 ][ 0 ]).toBe(environment.repux.eulaUrls[ 0 ].url);
      expect(updateValue.calls.count()).toBe(1);
      expect(component.selectedType).toBe(EulaType.STANDARD);
      expect(component.selectedFile).toBe(file);
    });
  });

  describe('#fetchFile()', () => {
    it('should return undefined when selectedUrl is falsy', async () => {
      const result = await component.fetchFile(null);

      expect(result).toBeUndefined();
    });

    it('should return dowloaded file', async () => {
      const blobContent = new Uint8Array([ 0, 1, 2 ]);
      const blobDownloader = jasmine.createSpyObj('BlobDownloader', [ 'fetchBlobContents' ]);

      blobDownloader.fetchBlobContents.and.returnValue(Promise.resolve(blobContent));

      component.blobDownloader = blobDownloader;

      const result = await component.fetchFile('/path/to/file.txt');
      expect(result.name).toBe('file.txt');
      expect(await readFileAsArrayBuffer(result)).toEqual(<ArrayBuffer> blobContent.buffer);
    });
  });

  describe('#onFileSelect()', () => {
    it('should delete this.selectedFile when fileInput filed is invalid and should call updateValue()', () => {
      const updateValue = jasmine.createSpy();
      component.updateValue = updateValue;

      const file = new File([], 'file.txt');
      component.selectedFile = file;

      component.onFileSelect(<any> []);
      expect(component.selectedFile).toBeUndefined();

      component.selectedFile = file;
      component.fileInputFormControl = new FormControl('', [ Validators.required ]);
      component.onFileSelect(<any> [ file ]);
      expect(component.selectedFile).toBeUndefined();
      expect(updateValue.calls.count()).toBe(2);
    });

    it('should set selectedFile and call updateValue', () => {
      const updateValue = jasmine.createSpy();
      component.updateValue = updateValue;

      const file = new File([], 'file.txt');

      component.fileInputFormControl = new FormControl('', []);
      component.onFileSelect(<any> [ file ]);
      expect(component.selectedFile).toBe(file);
      expect(updateValue.calls.count()).toBe(1);
    });
  });
});
