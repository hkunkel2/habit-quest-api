import express from 'express';
import indexRoutes from './routes/index';
import { AppDataSource } from './data-source';
import cors from 'cors';

AppDataSource.initialize()
  .then(() => console.log('📦 DB connected'))
  .catch((err) => console.error('DB connection error:', err));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', indexRoutes);

export default app;