import { Router } from "express";
import chatRoute from "./chat.route";
import modelsRoute from "./models.route";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});
router.use("/chat", chatRoute);
router.use("/models", modelsRoute);

export default router;