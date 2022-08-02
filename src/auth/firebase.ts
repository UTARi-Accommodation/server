import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import { parseAsStringEnv } from 'esbuild-env-parsing';

const config = {
    type: parseAsStringEnv({
        env: process.env.FIREBASE_TYPE,
        name: 'firebase type',
    }),
    projectId: parseAsStringEnv({
        env: process.env.FIREBASE_PROJECT_ID,
        name: 'firebase project Id',
    }),
    privateKeyId: parseAsStringEnv({
        env: process.env.FIREBASE_KEY_ID,
        name: 'firebase key Id',
    }),
    privateKey: parseAsStringEnv({
        env: process.env.FIREBASE_KEY,
        name: 'firebase key',
    }),
    clientEmail: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_EMAIL,
        name: 'firebase client email',
    }),
    clientId: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_ID,
        name: 'firebase client Id',
    }),
    authUri: parseAsStringEnv({
        env: process.env.FIREBASE_AUTH_URI,
        name: 'firebase auth uri',
    }),
    tokenUri: parseAsStringEnv({
        env: process.env.FIREBASE_TOKEN_URI,
        name: 'firebase token uri',
    }),
    authProviderX509CertUrl: parseAsStringEnv({
        env: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        name: 'firebase auth provider x509 cert url',
    }),
    clientX509CertUrl: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        name: 'firebase client x509 cert url',
    }),
};

const auth = getAuth(
    initializeApp({
        credential: admin.credential.cert(config),
    })
);

export { auth };
