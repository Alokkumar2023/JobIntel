import { Router } from "express";
import { createApplication, listApplications } from "../controllers/applicationController";

const router = Router();

router.post("/", createApplication);
router.get("/", listApplications);

export default router;
