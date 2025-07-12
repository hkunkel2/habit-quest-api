import { AppDataSource } from '../data-source';
export async function ensureDbConnected() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}