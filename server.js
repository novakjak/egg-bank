import compression from "compression";
import express from "express";
import morgan from "morgan";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "5173");

const app = express();

app.use(compression());
app.disable("x-powered-by");

const viteServer = await import("vite").then((vite) =>
  vite.createServer({
    server: { middlewareMode: true },
  }),
);
const db = await viteServer.ssrLoadModule("./app/database.server.ts");
try {
  await db.Db.instance();
} catch (e) {
  console.log(`Could not connect to server: ${e.message}`);
  process.exit(1);
}

const timeout = setInterval(async () => {
  try {
    await db.Db.add_interest();
  } catch (e) {
    console.log(`An error occured when adding interest: ${e}`);
    clearInterval(timeout);
  }
}, 5 * 60 * 1000);

if (DEVELOPMENT) {
  console.log("Starting development server");
  app.use(viteServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteServer.ssrLoadModule("./app/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(morgan("tiny"));
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
