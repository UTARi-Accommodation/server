import { format } from 'sql-formatter';
import * as fs from 'fs';
import { getAllFilesAndCode, getAllFiles } from './util.js';

const config = {
    language: 'postgresql',
    indent: '  ',
    uppercase: false,
    linesBetweenQueries: 1,
};

(async (dir) => {
    const files = getAllFiles(dir, (extension) => extension === 'sql');
    if (files.length === 0) {
        console.log('No SQL file in src folder');
        process.exit(0);
    }
    await Promise.all(
        (
            await getAllFilesAndCode(files).reduce(
                async (prev, curr) => (await prev).concat(await curr),
                Promise.resolve([])
            )
        ).map(({ code, file }) =>
            fs.writeFile(file, format(code, config), (err) => {
                if (err) {
                    console.error(err);
                }
            })
        )
    );
    console.log('SQL Formatter done its job!');
})('src');
