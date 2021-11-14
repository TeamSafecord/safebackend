import {FastifyInstance} from 'fastify';
import {CaptchaGenerator} from 'captcha-canvas';
import {genCaptcha} from '../Interfaces/GenRouter';
import {generateRandomString} from '../Utils/Generate';

export default async (server: FastifyInstance) => {
  server.post<{Body: genCaptcha}>('/captcha', async (request, reply) => {
    const captchaText = generateRandomString(request.body?.difficulty ?? 6);
    const captchaGen = new CaptchaGenerator({height: 200, width: 600});
    captchaGen.setCaptcha({text: captchaText});
    captchaGen.setDecoy({total: request.body?.difficulty * 2 ?? 12});

    const captchaBuffer = await captchaGen.generate();

    reply.send({
      statusCode: 200,
      data: {
        captchaBuffer,
        captchaText,
      },
    });
  });
};

export const autoPrefix = '/gen';
