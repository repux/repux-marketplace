export class BlobDownloader {
  downloadBlob(blobUrl: string, fileName: string): Promise<void> {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    return new Promise(resolve => {
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        resolve();
      }, 0);
    });
  }

  fetchBlobContents(blobUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            return resolve(xhr.response);
          }

          reject(xhr.statusText);
        }
      };

      xhr.open('GET', blobUrl, false);
      xhr.send();
    });
  }
}
