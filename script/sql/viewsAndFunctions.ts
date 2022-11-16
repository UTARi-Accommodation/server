import fs from 'fs';
import { getAllFilesAndCode, getAllFiles } from '../util';

const generateMainSQLFile = async (
    type: string,
    dirs: ReadonlyArray<string>
) => {
    const destination = `temp/${type}.sql`;
    const finalSQLCode = async () => {
        const files = dirs.flatMap((dir) =>
            getAllFiles(dir, (extension) => extension === 'sql')
        );
        if (type === 'create') {
            return (
                await getAllFilesAndCode(files).reduce(
                    async (prev, curr) =>
                        (await prev).concat((await curr).code),
                    Promise.resolve([] as ReadonlyArray<string>)
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
