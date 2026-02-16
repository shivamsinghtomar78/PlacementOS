import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function getFirebaseAdmin(): Auth | null {
    if (adminAuth) return adminAuth;

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        return null;
    }

    if (getApps().length === 0) {
        adminApp = initializeApp({
            credential: cert({ projectId, clientEmail, privateKey }),
        });
    } else {
        adminApp = getApps()[0];
    }

    adminAuth = getAuth(adminApp);
    return adminAuth;
}

export { getFirebaseAdmin };
