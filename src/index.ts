import express from "express";
import io from "socket.io";
import http from "http";
import bodyParser from "body-parser";
import { configSocket } from "./socket-server";
import Redis from "ioredis";

import { HospitalService } from "./hospitals/hospitals.service";
import { HospitalsController } from "./hospitals/hospitals.controller";

require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL);

import { AdmitRequestController } from "./admit-request/admit-request.controller";

const app = express();
const httpServer = http.createServer(app);
const socketServer = io(httpServer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const hospitalService = new HospitalService();
const admitRequestController = new AdmitRequestController(socketServer, redis);
const hospitalsController = new HospitalsController(hospitalService);

app.use("/admit-request", admitRequestController.register());
app.use("/hospitals", hospitalsController.register());

configSocket(socketServer, redis);

httpServer.listen(+process.env.PORT, () => {
  console.log("Server started on port", process.env.PORT);
});
