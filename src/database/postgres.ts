import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import { underScoreToCamelCase } from './common/convertName';
import { Query as SelectQuery } from './query/select';
import { Query as MutationQuery } from './mutation/util';

type Value = string | number | boolean;
type NullableValue = Value | undefined;
type Fields = ReadonlyArray<string>;

const createPool = () => {
    const { parsed } = dotenv.config({
        path: `${process.cwd()}/${
            process.env.NODE_ENV === 'test' ? '.test' : ''
        }.env`,
    });
    if (!parsed) {
        throw new Error('There is no env file');
    }
    const client = new Client({
        user: parsed.PGUSER,
        host: parsed.PGHOST,
        database: parsed.PGDATABASE,
        password: parsed.PGPASSWORD,
        port: parseInt(parsed.PGPORT ?? `${5432}`),
    });
    client.connect();
    return client;
};

const convertUnderScoreRowToCamelCase = <
    T extends unknown | NullableValue | Value
>(
    rows: ReadonlyArray<any>
) =>
    !rows.length
        ? []
        : (rows.map((row) =>
              Object.entries(row).reduce(
                  (prev, [key, val]) => ({
                      ...prev,
                      [underScoreToCamelCase(key)]: val as T,
                  }),
                  {} as Readonly<{
                      [key: string]: T;
                  }>
              )
          ) as ReadonlyArray<
              Readonly<{
                  [key: string]: T;
              }>
          >);

const createPostgresPool = () => {
    const pool = createPool();
    const exec = async (command: string) => {
        try {
            return await pool.query(command);
        } catch (err) {
            console.log('exec');
            console.log(command);
            console.error(err);
            await pool.end();
            process.exit(0);
        }
    };
    const execParam = async (command: string, values: ReadonlyArray<any>) => {
        try {
            return await pool.query(command, Array.from(values));
        } catch (err) {
            console.log('exec');
            console.log(command);
            console.error(err);
            await pool.end();
            process.exit(0);
        }
    };
    return {
        close: async () => pool.end(),
        exec,
        execParam,
        resetSomeTablesAndColumns: async () => {
            try {
                await exec('TRUNCATE TABLE email');
                await exec('TRUNCATE TABLE mobile_number');
                await exec('TRUNCATE TABLE room_capacity');

                await exec(
                    'ALTER SEQUENCE room_capacity_id_seq RESTART WITH 1'
                );

                await exec('UPDATE accommodation SET available=false');
                await exec('UPDATE room SET available=false');
                return await exec('UPDATE unit SET available=false');
            } catch (err) {
                console.log('resetSomeTablesAndColumns');
                console.error(err);
                process.exit(0);
            }
        },
        select: async ({ statement, values }: SelectQuery) => {
            try {
                return convertUnderScoreRowToCamelCase<Value>(
                    (
                        await pool.query(
                            `${statement}`,
                            values ? Array.from(values) : undefined
                        )
                    ).rows
                );
            } catch (err) {
                console.log('select');
                console.dir({
                    statement: `${statement}`,
                    values: values ? Array.from(values) : undefined,
                });
                console.error(err);
                process.exit(0);
            }
        },
        insert: async ({ statement, values }: MutationQuery) => {
            try {
                return convertUnderScoreRowToCamelCase<Value>(
                    (await execParam(statement, values)).rows
                );
            } catch (err) {
                console.log('insert');
                console.dir({
                    statement,
                    values,
                });
                console.error(err);
                process.exit(0);
            }
        },
        update: async ({ statement, values }: MutationQuery) => {
            try {
                return convertUnderScoreRowToCamelCase<Value>(
                    (await execParam(statement, values)).rows
                );
            } catch (err) {
                console.log('update');
                console.dir({
                    statement,
                    values,
                });
                console.error(err);
                process.exit(0);
            }
        },
    } as const;
};

class PostgreSQL {
    private static readonly instance = createPostgresPool();

    static getPoolInstance = () => this.instance;
}

export default PostgreSQL;

export { Value, NullableValue, Fields, convertUnderScoreRowToCamelCase };
