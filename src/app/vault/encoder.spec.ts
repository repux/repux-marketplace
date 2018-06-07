import { Encoder } from './encoder';

describe('Encoder', () => {
  it('should encode/decode text', async () => {
    // tslint:disable-next-line:max-line-length
    const plainText = 'Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text ';
    const password = 'Some password';

    const result = await Encoder.encode(plainText, password);
    const expectedPlainText = await Encoder.decode(result.encBuffer, result.iv, password);

    expect(expectedPlainText).toEqual(plainText);
  });

  it('should encode/decode to string/from string', async () => {
    const serializedJSON = JSON.stringify({
      'a': '1',
      'b': '2'
    });
    const password = 'some password';

    const encodedString = await Encoder.encodeToString(serializedJSON, password);
    const decodedString = await Encoder.decodeFromString(encodedString, password);
    expect(decodedString).toEqual(serializedJSON);
  });

  it('should convert buffer to string and back', () => {
    const expectedString = 'aaa';
    const expectedUint8Array = [ 97, 97, 97 ]; // aaa
    const expectedBuffer = (new Uint8Array(expectedUint8Array)).buffer as ArrayBuffer;
    const encodedBuffer = Encoder.stringToBuffer(expectedString);

    expect(new Uint8Array(encodedBuffer)).toEqual(new Uint8Array(expectedBuffer));
    expect(Encoder.bufferToString(encodedBuffer)).toEqual(expectedString);
  });
});
