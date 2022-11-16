import { parseAsString } from 'parse-dont-validate';

const parseAsStringEnv = ({
    env,
    name,
}: Readonly<{
    env: unknown;
    name: string;
}>) => parseAsString(env).elseThrow(`process.env.${name} is not string`);

export { parseAsStringEnv };
