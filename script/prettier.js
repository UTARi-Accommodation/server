import pkg from 'prettier';
const { format } = pkg;
import * as fs from 'fs';
import { getAllFilesAndCode, getAllFiles } from './util.js';

const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: true,
    singleQuote: true,
};

(async (dir) => {
    const files = getAllFiles(
        dir,
        (extension, path) => extension === 'ts' && !path.includes('queries')
    );
    if (files.length === 0) {
        console.log('No TypeScript file in src folder');
        process.exit(0);
    }
    await Promise.all(
        (
            await getAllFilesAndCode(files).reduce(
                async (prev, curr) => (await prev).concat(await curr),
                Promise.resolve([])
            )
        ).map(({ code, file }) =>
            fs.writeFile(
                file,
                format(code, {
                    ...config,
                    parser: 'typescript',
                }),
                (err) => {
                    if (err) {
                        console.error(err);
                    }
                }
            )
        )
    );
    console.log('Prettier done its job!');
})('src');
