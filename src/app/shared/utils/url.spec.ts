import { urlSearchParamsToJSON } from './url';

describe('#urlSearchParamsToJSON()', () => {
  it('should convert URLSearchParams object into JSON representation', () => {
    const urlParams = new URLSearchParams('bar=foo&other=param&key=value:asc');
    const result = urlSearchParamsToJSON(urlParams);
    expect(result).toEqual({
      bar: 'foo',
      other: 'param',
      key: 'value:asc'
    });
  });

  it('should return empty object when no URLSearchParams present', () => {
    const urlParams = new URLSearchParams('');
    const result = urlSearchParamsToJSON(urlParams);
    expect(result).toEqual({});
  });
});
