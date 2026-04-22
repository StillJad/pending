class CooldownManager {
  constructor(defaultDurationMs = 3000) {
    this.defaultDurationMs = defaultDurationMs;
    this.cooldowns = new Map();
  }

  _key(scope, userId, commandName) {
    return `${scope}:${userId}:${commandName}`;
  }

  getRemaining(scope, userId, commandName) {
    const key = this._key(scope, userId, commandName);
    const expiresAt = this.cooldowns.get(key);

    if (!expiresAt) {
      return 0;
    }

    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.cooldowns.delete(key);
      return 0;
    }

    return remaining;
  }

  use(scope, userId, commandName, durationMs = this.defaultDurationMs) {
    const remaining = this.getRemaining(scope, userId, commandName);
    if (remaining > 0) {
      return remaining;
    }

    const key = this._key(scope, userId, commandName);
    this.cooldowns.set(key, Date.now() + durationMs);
    return 0;
  }
}

module.exports = {
  CooldownManager,
};
