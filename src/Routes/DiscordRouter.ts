import {randomBytes} from 'node:crypto';
import {FastifyInstance} from 'fastify';

import {URL} from '../Utils/Constants';
import axios from 'axios';
import Session from '../Models/Session';

interface IQuerystring {
  state: string;
  code: string;
}

interface IAuthQuerystring {
  redirect: string;
}

interface Details {
  [key: string]: string;
  client_id: string;
  client_secret: string;
  grant_type: string;
  redirect_uri: string;
  code: string;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

const redirects = new Map<string, string>();

export default async (server: FastifyInstance) => {
  server.get<{Querystring: IAuthQuerystring}>('/auth', async (request, reply) => {
    // Generate a cryptographically secure token and store it
    // in a cookie, then direct the user to discord
    const nonce = randomBytes(16).toString('base64');

    redirects.set(nonce, request.query.redirect);

    setTimeout(() => redirects.delete(request.query.redirect), 1000 * 60 * 5);

    reply.setCookie('session', encodeURIComponent(nonce), {path: '/'});
    reply.redirect(URL + `&state=${encodeURIComponent(nonce)}`);
  });

  server.get<{
    Querystring: IQuerystring;
  }>('/redirect', async (request, reply) => {
    const session = request.cookies.session;
    const state = request.query.state?.toString();

    if (!session || !state || decodeURIComponent(session) !== decodeURIComponent(state)) {
      return reply.redirect(URL);
    }
    const redirect = redirects.get(decodeURIComponent(session));

    if (!redirect) return reply.redirect(URL);

    const code = request.query.code;
    if (!code) return reply.redirect(URL);

    const details: Details = {
      client_id: process.env.CLIENT_ID as string,
      client_secret: process.env.CLIENT_SECRET as string,
      grant_type: 'authorization_code',
      redirect_uri: process.env.REDIRECT_URI as string,
      code,
    };

    let formBody: string | string[] = [];
    // eslint-disable-next-line guard-for-in
    for (const prop in details) {
      const key = encodeURIComponent(prop);
      const value = encodeURIComponent(details[prop]);
      formBody.push(key + '=' + value);
    }

    formBody = formBody.join('&');

    const res = await axios
        .post('https://discord.com/api/v9/oauth2/token', formBody, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .catch(() => {
          console.warn('fuck eslint');
        });

    if (!res) return reply.redirect(URL);

    const nonce = randomBytes(16).toString('base64');

    const newSession = new Session({
      nonce,
      accessToken: (res.data as unknown as TokenResponse).access_token,
    });

    await newSession.save();

    // Set a cookie that expires in 2 hours
    reply.setCookie('access', nonce, {
      path: '/',
      domain: 'https://www.safecord.xyz',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
    });

    reply.redirect(`https://safecord.xyz${redirect}`);
  });
};

export const autoPrefix = '/discord';
