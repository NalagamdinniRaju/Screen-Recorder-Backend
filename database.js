const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.db");

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
    db.run(`DROP TABLE IF EXISTS recordings`);

    // Create recordings table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      createdAt DATETIME DEFAULT (datetime('now', 'localtime'))
    )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log("Recordings table ready");
        }
      }
    );
  }
});

// Database operations
const dbOps = {
  // Insert new recording
  insertRecording: (filename, filepath, filesize) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO recordings (filename, filepath, filesize) VALUES (?, ?, ?)`
      );
      stmt.run([filename, filepath, filesize], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            filename,
            filepath,
            filesize,
            createdAt: new Date().toISOString(),
          });
        }
      });
      stmt.finalize();
    });
  },

  // Get all recordings
  getAllRecordings: () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM recordings ORDER BY createdAt DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  },

  // Get recording by ID
  getRecordingById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM recordings WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Delete recording
  deleteRecording: (id) => {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM recordings WHERE id = ?`, [id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedRows: this.changes });
        }
      });
    });
  },
};

module.exports = { db, dbOps };
