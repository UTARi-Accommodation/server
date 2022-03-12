import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import admin from 'firebase-admin';
import { firebaseConfig } from '../config/parsed';

const app = initializeApp({
    credential: admin.credential.cert(firebaseConfig),
});

const auth = getAuth(app);

export { auth };
