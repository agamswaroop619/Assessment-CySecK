import express from "express";
import cors from "cors";
import config from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import scorecardRoutes from "./routes/scorecardRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(employeeRoutes);
app.use(reviewRoutes);
app.use(feedbackRoutes);
app.use(scorecardRoutes);

app.listen(config.port, () => {
    console.log("server running on " + config.port);
});