import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dbContext from "./models";
import AuthRouter from "./routes/auth.routes";
import * as dotenv from "dotenv";
import { envConfig } from "./config/env.config";
import logger from "./logs/logger";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger/swagger.json";
import { NotFoundError, ReporingError } from "./utils/error";
import moment from "moment";
import FileControllers from "./controllers/file.controllers";
import FilesRouter from "./routes/file.routes";
import CommonRouter from "./routes/common.routes";
import NotificationsRouter from "./routes/notifications.routes";
import UserRouter from "./routes/user.routes";
import admin, { initializeApp } from "firebase-admin";
import CategoryRouter from "./routes/category.routes";

const serviceAccount = require("../config/gofun-333404-firebase-adminsdk-jsff7-0b4e6780c7.json");

dotenv.config();

moment.updateLocale("en", {
  week: {
    dow: 1,
  },
});

const init = () => {
  const server = express();

  const routes = [
    AuthRouter,
    FilesRouter,
    CommonRouter,
    NotificationsRouter,
    UserRouter,
    CategoryRouter,
  ];

  server.use(cors());
  // Parse request of content-type - application/json
  server.use(bodyParser.json({ strict: false }));
  // parse requests of content-type -application/x-www-form-urlencoded
  server.use(bodyParser.urlencoded({ extended: true }));

  // route api
  routes.forEach((item) => {
    server.use("/api", item);
  });
  server.use("/files/**", FileControllers.getFile);
  server.use("/bank-icon/**", FileControllers.getBankIcon);

  // swagger
  server.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 404: Not found
  server.use(function (req, res, next) {
    logger.error({
      ...req.headers,
      ...req.body,
    });

    res.status(404).send(new NotFoundError("Không tìm thấy trang").toModel());
    next();
  });

  // 500: Error reporing
  server.use(function (err, req, res, next) {
    logger.error({ ...err, req });

    res.status(500).send(new ReporingError().toModel());
    next();
  });

  server.listen(envConfig.SERVER_PORT, () => {
    console.log(`Server running on port : ${envConfig.SERVER_PORT}`);
  });
  // Run following function if you want drop existing tables and re-sync database
  // dbContext.dropRestApiTable();
  dbContext.databaseConfig.sync();
};

init();

// init firebase admin
initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// Run following function if you want drop existing tables and re-sync database
// dbContext.dropRestApiTable();
dbContext.databaseConfig.sync();
