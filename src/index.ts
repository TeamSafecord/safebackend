import { fastify } from "fastify";
import fastifyAutoload from "fastify-autoload";
import { join } from "path";
const server = fastify();

server.register(fastifyAutoload, {
  dir: join(__dirname, "Routes"),
  options: { prefix: "/" },
})

server.listen(process.env.PORT ?? 3000, "0.0.0.0", async (err, address) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on ${address}`);
});
