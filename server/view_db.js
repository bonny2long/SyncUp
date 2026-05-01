import mysql from 'mysql2/promise';

async function describe() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'N!gga840',
    database: 'syncup_local'
  });

  try {
    const [rows] = await connection.query("SHOW COLUMNS FROM users LIKE 'role';");
    console.log("ROLE ENUM:", rows[0].Type);

    const [userRows] = await connection.query("SELECT role, count(*) as count FROM users GROUP BY role;");
    console.log("USER COUNTS:", userRows);

    const [allEmails] = await connection.query("SELECT email FROM users;");
    console.log("All emails:", allEmails.map(u => u.email).join(", "));
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
describe();
