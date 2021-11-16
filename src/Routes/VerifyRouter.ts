import axios from 'axios';
import {FastifyInstance} from 'fastify';
import {hCaptchaBody} from '../Interfaces/VerifyRouter';
import {Guild} from '../Models/Guild';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              'user_id': {type: 'string'},
            },
            required: ['h-captcha-response', 'guild_id', 'user_id'],
          },
        },
      },
      async (request, reply) => {
        const data = (
          await axios.post(
              'https://hcaptcha.com/siteverify',
              encodeURL({
                secret: process.env.HCAPTCHA_SECRET,
                response: request.body['h-captcha-response'],
                hostname: 'safecord.xyz',
              }),
              {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
              },
          )
        ).data;

        if (data.success) {
          const guild = await Guild.findOne({_id: request.body.guild_id});

          if (!guild) return reply.status(400).send({error: 'Guild not found'});

          const req = await axios.post(
              'http://172.18.0.2:1337/bot/addRole',
              {
                guild_id: request.body.guild_id,
                user_id: request.body.user_id,
                role_id: guild.verificationRole,
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'authorization': process.env.BOT_API_KEY ?? 'qrtdrspZWv',
                },
              },
          );

          if (req.data.statusCode == 200) {
            reply.status(200).send({success: true});
          } else {
            reply.status(400).send({message: req.data.error});
          }
        } else {
          return reply.status(400).send({error: 'Invalid captcha'});
        }
      },
  );
};

export const autoPrefix = '/verify';
