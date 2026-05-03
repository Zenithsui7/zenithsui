import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import appsRouter from "./apps";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(appsRouter);

export default router;
