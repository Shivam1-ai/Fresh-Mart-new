import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

console.log("SMTP_HOST:", process.env.SMTP_HOST);

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required for authentication');
}

import app from './app.js';
import connectDB from './config/db.js';

const port = process.env.PORT || 5000;

await connectDB();

app.listen(port, () => {
  console.log(`FreshMart API running on port ${port}`);
});
