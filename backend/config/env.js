import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), 'backend/.env')
];

function applyEnvFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }

        const normalized = trimmed.startsWith('export ') ? trimmed.slice(7).trim() : trimmed;
        const eqIndex = normalized.indexOf('=');
        if (eqIndex <= 0) {
            continue;
        }

        const key = normalized.slice(0, eqIndex).trim();
        let value = normalized.slice(eqIndex + 1).trim();

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
        applyEnvFile(envPath);
        break;
    }
}

const APP_PORT = Number(process.env.APP_PORT || 3000);
const WS_PORT = Number(process.env.WS_PORT || 3001);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'liujinqi';

const JWT_SALT = process.env.JWT_SALT || 'XFoZff1OM3';

const OSS_REGION = process.env.OSS_REGION || 'oss-cn-beijing';
const OSS_ACCESS_KEY_ID = process.env.OSS_ACCESS_KEY_ID || '';
const OSS_ACCESS_KEY_SECRET = process.env.OSS_ACCESS_KEY_SECRET || '';
const OSS_BUCKET = process.env.OSS_BUCKET || '';

export {
    APP_PORT,
    WS_PORT,
    MONGO_URL,
    MONGO_DB_NAME,
    JWT_SALT,
    OSS_REGION,
    OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET
};
