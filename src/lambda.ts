import 'reflect-metadata';
import serverlessExpress from '@vendia/serverless-express';
import app from './app';

export const handler = serverlessExpress({ app });