import { getAllFiles, getAllFilesAndCode } from './util';

type Exec<T> = (sqlCode: string) => Promise<T>;

const reset = (async () => {
    const schemas = await getAllFilesAndCode(
        getAllFiles('sql', (extension) => extension === 'sql')
    ).reduce(
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
