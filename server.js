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

// --- Hàm tạo Schema mẫu cho Swagger ---
const generateSwaggerPath = (tagName, summaryProps, postProps, putProps) => ({
  get: {
    tags: [tagName],
    summary: `Lấy danh sách dữ liệu từ bảng ${tagName}`,
    responses: { 200: { description: "Thành công" } },
  },
  post: {
    tags: [tagName],
    summary: `Thêm bản ghi mới vào bảng ${tagName}`,
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", properties: postProps },
        },
      },
    },
    responses: { 201: { description: "Tạo mới thành công" } },
  },
});

const generateSwaggerPathWithId = (tagName, putProps) => ({
  get: {
    tags: [tagName],
    summary: `Lấy chi tiết bản ghi theo ID từ bảng ${tagName}`,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Thành công" },
      404: { description: "Không tìm thấy" },
    },
  },
  put: {
    tags: [tagName],
    summary: `Cập nhật bản ghi theo ID trong bảng ${tagName}`,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "integer" } },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: { type: "object", properties: putProps },
        },
      },
    },
    responses: {
      200: { description: "Cập nhật thành công" },
      404: { description: "Không tìm thấy" },
    },
  },
  delete: {
    tags: [tagName],
    summary: `Xóa bản ghi theo ID khỏi bảng ${tagName}`,
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "integer" } },
    ],
    responses: {
      200: { description: "Xóa thành công" },
      404: { description: "Không tìm thấy" },
    },
  },
});

// --- 2. ĐỊNH NGHĨA TÀI LIỆU API (SWAGGER SPEC) ---
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Fiverr Node.js API thuần - Full Tables",
    version: "1.0.0",
    description:
      "Hệ thống quản lý đầy đủ 6 bảng dữ liệu Fiverr tự động đồng bộ",
  },
  paths: {
    "/init-data": {
      get: {
        tags: ["Cài đặt nhanh dữ liệu mẫu"],
        summary:
          "Tự động chạy code thêm 3 bình luận và thêm 1 loại công việc mới",
        responses: { 200: { description: "Khởi tạo dữ liệu thành công" } },
      },
    },
    "/binh-luan": generateSwaggerPath(
      "Bình Luận",
      {},
      {
        ma_cong_viec: { type: "integer" },
        ma_nguoi_binh_luan: { type: "integer" },
        ngay_binh_luan: { type: "string" },
        noi_dung: { type: "string" },
        sao_binh_luan: { type: "integer" },
      },
      { noi_dung: { type: "string" }, sao_binh_luan: { type: "integer" } },
    ),
    "/binh-luan/{id}": generateSwaggerPathWithId("Bình Luận", {
      noi_dung: { type: "string" },
      sao_binh_luan: { type: "integer" },
    }),

    "/chi-tiet-loai-cong-viec": generateSwaggerPath(
      "Chi Tiết Loại Công Việc",
      {},
      {
        ten_chi_tiet: { type: "string" },
        hinh_anh: { type: "string" },
        ma_loai_cong_viec: { type: "integer" },
      },
      { ten_chi_tiet: { type: "string" }, hinh_anh: { type: "string" } },
    ),
    "/chi-tiet-loai-cong-viec/{id}": generateSwaggerPathWithId(
      "Chi Tiết Loại Công Việc",
      { ten_chi_tiet: { type: "string" }, hinh_anh: { type: "string" } },
    ),

    "/cong-viec": generateSwaggerPath(
      "Công Việc",
      {},
      {
        ten_cong_viec: { type: "string" },
        danh_gia: { type: "integer" },
        gia_tien: { type: "integer" },
        hinh_anh: { type: "string" },
        mo_ta: { type: "string" },
        ma_chi_tiet_loai: { type: "integer" },
        sao_cong_viec: { type: "integer" },
      },
      {
        ten_cong_viec: { type: "string" },
        gia_tien: { type: "integer" },
        mo_ta: { type: "string" },
      },
    ),
    "/cong-viec/{id}": generateSwaggerPathWithId("Công Việc", {
      ten_cong_viec: { type: "string" },
      gia_tien: { type: "integer" },
      mo_ta: { type: "string" },
    }),

    "/loai-cong-viec": generateSwaggerPath(
      "Loại Công Việc",
      {},
      { ten_loai_cong_viec: { type: "string" } },
      { ten_loai_cong_viec: { type: "string" } },
    ),
    "/loai-cong-viec/{id}": generateSwaggerPathWithId("Loại Công Việc", {
      ten_loai_cong_viec: { type: "string" },
    }),

    "/thue-cong-viec": generateSwaggerPath(
      "Thuê Công Việc",
      {},
      {
        ma_cong_viec: { type: "integer" },
        ma_nguoi_thue: { type: "integer" },
        ngay_thue: { type: "string" },
        hoan_thanh: { type: "boolean" },
      },
      { hoan_thanh: { type: "boolean" } },
    ),
    "/thue-cong-viec/{id}": generateSwaggerPathWithId("Thuê Công Việc", {
      hoan_thanh: { type: "boolean" },
    }),

    "/users": generateSwaggerPath(
      "Users",
      {},
      {
        name: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
        phone: { type: "string" },
        role: { type: "string" },
      },
      {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
    ),
    "/users/{id}": generateSwaggerPathWithId("Users", {
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
    }),
  },
};

const tableMapping = {
  "binh-luan": "binh_luan",
  "chi-tiet-loai-cong-viec": "chi_tiet_loai_cong_viec",
  "cong-viec": "cong_viec",
  "loai-cong-viec": "loai_cong_viec",
  "thue-cong-viec": "thue_cong_viec",
  users: "users",
};

// --- 3. KHỞI TẠO HTTP SERVER XỬ LÝ SỰ KIỆN MẠNG ---
const swaggerUiPath = swaggerUi.getAbsoluteFSPath();

const server = http.createServer((req, res) => {
  // Lấy chính xác chuỗi URL sạch (String) loại bỏ dấu "?"
  const urlPath = req.url.split("?")[0];
  const method = req.method;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  //  Trả về file cấu hình JSON Swagger
  if (urlPath === "/swagger.json") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(swaggerDocument));
  }

  // KIỂM THỬ: TỰ ĐỘNG CHÈN 3 BÌNH LUẬN VÀ 1 LOẠI CÔNG VIỆC MẪU
  if (urlPath === "/init-data" && method === "GET") {
    const comments = [
      [1, 1, "2026-08-01", "Dịch vụ rất chuyên nghiệp", 5],
      [1, 2, "2026-07-30", "Sản phẩm thiết kế tiện ích.", 4],
      [2, 1, "2026-08-02", "Tuyệt vời!", 5],
    ];

    const sqlComments =
      "INSERT INTO binh_luan (ma_cong_viec, ma_nguoi_binh_luan, ngay_binh_luan, noi_dung, sao_binh_luan) VALUES ?";

    connection.query(sqlComments, [comments], (err1, res1) => {
      if (err1) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "Lỗi thêm 3 bình luận mẫu",
            detail: err1.message,
          }),
        );
      }

      const sqlJobType =
        "INSERT INTO loai_cong_viec (ten_loai_cong_viec) VALUES (?)";
      connection.query(
        sqlJobType,
        ["Lập trình & Công nghệ thông tin"],
        (err2, res2) => {
          if (err2) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({
                error: "Lỗi thêm loại công việc mới",
                detail: err2.message,
              }),
            );
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              status: "Thành công!",
              message:
                "Đã thêm đồng thời 3 bình luận mẫu và 1 loại công việc mới vào Database.",
              thong_tin_binh_luan: { rowsInserted: res1.affectedRows },
              thong_tin_loai_cong_viec: { insertedId: res2.insertId },
            }),
          );
        },
      );
    });
    return;
  }

  // --- PHÂN TÍCH URL ĐỘNG SỬ DỤNG REGEX ---
  const collectionRegex = /^\/([a-zA-Z0-9-]+)$/;
  const itemRegex = /^\/([a-zA-Z0-9-]+)\/([0-9]+)$/;

  const matchCollection = urlPath.match(collectionRegex);
  const matchItem = urlPath.match(itemRegex);

  // XỬ LÝ DẠNG 1: Lấy tất cả (GET) hoặc Tạo mới (POST)
  if (matchCollection) {
    const endpoint = matchCollection[1];
    const tableName = tableMapping[endpoint];

    if (!tableName) {
      // Nếu không khớp với bảng nào, chuyển tiếp qua xử lý tĩnh cho giao diện Swagger UI
      return serveSwaggerUI(req, res, urlPath);
    }

    // 1.1. Lấy toàn bộ danh sách (GET /binh-luan, /users, ...)
    if (method === "GET") {
      connection.query(`SELECT * FROM ${tableName}`, (err, results) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: err.message }));
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(results));
      });
    }
    // 1.2. Thêm mới bản ghi (POST /binh-luan, /users, ...)
    else if (method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          connection.query(
            `INSERT INTO ${tableName} SET ?`,
            data,
            (err, result) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: err.message }));
              }
              res.writeHead(201, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({
                  message: "Tạo mới thành công!",
                  id: result.insertId,
                }),
              );
            },
          );
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ error: "Dữ liệu JSON không hợp lệ" }),
          );
        }
      });
    }
    return;
  }

  // XỬ LÝ DẠNG 2: Xử lý theo ID cụ thể (GET, PUT, DELETE cho /binh-luan/1, /users/5, ...)
  if (matchItem) {
    const endpoint = matchItem[1];
    const id = matchItem[2];
    const tableName = tableMapping[endpoint];

    if (!tableName) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Đường dẫn không tồn tại" }));
    }

    // Lấy tên cột ID chính của bảng (Mặc định các bảng dùng 'id', riêng 1 số bảng bạn map thủ công nếu cần)
    const idColumn = "id";

    // 2.1. Lấy chi tiết 1 bản ghi (GET /endpoint/:id)
    if (method === "GET") {
      connection.query(
        `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`,
        [id],
        (err, results) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: err.message }));
          }
          if (results.length === 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Không tìm thấy bản ghi" }));
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(results[0]));
        },
      );
    }
    // 2.2. Cập nhật bản ghi theo ID (PUT /endpoint/:id)
    else if (method === "PUT") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          connection.query(
            `UPDATE ${tableName} SET ? WHERE ${idColumn} = ?`,
            [data, id],
            (err, result) => {
              if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: err.message }));
              }
              if (result.affectedRows === 0) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(
                  JSON.stringify({
                    error: "Không tìm thấy bản ghi để cập nhật",
                  }),
                );
              }
              res.writeHead(200, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ message: "Cập nhật thành công!" }),
              );
            },
          );
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ error: "Dữ liệu JSON không hợp lệ" }),
          );
        }
      });
    }
    // 2.3. Xóa bản ghi theo ID (DELETE /endpoint/:id)
    else if (method === "DELETE") {
      connection.query(
        `DELETE FROM ${tableName} WHERE ${idColumn} = ?`,
        [id],
        (err, result) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: err.message }));
          }
          if (result.affectedRows === 0) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(
              JSON.stringify({ error: "Không tìm thấy bản ghi để xóa" }),
            );
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({ message: "Xóa bản ghi thành công!" }),
          );
        },
      );
    }
    return;
  }

  // Nếu không khớp bất kỳ API data nào, chuyển tiếp đến cấu hình UI tĩnh cho Swagger
  serveSwaggerUI(req, res, urlPath);
});

// --- 4. HÀM PHỤ TRỢ ĐỂ HIỂN THỊ SWAGGER UI TỪ THƯ VIỆN SWAGGER-UI-DIST ---
function serveSwaggerUI(req, res, urlPath) {
  // Điều hướng root rỗng hoặc /swagger về trang index chính
  if (urlPath === "/" || urlPath === "/swagger" || urlPath === "/swagger/") {
    res.writeHead(301, { Location: "/swagger/index.html" });
    return res.end();
  }

  if (urlPath.startsWith("/swagger/")) {
    let filename = urlPath.replace("/swagger/", "");
    if (!filename) filename = "index.html";

    const filePath = path.join(swaggerUiPath, filename);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Không tìm thấy file Swagger UI");
      }

      // Ép Swagger UI đọc cấu hình file JSON động từ API
      if (filename === "swagger-initializer.js") {
        let script = data.toString();
        script = script.replace(/url:\s*["'].*?["']/g, 'url: "/swagger.json"');
        res.writeHead(200, { "Content-Type": "application/javascript" });
        return res.end(script);
      }

      // Xác định Content-Type tĩnh tương ứng
      let contentType = "text/html";
      if (filename.endsWith(".css")) contentType = "text/css";
      if (filename.endsWith(".js")) contentType = "application/javascript";
      if (filename.endsWith(".png")) contentType = "image/png";

      res.writeHead(200, { "Content-Type": contentType });
      return res.end(data);
    });
    return;
  }

  // Trả về 404 cho tất cả các đường dẫn sai cấu trúc khác
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Đường dẫn không tồn tại trên hệ thống" }));
}

// --- 5. KHỞI CHẠY SERVER TẠI CỔNG 8080 (Hoặc cổng tùy chỉnh của bạn) ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Server của bạn đã sẵn sàng chạy tại cổng: ${PORT}`);
  console.log(
    `👉 Truy cập tài liệu API trực quan tại: http://localhost:${PORT}/swagger/`,
  );
  console.log(`======================================================\n`);
});
