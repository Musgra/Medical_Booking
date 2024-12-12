import express from "express";
import { sendEmailController } from "../controllers/emailController.js";

const sendEmailRouter = express.Router({ mergeParams: true });

sendEmailRouter.post("/send-email", sendEmailController);

export default sendEmailRouter;
