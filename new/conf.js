const express = require("express");
const mysql = require("mysql2");

const bodyParser = require("body-parser");
const app = express();

// إعداد اتصال قاعدة البيانات
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});
connection.connect((err) => {
  if (err) throw err;

  console.log("Connected to MySQL server");

  // Create the 'mydatabase' database if it doesn't exist
  connection.query(
    "CREATE DATABASE IF NOT EXISTS mydatabase",
    (err, result) => {
      if (err) throw err;

      console.log("Database created or already exists");

      // Use 'mydatabase'
      connection.query("USE mydatabase", (err, result) => {
        if (err) throw err;

        console.log("Using mydatabase");

        // Create 'users' table if it doesn't exist
        connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          address VARCHAR(255),
          number INT
        )
      `,
          (err, result) => {
            if (err) throw err;

            console.log("Users table created or already exists");

            // Perform additional operations or queries here
          }
        );
      });
    }
  );
});

// يُعين رأس 'Access-Control-Allow-Origin' للسماح بالوصول من أي مكان
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS" // تحديد الطرق المسموح بها، بما في ذلك DELETE
  );

  next();
});

// استخدام body-parser
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse JSON in the request body
app.use(express.json());

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
// فتح الاتصال
connection.connect();

// نقطة نهاية API لاستعراض البيانات من جدول المستخدمين
app.get("/api/data", function (req, res) {
  // استعلام قاعدة البيانات لاسترجاع البيانات من الجدول المناسب
  connection.query("SELECT * FROM users", function (error, results, fields) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(results);
    }
  });
});

// نقطة نهاية API لتحديث بيانات المستخدم
app.put("/api/data/:id", function (req, res) {
  const itemId = req.params.id; // الحصول على الـ ID من الطلب
  const newData = req.body; // بيانات الـ form للتحديث

  // استخدام الـ ID لتحديث البيانات في قاعدة البيانات
  connection.query(
    "UPDATE users SET name = ?, number = ?, address = ? WHERE id = ?",
    [newData.name, newData.number, newData.address, itemId],
    function (error, results, fields) {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.json({
          message: "Item updated successfully",

          id: itemId,
          data: newData,
        });
      }
    }
  );
});

// نقطة نهاية API لاستقبال البيانات من الـ HTML form وإدراجها في قاعدة البيانات
app.post("/api/data", function (req, res) {
  const formData = req.body; // بيانات الـ form

  // استخدام بيانات الـ form لإدراجها في قاعدة البيانات
  connection.query(
    "INSERT INTO users (name, number, address) VALUES (?, ?, ?)",
    [formData.name, formData.number, formData.address],
    function (error, results, fields) {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
      }
    }
  );
});

// Assuming you're using Express and MySQL

// Endpoint لحذف بيانات بناءً على الـ id
app.delete("/api/data/:id", function (req, res) {
  const itemId = req.params.id; // الحصول على الـ id من الطلب

  // استخدام الـ id لحذف البيانات من قاعدة البيانات
  connection.query(
    "DELETE FROM users WHERE id = ?",
    [itemId],
    function (error, results, fields) {
      if (error) {
        res.status(500).json({ error: error.message });
      } else {
        res.json({ message: "Item deleted successfully" });
      }
    }
  );
});

app.listen(5000, function () {
  console.log("Server is running on port 5000");
});
