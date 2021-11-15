import axios from 'axios';
import {FastifyInstance} from 'fastify';
import {hCaptchaBody} from '../Interfaces/VerifyRouter';

function encodeURL(opts: any): string {
  return Object.keys(opts)
      .map((key) => `${key}=${encodeURIComponent(opts[key])}`)
      .join('&');
}

export default async (server: FastifyInstance) => {
  server.post<{Body: hCaptchaBody}>(
      '/hcaptcha',
      {
        schema: {
          body: {
            type: 'object',
            properties: {
              'h-captcha-response': {type: 'string'},
              'guild_id': {type: 'string'},
            },
            required: ['h-captcha-response', 'guild_id'],
          },
        },
      },
      async (request, reply) => {
        const data = (await axios.post('https://hcaptcha.com/siteverify',
            encodeURL({
              secret: process.env.HCAPTCHA_SECRET,
              response: request.body['h-captcha-response'],
              hostname: 'safecord.xyz',
            }),
            {
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            }
        )).data;

        return reply.send(data);
      }
  );
};

export const autoPrefix = '/verify';
