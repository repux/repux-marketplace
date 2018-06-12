export class BufferUtil {
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

  static appendBuffers(...buffers: Array<ArrayBuffer>): ArrayBuffer {
    const buffersLength = buffers.reduce((acc, current) => {
      return acc + current.byteLength;
    }, 0);

    const combined = new Uint8Array(buffersLength);
    let currentIndex = 0;

    buffers.forEach(buffer => {
      combined.set(new Uint8Array(buffer), currentIndex);
      currentIndex += buffer.byteLength;
    });

    return combined.buffer as ArrayBuffer;
  }
}
