import fs from 'fs';

const readCode = (files: string): Promise<string> =>
    new Promise((resolve, reject) => {
        let fetchData = '';
        fs.createReadStream(files)
            .on('data', (data) => {
                fetchData = data.toString();
            })
            .on('end', () => resolve(fetchData))
            .on('error', reject);
    });

const getAllFiles = (
    dir: string,
    extensionCallback: (extension: string, path: string) => boolean
): ReadonlyArray<string> =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getAllFiles(path, extensionCallback);
        }
        const extension = path.split('.').pop();
        return !extension
            ? []
            : !extensionCallback(extension, path)
            ? []
            : [path];
    });

const getAllFilesAndCode = (files: ReadonlyArray<string>) =>
    files.map(async (file) => ({
        file,
        code: await readCode(file),
    }));

export { readCode, getAllFiles, getAllFilesAndCode };
