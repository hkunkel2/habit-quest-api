import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Habit } from './entities/Habit';
import { Category } from './entities/Category';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Habit, Category],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: process.env.NODE_ENV == 'local' ?  false : { rejectUnauthorized: false },
});