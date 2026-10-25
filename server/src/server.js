import os from "node:os";
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";
import { env, validateEnv } from "./config/env.js";

let httpServer;
let isShuttingDown = false;

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const [name, nets] of Object.entries(interfaces)) {
    for (const net of nets || []) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254.")) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
}

function listenForRequests() {
  return new Promise((resolve, reject) => {
    const server = app.listen(env.port, env.host);
    const handleError = (error) => reject(error);

    server.once("error", handleError);
    server.once("listening", () => {
      server.off("error", handleError);
      resolve(server);
    });
  });
}

async function startServer() {
  try {
    validateEnv();
    await connectDatabase();
    httpServer = await listenForRequests();

    console.log(`IT Helpdesk API đang chạy tại http://${env.host}:${env.port}`);
    const lanList = getLanAddresses();
    for (const item of lanList) {
      console.log(`  ➜ Mạng LAN (${item.name}): http://${item.address}:${env.port}`);
    }
  } catch (error) {
    console.error(`Không thể khởi động server: ${error.message}`);

    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      console.error(disconnectError.message);
    }

    process.exit(1);
  }
}

async function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  try {
    console.log(`${signal} được nhận. Đang dừng server...`);

    if (httpServer?.listening) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await disconnectDatabase();
    process.exit(exitCode);
  } catch (error) {
    console.error(`Không thể dừng server an toàn: ${error.message}`);
    process.exit(1);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();
