import dotenv from 'dotenv';
dotenv.config({
    path: `${process.cwd()}/.env${
        process.env.NODE_ENV === 'test' ? '.test' : ''
    }`,
});

const contactConfig = {
    EMAIL: process.env.EMAIL,
    PASS: process.env.PASS,
};

const firebaseConfig = {
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_KEY_ID,
    privateKey: process.env.FIREBASE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authUri: process.env.FIREBASE_AUTH_URI,
    tokenUri: process.env.FIREBASE_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

const postgresConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database:
        process.env.NODE_ENV === 'test'
            ? process.env.PGTESTDATABASE
            : process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT ?? `${5432}`),
};

export { firebaseConfig, contactConfig, postgresConfig };
