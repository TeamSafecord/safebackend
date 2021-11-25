import fastifyAutoload from 'fastify-autoload';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import {Session} from './Models/Session';
import {Guild} from './Models/Guild';
import {connect} from 'mongoose';
import fastify from 'fastify';
import Redis from 'ioredis';
import {join} from 'path';
import axios from 'axios';
import 'dotenv/config';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis.Redis;
  }
}

const server = fastify();

server.redis = new Redis({
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT as string, 10),
  password: process.env.REDIS_PASSWORD as string,
  maxRetriesPerRequest: 1,
});

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
  options: {prefix: '/'},
});

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});

server.register(fastifyCors, {
  origin: process.env.DEV ? 'http://localhost:3050' : 'https://www.safecord.xyz',
  credentials: true,
});

server.redis.on('connect', () => {
  console.log('Connected to redis.');

  connect(process.env.MONGO_URI as string).then(async () => {
    console.log('Connected to mongo.');

    const guilds = await Guild.find({});
    const sessions = await Session.find({});

    for (const guild of guilds) {
      await server.redis.set(guild._id, JSON.stringify(guild));
    }

    for (const session of sessions) {
      const ttl = (new Date(session.expires_at).getTime() - Date.now()) / 1000;

      server.redis.set(session.nonce, JSON.stringify(session), 'EX', Math.round(ttl));
    }
  });
});

server.listen(process.env.PORT ?? 3000, '0.0.0.0', async (err, address) => {
  if (err) {
    throw err;
  }

  if (process.env.MODE !== 'DEV') {
    // eslint-disable-next-line
    void axios.post(
      'https://discord.com/api/webhooks/909681201500024832/eKlEapA_3mfKQzoV31qZnvR_VxxR4VRW1KiVkZrbD_WAkmXLE_uF76A_hAQK6SVpf5OE',
      {
        content: 'Launched on server!',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  console.log(`Listening on ${address}`);
  console.log(`Go to http://127.0.0.1:${process.env.PORT ?? 3000} to view it.`);
});
