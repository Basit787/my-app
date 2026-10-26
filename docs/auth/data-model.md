# Auth service — data model

MongoDB (shared with the chat API).

- better-auth collections: `user` (name, email, image, role), `session`, `account` (credentials), `verification`.
- `signingkeys` — `kid`, `alg`, `publicJwk`, `privateJwk`: the EdDSA key that signs access tokens.
- Refresh tokens — `sessionId`, `userId`, `tokenHash`, `previousHash`, `rotatedAt`, `expiresAt`: only hashes are stored; the previous hash is accepted briefly so parallel tabs can refresh.
- MinIO: profile photos at `avatars/<userId>` in the shared bucket.
