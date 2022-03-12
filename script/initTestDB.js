import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import * as fs from 'fs';
import { readCode } from './util.js';

const getSchemaFiles = (dir) =>
    fs.readdirSync(dir).flatMap((file) => {
        const path = `${dir}/${file}`;
        if (fs.statSync(path).isDirectory()) {
            return getSchemaFiles(path);
        }
        const extension = path.split('.').pop();
        return extension ? (extension === 'sql' ? [path] : []) : [];
    });

const getAllSQLCode = (files) =>
    files.map(async (file) => await readCode(file));

const schema = (async () => {
    const files = getSchemaFiles('sql');
    const [schemaOne, schemaTwo, schemaThree] = await getAllSQLCode(
        files
    ).reduce(
        async (prev, curr) => (await prev).concat(await curr),
        Promise.resolve([])
    );
    if (schemaTwo && schemaOne && schemaThree) {
        return {
            create: schemaTwo.includes('CREATE')
                ? schemaTwo
                : schemaOne.includes('CREATE')
                ? schemaOne
                : schemaThree,
            drop: schemaTwo.includes('DELETE')
                ? schemaTwo
                : schemaOne.includes('DELETE')
                ? schemaOne
                : schemaThree,
            truncate: schemaTwo.includes('TRUNCATE')
                ? schemaTwo
                : schemaOne.includes('TRUNCATE')
                ? schemaOne
                : schemaThree,
        };
    }
    throw new Error('Could not find create and drop for schema');
})();

const pool = (() => {
    const { parsed } = dotenv.config({
        path: `${process.cwd()}/.test.env`,
    });
    if (!parsed) {
        throw new Error('There is no env file');
    }
    const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } = parsed;
    return new Pool({
        user: PGUSER,
        host: PGHOST,
        database: PGDATABASE,
        password: PGPASSWORD,
        port: parseInt(PGPORT ?? `${5432}`),
        max: 200,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: 0,
    });
})();

const main = async () => {
    await pool.query((await schema).drop);
    await pool.query((await schema).create);
    await pool.end();
};

export default main();
