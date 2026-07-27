export class GoogleNotConnectedError extends Error {
  constructor() {
    super("No hay una cuenta de Google Drive conectada.");
    this.name = "GoogleNotConnectedError";
  }
}

// Refresh token missing, revoked, or rejected by Google (invalid_grant).
// The stored connection is dead; the user must reconnect from scratch.
export class GoogleReauthRequiredError extends Error {
  constructor() {
    super("La conexión con Google Drive expiró. Es necesario reconectar la cuenta.");
    this.name = "GoogleReauthRequiredError";
  }
}
