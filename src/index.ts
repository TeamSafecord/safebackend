import fastify from "fastify";

const server = fastify();

server.get("/", (request, reply) => {
  reply.send({ statusCode: 200, message: "Hello World!" });
});

server.listen(process.env.PORT ?? 3000, "0.0.0.0", async (err, address) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on ${address}`);
});
