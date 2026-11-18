import { Router } from "express";
import { handleModels } from "../controllers/models.controller";

const router = Router();

router.get("/", handleModels);

export default router;