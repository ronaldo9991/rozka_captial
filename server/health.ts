import { Request, Response } from 'express';
import { getDb } from './db';

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check database connection
    const db = await getDb();
    
    // Simple database query to verify connection
    await db.execute('SELECT 1 as health_check');
    
    // Check if we're in App Runner environment
    const isAppRunner = process.env.AWS_EXECUTION_ENV === 'AWS_App_Runner';
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: isAppRunner ? 'AWS App Runner' : 'Other',
      database: {
        status: 'connected',
        type: 'PostgreSQL',
        ssl_enabled: true
      },
      version: {
        app: '1.0.0',
        node: process.version
      }
    };

    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected',
        type: 'PostgreSQL'
      }
    };

    res.status(503).json(errorStatus);
  }
}
