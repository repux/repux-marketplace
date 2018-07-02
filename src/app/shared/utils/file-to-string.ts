export const fileToString = (file: File): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsText(file);
  });
};
