import pkg from 'pg';
import { parseAsStringEnv } from '../util/parse-env';
const { Pool } = pkg;

type Pool = pkg.Pool;

const postgresConfig = () => {
    const env = parseAsStringEnv({
        env: process.env.NODE_ENV,
        name: 'NODE_ENV',
    });

    return env === 'staging' || env === 'production'
        ? {
              connectionString: parseAsStringEnv({
                  env: process.env.DATABASE_URL,
                  name: 'DATABASE_URL',
              }),
              ssl: {
                  rejectUnauthorized: false,
              },
          }
        : {
              user: parseAsStringEnv({
                  env: process.env.PGUSER,
                  name: 'PGUSER',
              }),
              host: parseAsStringEnv({
                  env: process.env.PGHOST,
                  name: 'PGHOST',
              }),
              database: parseAsStringEnv({
                  env: process.env.PGDATABASE,
                  name: 'PGDATABASE',
              }),
              password: parseAsStringEnv({
                  env: process.env.PGPASSWORD,
                  name: 'PGPASSWORD',
              }),
              port: parseInt(
                  parseAsStringEnv({
                      env: process.env.PGPORT,
                      name: 'PGPORT',
                  })
              ),
          };
};

const postgreSQL = {
    instance: (() => {
        const pool = (() =>
            new Pool({
                ...postgresConfig(),
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
