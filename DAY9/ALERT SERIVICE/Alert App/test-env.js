import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NOVU_API_KEY:', process.env.NOVU_API_KEY ? '***' + process.env.NOVU_API_KEY.slice(-4) : 'Not set');
console.log('NOVU_SUBSCRIBER_ID:', process.env.NOVU_SUBSCRIBER_ID);
