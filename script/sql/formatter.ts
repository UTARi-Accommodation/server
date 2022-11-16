import fs from 'fs';
import { format } from 'sql-formatter';
import { getAllFiles, getAllFilesAndCode } from '../util';

const config = {
    language: 'postgresql',
    indent: '  ',
    uppercase: false,
    linesBetweenQueries: 1,
} as const;

const formatter = async (dir: string) => {
    const files = getAllFiles(dir, (extension) => extension === 'sql');
    if (!files.length) {
        console.log(`No SQL file in ${dir} folder`);
        process.exit(0);
    }
    (
        await getAllFilesAndCode(files).reduce(
            async (prev, curr) => (await prev).concat(await curr),
            Promise.resolve([])
        )
    ).forEach(({ code, file }) =>
        fs.writeFile(file, format(code, config), (err) => {
            if (err) {
                console.error(err);
            }
        })
    );
    console.log('SQL Formatter done its job!');
};

formatter('src');
formatter('sql');
