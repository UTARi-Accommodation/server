import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import createParsedConfig from '../config/parsed';
import admin from 'firebase-admin';

const createCredential = () => {
    const {
        FIREBASE_TYPE,
        FIREBASE_PROJECT_ID,
        FIREBASE_KEY_ID,
        FIREBASE_KEY,
        FIREBASE_CLIENT_EMAIL,
        FIREBASE_CLIENT_ID,
        FIREBASE_AUTH_URI,
        FIREBASE_TOKEN_URI,
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        FIREBASE_CLIENT_X509_CERT_URL,
    } = createParsedConfig();
    return {
        type: FIREBASE_TYPE,
        projectId: FIREBASE_PROJECT_ID,
        privateKeyId: FIREBASE_KEY_ID,
        privateKey: FIREBASE_KEY,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        clientId: FIREBASE_CLIENT_ID,
        authUri: FIREBASE_AUTH_URI,
        tokenUri: FIREBASE_TOKEN_URI,
        authProviderX509CertUrl: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        clientX509CertUrl: FIREBASE_CLIENT_X509_CERT_URL,
    };
};

const app = initializeApp({
    credential: admin.credential.cert(createCredential()),
});

const auth = getAuth(app);

export { auth };
