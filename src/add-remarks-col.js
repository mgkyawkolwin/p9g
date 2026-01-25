
const mysql = require("mysql2/promise");

async function addRemarksColumn() {
  console.log("Connecting to database...");
  const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'p9g',
      port: 3306
  });

  try {
    console.log("Checking if 'remarks' column exists...");
    const [columns] = await connection.execute(
        "SHOW COLUMNS FROM customer LIKE 'remarks'"
    );

    if (columns.length > 0) {
        console.log("Column 'remarks' already exists.");
    } else {
        console.log("Adding 'remarks' column...");
        await connection.execute(
            "ALTER TABLE customer ADD COLUMN remarks VARCHAR(500) AFTER address"
        );
        console.log("Column 'remarks' added successfully.");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

addRemarksColumn();
