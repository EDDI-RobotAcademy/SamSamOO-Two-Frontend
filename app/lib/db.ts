import mysql from 'mysql2/promise';

// 커넥션 풀 생성
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3307'),
  user: process.env.MYSQL_USER || 'eddi',
  password: process.env.MYSQL_PASSWORD || 'eddi@123',
  database: process.env.MYSQL_DATABASE || 'fastapi_test_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;