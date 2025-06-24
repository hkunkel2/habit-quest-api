import { DataSource } from 'typeorm';
import { User } from './entities/User';
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    ssl: {
        rejectUnauthorized: false, // needs to be set to true for production
    },
  });