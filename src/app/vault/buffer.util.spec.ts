import { BufferUtil } from './buffer.util';

describe('BufferUtil', () => {
  it('should convert buffer to string and back', () => {
    const expectedString = 'aaa';
    const expectedUint8Array = [ 97, 97, 97 ]; // aaa
    const expectedBuffer = (new Uint8Array(expectedUint8Array)).buffer as ArrayBuffer;
    const encodedBuffer = BufferUtil.stringToBuffer(expectedString);

    expect(new Uint8Array(encodedBuffer)).toEqual(new Uint8Array(expectedBuffer));
    expect(BufferUtil.bufferToString(encodedBuffer)).toEqual(expectedString);
  });

  it('should append buffers', () => {
    const buffer1 = new Uint8Array([ 4, 5, 6 ]).buffer as ArrayBuffer;
    const buffer2 = new Uint8Array([ 1, 2, 3 ]).buffer as ArrayBuffer;
    const buffer3 = new Uint8Array([ 10, 11, 12, 13, 14 ]).buffer as ArrayBuffer;

    let expected = new Uint8Array([ 4, 5, 6, 1, 2, 3, 10, 11, 12, 13, 14 ]);
    let result = new Uint8Array(BufferUtil.appendBuffers(buffer1, buffer2, buffer3));
    expect(result).toEqual(expected);

    expected = new Uint8Array([ 1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14 ]);
    result = new Uint8Array(BufferUtil.appendBuffers(buffer2, buffer1, buffer3));
    expect(result).toEqual(expected);

    expected = new Uint8Array([ 10, 11, 12, 13, 14, 4, 5, 6, 1, 2, 3 ]);
    result = new Uint8Array(BufferUtil.appendBuffers(buffer3, buffer1, buffer2));
    expect(result).toEqual(expected);
  });
});
