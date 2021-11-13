import { fastify } from "fastify";
import * as fs from "fs";
const server = fastify();
const reqFiles = fs
  .readdirSync("./reqs")
  .filter((file) => file.endsWith(".js"));
async function main() {
  for (const file of reqFiles) {
    const req = require(`./reqs/${file}`);
    if (req.type == "post") {
      server.post(`/${req.slug}`, async (request, reply: any) => {
        try {
          req.execute(request, reply);
        } catch {
          reply.statusCode = 500;
          reply.send({ message: "Server Error" });
        }
      });
    }
    if (req.type == "get") {
      server.get(`/${req.slug}`, async (request, reply: any) => {
        try {
          reply.statusCode = 200;
          reply.send(await req.execute(request, reply));
        } catch {
          reply.statusCode = 500;
          reply.send({ message: "Server Error" });
        }
      });
    }
    if (req.type == "put") {
      server.put(`/${req.slug}`, async (request, reply: any) => {
        try {
          reply.statusCode = 200;
          reply.send(await req.execute(request, reply));
        } catch {
          reply.statusCode = 500;
          reply.send({ message: "Server Error" });
        }
      });
    }
    if (req.type == "delete") {
      server.delete(`/${req.slug}`, async (request, reply: any) => {
        try {
          reply.statusCode = 200;
          reply.send(await req.execute(request, reply));
        } catch {
          reply.statusCode = 500;
          reply.send({ message: "Server Error" });
        }
      });
    }
    if (req.type == "patch") {
      server.patch(`/${req.slug}`, async (request, reply: any) => {
        try {
          reply.statusCode = 200;
          reply.send(await req.execute(request, reply));
        } catch {
          reply.statusCode = 500;
          reply.send({ message: "Server Error" });
        }
      });
    }
  }
}
main();
server.listen(process.env.PORT ?? 3000, "0.0.0.0", async (err, address) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on ${address}`);
});
