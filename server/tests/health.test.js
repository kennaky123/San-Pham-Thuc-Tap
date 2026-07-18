import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";

process.env.NODE_ENV = "test";
const { default: app } = await import("../src/app.js");

test("GET /api/health trả về trạng thái hoạt động", async () => {
  const response = await request(app).get("/api/health").expect(200);

  assert.match(response.headers["content-type"], /json/);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, "IT Helpdesk API đang hoạt động.");
  assert.equal(response.body.data.service, "it-helpdesk-server");
  assert.equal(response.body.data.status, "ok");
  assert.equal(typeof response.body.data.uptime, "number");
  assert.equal(Number.isNaN(Date.parse(response.body.data.timestamp)), false);
});

test("endpoint không tồn tại trả về 404", async () => {
  const response = await request(app).get("/api/not-found").expect(404);

  assert.match(response.headers["content-type"], /json/);
  assert.equal(response.body.success, false);
  assert.equal(response.body.data, null);
  assert.match(response.body.message, /Không tìm thấy endpoint/);
});

test("JSON không hợp lệ trả về response lỗi thống nhất", async () => {
  const response = await request(app)
    .post("/api/health")
    .set("Content-Type", "application/json")
    .send('{"title":')
    .expect(400);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, "Dữ liệu JSON không hợp lệ.");
  assert.equal(response.body.data, null);
});

test("payload vượt giới hạn trả về 413", async () => {
  const response = await request(app)
    .post("/api/health")
    .send({ content: "a".repeat(1024 * 1024 + 1) })
    .expect(413);

  assert.equal(response.body.success, false);
  assert.equal(
    response.body.message,
    "Dữ liệu gửi lên vượt quá giới hạn cho phép.",
  );
  assert.equal(response.body.data, null);
});

test("CORS cho phép frontend đã cấu hình", async () => {
  const response = await request(app)
    .get("/api/health")
    .set("Origin", "http://127.0.0.1:5173")
    .expect(200);

  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://127.0.0.1:5173",
  );
});
