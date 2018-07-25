export class FileName {
  getFileNameFromPath(path: string): string {
    return path.replace(/^.*[\\\/]/, '');
  }
}
