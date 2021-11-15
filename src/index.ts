import fastifyAutoload from 'fastify-autoload';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import {connect} from 'mongoose';
import fastify from 'fastify';
import {join} from 'path';
import 'dotenv/config';
import axios from 'axios';

const server = fastify();

connect(process.env.MONGO_URI as string);

server.register(fastifyAutoload, {
  dir: join(__dirname, 'Routes'),
  options: {prefix: '/'},
});

server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, // for cookies signature
});

server.register(fastifyCors, {
  origin: 'https://www.safecord.xyz',
});

server.listen(process.env.PORT ?? 3000, '0.0.0.0', async (err, address) => {
  if (err) {
    throw err;
  }

  if (process.env.MODE !== 'DEV') {
    // eslint-disable-next-line
    void axios.post('https://discord.com/api/webhooks/909681201500024832/eKlEapA_3mfKQzoV31qZnvR_VxxR4VRW1KiVkZrbD_WAkmXLE_uF76A_hAQK6SVpf5OE', {
      content: 'Launched on server!',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  console.log(`Listening on ${address}`);
  console.log(`Go to http://127.0.0.1:${process.env.PORT ?? 3000} to view it.`);
});
