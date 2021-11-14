import {fastify} from 'fastify';
import fastifyAutoload from 'fastify-autoload';
import {join} from 'path';
import {config} from 'dotenv';
config({path: '../.env'});
import {connect} from 'mongoose';
import fastifyCookie from 'fastify-cookie';

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
});
