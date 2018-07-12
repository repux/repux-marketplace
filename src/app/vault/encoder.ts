import { BufferUtil } from './buffer.util';

declare class TextEncoder {
  constructor(encoding: string);

  encode(text: string): Uint8Array;
}

declare class TextDecoder {
  constructor(encoding: string);

  decode(encryptedBuffer: ArrayBuffer): string;
}

export class Encoder {
  static HASHING_FN = 'SHA-256';
  static ALGORITHM = {
    name: 'AES-CBC',
    length: 256
  };
  static IV_LENGTH = 16;
  static ENCODING = 'utf-8';
  static ITERATION_COUNT = 1e6;
  static SALT_LENGTH = 16;

  constructor() {
  }

  static async encode(plainText: string, password: string): Promise<{
    salt: Uint8Array,
    iterationCount: number
    iv: Uint8Array,
    encBuffer: ArrayBuffer
  }> {
    const textBuffer = new TextEncoder(Encoder.ENCODING).encode(plainText);
    const passwordBuffer = BufferUtil.stringToBuffer(password);
    const iv: Uint8Array = <Uint8Array> crypto.getRandomValues(new Uint8Array(Encoder.IV_LENGTH));
    const salt: Uint8Array = <Uint8Array> crypto.getRandomValues(new Uint8Array(Encoder.SALT_LENGTH));
    const encryptionKey = await Encoder.generateEncryptionKey(passwordBuffer, salt, Encoder.ITERATION_COUNT);
    const alg = {
      name: Encoder.ALGORITHM.name,
      iv
    };
    const encBuffer = await crypto.subtle.encrypt(alg, encryptionKey, textBuffer);

    return {
      salt,
      iterationCount: Encoder.ITERATION_COUNT,
      iv,
      encBuffer
    };
  }

  static async encodeToString(data: string, password: string): Promise<string> {
    const encoded = await Encoder.encode(data, password);
    const initializationVectorBuffer = encoded.iv.buffer as ArrayBuffer;
    const saltBuffer = encoded.salt.buffer as ArrayBuffer;
    const encodedDataBuffer = BufferUtil.appendBuffers(
      initializationVectorBuffer,
      saltBuffer,
      encoded.encBuffer
    );

    return BufferUtil.bufferToString(encodedDataBuffer);
  }

  static async decode(
    encryptedText: ArrayBuffer,
    iv: Uint8Array,
    salt: Uint8Array,
    iterationCount: number,
    password: string
  ): Promise<string> {
    const passwordBuffer = BufferUtil.stringToBuffer(password);
    const encryptionKey = await Encoder.generateEncryptionKey(passwordBuffer, salt, iterationCount);

    const alg = {
      name: Encoder.ALGORITHM.name,
      iv
    };

    const pBuffer = await crypto.subtle.decrypt(alg, encryptionKey, encryptedText);

    return new TextDecoder(Encoder.ENCODING).decode(pBuffer);
  }

  static decodeFromString(serializedData: string, password: string): Promise<string> {

    const encodedBuffer = BufferUtil.stringToBuffer(serializedData);
    let pointer = Encoder.IV_LENGTH;
    const iv = encodedBuffer.slice(0, pointer);
    const salt = encodedBuffer.slice(pointer, pointer + Encoder.SALT_LENGTH);
    pointer += Encoder.SALT_LENGTH;
    const data = encodedBuffer.slice(pointer, pointer + encodedBuffer.byteLength);

    return Encoder.decode(data, new Uint8Array(iv), new Uint8Array(salt), Encoder.ITERATION_COUNT, password);
  }

  static async generateEncryptionKey(passwordBuffer: ArrayBuffer, salt: Uint8Array, iterationCount: number): Promise<CryptoKey> {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      <any> { name: 'PBKDF2' },
      false,
      [ 'deriveBits', 'deriveKey' ]
    );

    return await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt, iterations: iterationCount, hash: Encoder.HASHING_FN },
      cryptoKey,
      Encoder.ALGORITHM,
      false,
      [ 'encrypt', 'decrypt' ]
    );
  }
}
