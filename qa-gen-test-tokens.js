// QA-only script: generates Firebase custom auth tokens for 2 synthetic test
// users (no password involved) and creates a fresh empty test room, so we can
// verify the "late joiner sees no video" fix end-to-end. Run locally in your
// own terminal (not in a sandboxed session) where the real service account
// secret is available. Delete this file when done testing.
//
// Usage:
//   1. vercel env pull .env.test.local --environment=production
//   2. node qa-gen-test-tokens.js
//   3. Paste the printed JSON back so the room can be opened in 2 browser tabs.

const fs = require('fs');
const admin = require('firebase-admin');

const envPath = require('path').join(__dirname, '.env.test.local');
const envRaw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envRaw.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[m[1]] = val;
}

const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://rahatizle-yeni-default-rtdb.europe-west1.firebasedatabase.app'
});

const ts = Date.now();
const hostUid = `qa-host-${ts}`;
const guestUid = `qa-guest-${ts}`;
const roomId = `QATEST${ts}`;

(async () => {
    const hostToken = await admin.auth().createCustomToken(hostUid, { qaTest: true });
    const guestToken = await admin.auth().createCustomToken(guestUid, { qaTest: true });

    await admin.database().ref(`rooms/${roomId}`).set({
        creator: { uid: hostUid, platform: null },
        createdAt: admin.database.ServerValue.TIMESTAMP
    });

    console.log(JSON.stringify({ roomId, hostUid, guestUid, hostToken, guestToken }, null, 2));
    process.exit(0);
})().catch(err => {
    console.error('ERROR', err);
    process.exit(1);
});
