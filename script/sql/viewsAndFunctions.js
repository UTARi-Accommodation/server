import * as fs from 'fs';

import { readCode } from '../util.js';

const getSQLFiles = (dir) =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getSQLFiles(path);
        }
        const extension = path.split('.').pop();
        return !extension ? [] : extension !== 'sql' ? [] : [path];
    });

const getAllSQLCode = (files) =>
    files.map(async (file) => await readCode(file));

const generateMainSQLFile = async (type, dirs) => {
    const destination = `temp/${type}.sql`;
    const finalSQLCode = async () => {
        const files = dirs.flatMap(getSQLFiles);
        if (type === 'create') {
            return (
                await (
                    await getAllSQLCode(files)
                ).reduce(
                    async (prev, curr) => (await prev).concat(await curr),
                    Promise.resolve([])
                )
            ).join('\n;');
        } else if (type === 'drop') {
            return files
                .map((file) => {
                    const splittedByForwardSlash = file.split('/');
                    const type = splittedByForwardSlash[1];
                    const name = splittedByForwardSlash
                        .pop()
                        .split('-')
                        .pop()
                        .split('.')[0]
                        .split(/(?=[A-Z])/)
                        .join('_')
                        .toLowerCase();
                    return `DROP ${type.toUpperCase()} IF EXISTS ${name} CASCADE`;
                })
                .join(';\n');
        }
        throw new Error(`type of ${type} is not "create" or "drop"`);
    };
    fs.writeFile(destination, await finalSQLCode(), (err) =>
        err ? console.error(err) : console.log(`${destination} generated`)
    );
};

generateMainSQLFile(process.argv[2], [`sql/function`, `sql/view`]);
