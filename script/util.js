import fs from 'fs';

const readCode = (file) =>
    new Promise((resolve, reject) => {
        let fetchData = '';
        fs.createReadStream(file)
            .on('data', (data) => {
                fetchData = data.toString();
            })
            .on('end', () => resolve(fetchData))
            .on('error', reject);
    });

const getAllFiles = (dir, extensionCallback) =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getAllFiles(path, extensionCallback);
        }
        const extension = path.split('.').pop();
        return extension
            ? extensionCallback(extension, path)
                ? [path]
                : []
            : [];
    });

const getAllFilesAndCode = (files) =>
    files.map(async (file) => ({
        file,
        code: await readCode(file),
    }));

export { readCode, getAllFilesAndCode, getAllFiles };
