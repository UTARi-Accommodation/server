import pkg from 'pg';
const { Pool } = pkg;
import createParsedConfig from '../config/parsed';

type Pool = pkg.Pool;

const postgreSQL = {
    instance: (() => {
        const pool = (() => {
            const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } =
                createParsedConfig();
            return new Pool({
                user: PGUSER,
                host: PGHOST,
                database: PGDATABASE,
                password: PGPASSWORD,
                port: parseInt(PGPORT ?? `${5432}`),
                max: 20,
                idleTimeoutMillis: 0,
                connectionTimeoutMillis: 0,
            });
        })();
        return {
            // Mostly testing purpose only
            exec: async (command: string) => {
                try {
                    return await pool.query(command);
                } catch (err) {
                    console.log('exec');
                    console.log(command);
                    console.error(err);
                    await pool.end();
                    process.exit(0);
                }
            },
            close: async () => pool.end(),
            pool,
        } as const;
    })(),
} as const;

export default postgreSQL;

export { Pool };
