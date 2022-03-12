import pkg from 'pg';
import { postgresConfig } from '../config/parsed';
const { Pool } = pkg;

type Pool = pkg.Pool;

const postgreSQL = {
    instance: (() => {
        const pool = (() =>
            new Pool({
                ...postgresConfig,
                max: 20,
                idleTimeoutMillis: 0,
                connectionTimeoutMillis: 0,
            }))();
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
