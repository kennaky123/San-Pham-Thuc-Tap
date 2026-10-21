import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import apiRouter from "./routes/index.js";
import { publishDataChanged } from "./services/realtimeService.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  "/api",
  (request, response, next) => {
    response.on("finish", () => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && response.statusCode < 400) {
        const pathParts = request.originalUrl.split("?")[0].split("/").filter(Boolean);
        const resource = pathParts[0] === "api" ? pathParts[1] : pathParts[0];
        publishDataChanged(resource);
      }
    });
    next();
  },
  apiRouter,
);

app.use(notFound);
app.use(errorHandler);

export default app;
