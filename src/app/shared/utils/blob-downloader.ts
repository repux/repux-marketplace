export class BlobDownloader {
  downloadBlob(blobUrl, fileName): void {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 0);
  }
}
