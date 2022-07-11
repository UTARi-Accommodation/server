import * as fs from 'fs';

const getSchemaFiles = (dir: string): ReadonlyArray<string> =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getSchemaFiles(path);
        }
        const extension = path.split('.').pop();
        return !extension ? [] : extension !== 'sql' ? [] : [path];
    });

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

const getAllSQLCode = (files: ReadonlyArray<string>) =>
    files.map(async (file) => ({
        file,
        code: await readCode(file),
    }));

type Exec<T> = (sqlCode: string) => Promise<T>;

const reset = (async () => {
    const schemas = await getAllSQLCode(getSchemaFiles('sql')).reduce(
        async (prev, curr) => (await prev).concat(await curr),
        Promise.resolve(
            [] as ReadonlyArray<
                Readonly<{
                    file: string;
                    code: string;
                }>
            >
        )
    );

    const createViewsAndFunctions = () =>
        schemas
            .flatMap(({ file, code }) => {
                if (file.includes('migration')) {
                    return [];
                }
                return [code];
            })
            .join(';\n');

    const resetTables = () =>
        schemas
            .flatMap(({ file, code }) => (!file.includes('drop') ? [] : [code]))
            .concat(
                schemas.flatMap(({ file, code }) =>
                    file.includes('drop') ? [] : [code]
                )
            )
            .join(';\n');

    return {
        db: <T>(exec: Exec<T>) => exec(resetTables()),
        viewsAndFunctions: <T>(exec: Exec<T>) =>
            exec(createViewsAndFunctions()),
    };
})();

export default reset;
