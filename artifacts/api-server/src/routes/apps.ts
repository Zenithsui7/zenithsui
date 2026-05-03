import { Router, type IRouter, type Request, type Response } from "express";
import { db, appsTable } from "@workspace/db";
import { eq, ilike, or, desc, sql } from "drizzle-orm";
import {
  ListAppsQueryParams,
  CreateAppBody,
  UpdateAppBody,
  ReorderAppsBody,
  ListRecentAppsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function parseId(raw: string | string[] | undefined): number {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(str ?? "", 10);
  return isNaN(n) ? NaN : n;
}

// GET /api/apps
router.get("/apps", async (req: Request, res: Response) => {
  const parsed = ListAppsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }

  const { search } = parsed.data;

  const apps = await db
    .select()
    .from(appsTable)
    .where(
      search
        ? or(ilike(appsTable.name, `%${search}%`), ilike(appsTable.url, `%${search}%`))
        : undefined
    )
    .orderBy(appsTable.position, appsTable.name);

  res.json(apps);
});

// POST /api/apps
router.post("/apps", async (req: Request, res: Response) => {
  const parsed = CreateAppBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [maxPos] = await db
    .select({ maxPos: sql<number>`coalesce(max(${appsTable.position}), -1)` })
    .from(appsTable);

  const [app] = await db.insert(appsTable).values({
    ...parsed.data,
    position: (maxPos?.maxPos ?? -1) + 1,
  }).returning();

  res.status(201).json(app);
});

// GET /api/apps/stats
router.get("/apps/stats", async (req: Request, res: Response) => {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appsTable);

  const [favResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appsTable)
    .where(eq(appsTable.isFavorite, true));

  res.json({
    totalApps: totalResult?.count ?? 0,
    favoriteApps: favResult?.count ?? 0,
  });
});

// GET /api/apps/favorites
router.get("/apps/favorites", async (req: Request, res: Response) => {
  const apps = await db
    .select()
    .from(appsTable)
    .where(eq(appsTable.isFavorite, true))
    .orderBy(appsTable.position);

  res.json(apps);
});

// GET /api/apps/recent
router.get("/apps/recent", async (req: Request, res: Response) => {
  const parsed = ListRecentAppsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 5) : 5;

  const apps = await db
    .select()
    .from(appsTable)
    .where(sql`${appsTable.lastLaunchedAt} is not null`)
    .orderBy(desc(appsTable.lastLaunchedAt))
    .limit(limit);

  res.json(apps);
});

// PUT /api/apps/reorder
router.put("/apps/reorder", async (req: Request, res: Response) => {
  const parsed = ReorderAppsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  await Promise.all(
    parsed.data.order.map(({ id, position }) =>
      db.update(appsTable).set({ position }).where(eq(appsTable.id, id))
    )
  );

  res.json({ success: true });
});

// GET /api/apps/:id
router.get("/apps/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [app] = await db.select().from(appsTable).where(eq(appsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  res.json(app);
});

// PUT /api/apps/:id
router.put("/apps/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = UpdateAppBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const [app] = await db
    .update(appsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(appsTable.id, id))
    .returning();

  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  res.json(app);
});

// DELETE /api/apps/:id
router.delete("/apps/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(appsTable)
    .where(eq(appsTable.id, id))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }

  res.json({ success: true });
});

// POST /api/apps/:id/launch
router.post("/apps/:id/launch", async (req: Request, res: Response) => {
  const id = parseId(req.params["id"]);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [app] = await db
    .update(appsTable)
    .set({
      launchCount: sql`${appsTable.launchCount} + 1`,
      lastLaunchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(appsTable.id, id))
    .returning();

  if (!app) { res.status(404).json({ error: "Not found" }); return; }

  res.json(app);
});

export default router;
