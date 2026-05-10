export const genId = () => Date.now();
/** Six-digit numeric password for auto-created employees */
export const genPassword = () => Math.floor(100000 + Math.random() * 900000);
