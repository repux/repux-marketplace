import { Encoder } from './encoder';
import { BufferUtil } from './buffer.util';

describe('Encoder', () => {
  it('should encode/decode text', async () => {
    // tslint:disable-next-line:max-line-length
    const plainText = 'Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text Some input text ';
    const password = 'Some password';

    const result = await Encoder.encode(plainText, password);
    const expectedPlainText = await Encoder.decode(result.encBuffer, result.iv, result.salt, result.iterationCount, password);

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

  it('should create password based encryption key', async () => {
    const password = 'myPassword';
    const salt = crypto.getRandomValues(new Uint8Array(Encoder.SALT_LENGTH));
    const key = await Encoder.generateEncryptionKey(BufferUtil.stringToBuffer(password), salt, Encoder.ITERATION_COUNT);

    expect(key.algorithm).toEqual(Encoder.ALGORITHM);
    expect(key.type).toEqual('secret');
    expect(key.usages).toEqual([ 'encrypt', 'decrypt' ]);
  });
});
