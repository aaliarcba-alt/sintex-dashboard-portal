import sql from 'mssql';

const config: sql.config = {
  server: 'sintex-quote-sql-server-dev.database.windows.net',
  database: 'sintex-quote-dev-db',
  user: 'swa-pipes-admin-login',
  password: 'SintexApps@123',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(config).connect();
  return pool;
}

export { sql };
