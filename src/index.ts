import fastifyAutoload from 'fastify-autoload';
import fastifyCookie from 'fastify-cookie';
import {connect} from 'mongoose';
import fastify from 'fastify';
import {join} from 'path';
import 'dotenv/config';

const server = fastify();

connect(process.env.MONGO_URI as string);

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
  options: {prefix: '/'},
});

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});

server.listen(process.env.PORT ?? 3000, '0.0.0.0', async (err, address) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on ${address}`);
  console.log(`Go to http://127.0.0.1:${process.env.PORT ?? 3000} to view it.`);
});
