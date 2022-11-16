import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import { parseAsStringEnv } from '../util/parse-env';

const config = {
    type: parseAsStringEnv({
        env: process.env.FIREBASE_TYPE,
        name: 'FIREBASE_TYPE',
    }),
    projectId: parseAsStringEnv({
        env: process.env.FIREBASE_PROJECT_ID,
        name: 'FIREBASE_PROJECT_ID',
    }),
    privateKeyId: parseAsStringEnv({
        env: process.env.FIREBASE_KEY_ID,
        name: 'FIREBASE_KEY_ID',
    }),
    privateKey: parseAsStringEnv({
        env: process.env.FIREBASE_KEY,
        name: 'FIREBASE_KEY',
    }),
    clientEmail: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_EMAIL,
        name: 'FIREBASE_CLIENT_EMAIL',
    }),
    clientId: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_ID,
        name: 'FIREBASE_CLIENT_ID',
    }),
    authUri: parseAsStringEnv({
        env: process.env.FIREBASE_AUTH_URI,
        name: 'FIREBASE_AUTH_URI',
    }),
    tokenUri: parseAsStringEnv({
        env: process.env.FIREBASE_TOKEN_URI,
        name: 'FIREBASE_TOKEN_URI',
    }),
    authProviderX509CertUrl: parseAsStringEnv({
        env: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        name: 'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    }),
    clientX509CertUrl: parseAsStringEnv({
        env: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        name: 'FIREBASE_CLIENT_X509_CERT_URL',
    }),
};

const auth = getAuth(
    initializeApp({
        credential: admin.credential.cert(config),
    })
);

export { auth };
