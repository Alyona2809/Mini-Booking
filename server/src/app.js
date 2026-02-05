require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("@apollo/server/plugin/landingPage/default");

const db = require("../db/models");
const { typeDefs } = require("./graphql/typeDefs");
const { resolvers } = require("./graphql/resolvers");
const { seedDemoDataIfEmpty } = require("./bootstrap/seedDemoData");

async function start() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(morgan("dev"));

  // healthcheck для docker/быстрой проверки
  app.get("/health", (_req, res) => res.json({ ok: true }));

  await db.sequelize.authenticate();
  const seedOnStart =
    process.env.SEED_ON_START === "true" ||
    (process.env.SEED_ON_START !== "false" &&
      process.env.NODE_ENV !== "production");

  if (seedOnStart) {
    const result = await seedDemoDataIfEmpty(db);
    // eslint-disable-next-line no-console
    console.log(
      `[seed] ${
        result.seeded ? "демо-данные добавлены" : "пропущено (данные уже есть)"
      }`
    );
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ...(process.env.NODE_ENV !== "production"
        ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
        : []),
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: async () => ({ db }),
    })
  );

  const port = Number(process.env.PORT || 3000);
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  // eslint-disable-next-line no-console
  console.log(`🚀 GraphQL готов: http://localhost:${port}/graphql`);
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Не удалось запустить сервер:", err);
  process.exitCode = 1;
});
