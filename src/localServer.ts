import 'dotenv/config';
import app from './app';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('📦 DB connected');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('DB connection error:', err));