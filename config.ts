import * as dotenv from 'dotenv';

import * as path from 'node:path';

dotenv.config({
	path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`),
});

export default {
	NODE_ENV: process.env.NODE_ENV || 'development',
	HOST: process.env.HOST || 'localhost',
	PORT: process.env.PORT || 8000,
};