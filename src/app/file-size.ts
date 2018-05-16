const THOUSAND = 1000;

export enum FileSize {
  BYTE = 1,
  KILOBYTE = THOUSAND * FileSize.BYTE,
  MEGABYTE = THOUSAND * FileSize.KILOBYTE,
  GIGABYTE = THOUSAND * FileSize.MEGABYTE,
  TERABYTE = THOUSAND * FileSize.GIGABYTE,
  PETABYTE = THOUSAND * FileSize.TERABYTE
}

export function sizeShortcut(size: FileSize) {
  if (size === FileSize.BYTE) {
    return 'B';
  }

  if (size === FileSize.KILOBYTE) {
    return 'kB';
  }

  if (size === FileSize.MEGABYTE) {
    return 'MB';
  }

  if (size === FileSize.GIGABYTE) {
    return 'GB';
  }

  if (size === FileSize.TERABYTE) {
    return 'TB';
  }

  return 'PB';
}

export function maxUnitBySize(size: number) {
  if (size < FileSize.KILOBYTE) {
    return FileSize.BYTE;
  }

  if (size < FileSize.MEGABYTE) {
    return FileSize.KILOBYTE;
  }

  if (size < FileSize.GIGABYTE) {
    return FileSize.MEGABYTE;
  }

  if (size < FileSize.TERABYTE) {
    return FileSize.GIGABYTE;
  }

  if (size < FileSize.PETABYTE) {
    return FileSize.TERABYTE;
  }

  return FileSize.PETABYTE;
}
