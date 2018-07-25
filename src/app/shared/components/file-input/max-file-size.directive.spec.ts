import { MaxFileSizeDirective } from './max-file-size.directive';

describe('MaxFileSizeDirective', () => {
  let directive: MaxFileSizeDirective;

  beforeEach(() => {
    directive = new MaxFileSizeDirective();
  });

  describe('#validate()', () => {
    it('should return error when control is invalid', () => {
      directive.appMaxFileSize = 10;

      const file = {
        name: 'test',
        size: 100
      };

      const control = <any> {
        value: [ file ]
      };

      expect(directive.validate(control)).toEqual({ 'maxFileSizeExceeded': { value: [ file ] } });
    });

    it('should return null when control is valid', () => {
      directive.appMaxFileSize = 100;

      const file = {
        name: 'test',
        size: 10
      };

      const control = <any> {
        value: [ file ]
      };

      expect(directive.validate(control)).toBeUndefined();
    });
  });
});
