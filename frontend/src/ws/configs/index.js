const BASE_URL = window.location.hostname || 'localhost';
const WS_PORT = process.env.VUE_APP_WS_PORT || '3001';
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss' : 'ws';

export const WS_ADDRESS = `${WS_PROTOCOL}://${BASE_URL}:${WS_PORT}`;
