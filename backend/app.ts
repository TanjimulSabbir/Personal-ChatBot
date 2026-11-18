import express from "express";
import router from './modules/routers';

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use("/api", router)

export default app;