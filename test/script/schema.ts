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

const schema = (async () => {
    const files = getSchemaFiles('sql');
    const [schemaOne, schemaTwo] = await getAllSQLCode(files).reduce(
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
    if (schemaTwo && schemaOne) {
        return {
            create: schemaTwo.file.includes('create')
                ? schemaTwo.code
                : schemaOne.code,
            drop: schemaTwo.file.includes('drop')
                ? schemaTwo.code
                : schemaOne.code,
        };
    }
    throw new Error('Could not find create and drop for schema');
})();

export default schema;
