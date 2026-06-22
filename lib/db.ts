import sql from 'mssql';

function getConfig(): sql.config {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    // Parse from connection string format:
    // Server=tcp:...;Initial Catalog=...;User ID=...;Password=...
    const parts = Object.fromEntries(
      connectionString.split(';')
        .filter(Boolean)
        .map(part => {
          const idx = part.indexOf('=');
          return [part.slice(0, idx).trim().toLowerCase(), part.slice(idx + 1).trim()];
        })
    );

    return {
      server: (parts['server'] || parts['data source'] || '').replace('tcp:', ''),
      database: parts['initial catalog'] || parts['database'],
      user: parts['user id'] || parts['uid'],
      password: parts['password'] || parts['pwd'],
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
  }

  // Fallback to individual env vars
  const server = process.env.DB_SERVER;
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!server || !database || !user || !password) {
    throw new Error(
      'Database configuration missing. Set DATABASE_URL or DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD in environment variables.'
    );
  }

  return {
    server,
    database,
    user,
    password,
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
}

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(getConfig()).connect();
  return pool;
}

export { sql };