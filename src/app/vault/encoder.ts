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
  static ALGORITHM = 'AES-GCM';
  static IV_LENGTH = 12;
  static ENCODING = 'utf-8';

  constructor() {
  }

  static async encode(plainText: string, password: string): Promise<{ iv: Uint8Array, encBuffer: ArrayBuffer }> {
    const textBuffer = new TextEncoder(Encoder.ENCODING).encode(plainText);
    const passwordBuffer = new TextEncoder(Encoder.ENCODING).encode(password);
    const passwordHash = await crypto.subtle.digest(Encoder.HASHING_FN, passwordBuffer);
    const iv = crypto.getRandomValues(new Uint8Array(Encoder.IV_LENGTH));

    const alg = { name: Encoder.ALGORITHM, iv: iv };
    const key = await crypto.subtle.importKey('raw', passwordHash, alg, false, [ 'encrypt' ]);
    const encBuffer = await crypto.subtle.encrypt(alg, key, textBuffer);

    return {
      iv,
      encBuffer
    };
  }

  static async encodeToString(data: string, password: string): Promise<string> {
    const encoded = await Encoder.encode(data, password);
    const initializationVectorBuffer = encoded.iv.buffer as ArrayBuffer;
    const encodedDataBuffer = Encoder.appendBuffers(initializationVectorBuffer, encoded.encBuffer);

    return Encoder.bufferToString(encodedDataBuffer);
  }

  static async decode(encryptedText: ArrayBuffer, iv: Uint8Array, password: string): Promise<string> {
    const passwordBuffer = new TextEncoder(Encoder.ENCODING).encode(password);
    const passwordHash = await crypto.subtle.digest(Encoder.HASHING_FN, passwordBuffer);

    const alg = { name: Encoder.ALGORITHM, iv: iv };
    const key = await crypto.subtle.importKey('raw', passwordHash, alg, false, [ 'decrypt' ]);
    const pBuffer = await crypto.subtle.decrypt(alg, key, encryptedText);

    return new TextDecoder(Encoder.ENCODING).decode(pBuffer);
  }

  static decodeFromString(serializedData: string, password: string): Promise<string> {
    const encodedBuffer = Encoder.stringToBuffer(serializedData);
    const iv = encodedBuffer.slice(0, Encoder.IV_LENGTH);
    const data = encodedBuffer.slice(Encoder.IV_LENGTH, encodedBuffer.byteLength);

    return Encoder.decode(data, new Uint8Array(iv), password);
  }

  static bufferToString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  static stringToBuffer(str: string): ArrayBuffer {
    const buffer = new ArrayBuffer(str.length);
    const bufferView = new Uint8Array(buffer);

    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufferView[ i ] = str.charCodeAt(i);
    }

    return buffer;
  }

  static appendBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    combined.set(new Uint8Array(buffer1), 0);
    combined.set(new Uint8Array(buffer2), buffer1.byteLength);

    return combined.buffer as ArrayBuffer;
  }
}
