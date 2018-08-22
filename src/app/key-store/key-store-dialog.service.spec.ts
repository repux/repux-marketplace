import { KeyStoreDialogService } from './key-store-dialog.service';
import { getTestBed, TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from '../shared/pipes/safe-html.pipe';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../material.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { KeysGeneratorDialogComponent } from './keys-generator-dialog/keys-generator-dialog.component';
import { KeysPasswordDialogComponent } from './keys-password-dialog/keys-password-dialog.component';
import { KeyStoreService } from './key-store.service';
import { MatDialog } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('KeyStoreDialogService', () => {
  let service: KeyStoreDialogService;
  let keyStoreServiceSpy, matDialogSpy;

  beforeEach(() => {
    keyStoreServiceSpy = jasmine.createSpyObj('KeyStoreService', [ 'hasKeys', 'getPublicKey' ]);
    matDialogSpy = jasmine.createSpyObj('MatDialog', [ 'open' ]);

    TestBed.configureTestingModule({
      declarations: [
        KeysGeneratorDialogComponent,
        KeysPasswordDialogComponent,
        SafeHtmlPipe
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: KeyStoreService, useValue: keyStoreServiceSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    })
    ;

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          KeysGeneratorDialogComponent,
          KeysPasswordDialogComponent
        ]
      }
    });

    const testbed = getTestBed();
    service = testbed.get(KeyStoreDialogService);
  });


  describe('#getKeys()', () => {
    it('should open KeysPasswordDialogComponent when keyStoreService.hasKeys return true and privateKey is present', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreServiceSpy.hasKeys.and.returnValue(true);
      matDialogSpy.open.and.returnValue({ afterClosed });

      const result = await service.getKeys({ privateKey: true, publicKey: true });
      expect(matDialogSpy.open.calls.count()).toBe(1);
      expect(result).toEqual(<any> expectedResult);
    });

    it('should open KeysPasswordDialogComponent when keyStoreService.hasKeys return true and no options are present', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreServiceSpy.hasKeys.and.returnValue(true);
      matDialogSpy.open.and.returnValue({ afterClosed });

      const result = await service.getKeys();
      expect(matDialogSpy.open.calls.count()).toBe(1);
      expect(result).toEqual(<any> expectedResult);
    });

    it('shouldn\'t open any modal when privateKey isn\'t present', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY'
      };
      keyStoreServiceSpy.hasKeys.and.returnValue(true);
      keyStoreServiceSpy.getPublicKey.and.returnValue(expectedResult.publicKey);

      const result = await service.getKeys({ publicKey: true });
      expect(matDialogSpy.open.calls.count()).toBe(0);
      expect(result).toEqual(<any> expectedResult);
    });

    it('should open KeysGeneratorDialogComponent when keyStoreService.hasKeys return true', async () => {
      const expectedResult = {
        publicKey: 'PUBLIC_KEY',
        privateKey: 'PRIVATE_KEY'
      };
      const subscribe = jasmine.createSpy();
      subscribe.and.callFake(callback => callback(expectedResult));
      const afterClosed = jasmine.createSpy();
      afterClosed.and.returnValue({ subscribe });
      keyStoreServiceSpy.hasKeys.and.returnValue(false);
      matDialogSpy.open.and.returnValue({ afterClosed });

      const result = await service.getKeys();
      expect(result).toEqual(<any> expectedResult);
    });
  });
});
