import { Router } from "express";
import { searchAlumniPublicController } from "../controllers/statistics.controller.js";

const alumniRouter = Router();

// Alumni search endpoint (public)
alumniRouter.get("/search", searchAlumniPublicController);

export default alumniRouter;