import * as crypto from 'crypto';

const key = crypto.randomBytes(32).toString('base64');
console.log('Generated Encryption Key:', key); 