import sql from 'mssql';

const dbConfig = {
    user: 'api',
    password: 'admin',
    server: 'JOSEHUAWEI',
    database: 'peliculas',
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig).
    connect().then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    }).catch(err => {
        console.error('Error de conexión a SQL Server: ', err);
        setTimeout(() => poolPromise, 5000);
    });

export { sql, poolPromise };