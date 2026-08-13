const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const swaggerUi = require("swagger-ui-dist");

// --- 1. KẾT NỐI DATABASE MYSQL ---
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "host.docker.internal",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345",
  database: process.env.DB_NAME || "Fiverr",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Lỗi kết nối MySQL:", err.message);
  } else {
    console.log("🚀 Kết nối thành công đến MySQL ngoài máy host!");
  }
});

// --- 2. ĐỊNH NGHĨA TÀI LIỆU API (SWAGGER SPEC) ---
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Fiverr Node.js API thuần",
    version: "1.0.0",
    description:
      "Hệ thống tự động đồng bộ cấu trúc bảng dữ liệu thực tế từ TablePlus",
  },
  paths: {
    "/users": {
      get: {
        summary: "Lấy danh sách người dùng từ MySQL",
        responses: {
          "200": {
            description: "Thành công - Trả về mảng dữ liệu từ TablePlus",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 1 },
                      name: { type: "string", example: "Nguyen Van A" },
                      email: { type: "string", example: "vana@gmail.com" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Thêm người dùng mới vào MySQL",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: { type: "string", example: "Tran Van B" },
                  email: { type: "string", example: "vanb@gmail.com" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Thành công - Đã lưu bản ghi mới vào MySQL",
          },
        },
      },
    },
  },
};

// --- 3. KHỞI TẠO HTTP SERVER XỬ LÝ SỰ KIỆN MẠNG ---
const swaggerUiPath = swaggerUi.getAbsoluteFSPath();

const server = http.createServer((req, res) => {
  // Lấy chính xác chuỗi URL sạch loại bỏ dấu "?"
  const urlPath = req.url.split("?")[0];

  // Tuyến đường 1: Trả về file cấu hình JSON Swagger
  if (urlPath === "/swagger.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(swaggerDocument));
  }

  // Tuyến đường 2: Thực hiện truy vấn lấy dữ liệu từ MySQL (GET)
  if (urlPath === "/users" && req.method === "GET") {
    connection.query("SELECT * FROM users", (err, results) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Lỗi truy vấn MySQL", detail: err.message }),
        );
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(results));
    });
    return;
  }

  // Tuyến đường 3: Xử lý thêm dữ liệu mới gửi từ form Swagger vào Database (POST)
  if (urlPath === "/users" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { name, email } = JSON.parse(body);
        const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
        connection.query(sql, [name, email], (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ error: "Lỗi chèn MySQL", detail: err.message }),
            );
          }
          res.writeHead(201, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              message: "Thêm thành công!",
              insertedId: result.insertId,
            }),
          );
        });
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Định dạng dữ liệu không hợp lệ" }),
        );
      }
    });
    return;
  }

  // Tuyến đường 4: Ép đọc file index.html tùy chỉnh ở thư mục gốc của bạn
  if (urlPath === "/" || urlPath === "/index.html") {
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end(
          "Loi: Khong tim thay file index.html tuy chinh o thu muc goc.",
        );
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(data);
    });
    return;
  }

  // Tuyến đường 5: Xử lý tệp tĩnh phụ trợ từ thư viện swagger-ui-dist (ĐÃ DỌN SẠCH BIẾN TRÙNG LẶP)
  const safeStaticPath = urlPath.startsWith("/")
    ? urlPath.substring(1)
    : urlPath;
  let filePath = path.join(swaggerUiPath, safeStaticPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not Found");
    }

    let extname = String(path.extname(filePath)).toLowerCase();
    let mimeTypes = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    let contentType = mimeTypes[extname] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌐 Swagger UI đang chạy tại http://localhost:${PORT}`);
});
