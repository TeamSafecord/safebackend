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
interface Guild {
  id: string;
  name: string;
  owner: boolean;
  permissions: string;
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

interface GuildId {
  gid: string;
}

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
    const redirect = redirects.get(decodeURIComponent(session)) || 'https://safecord.xyz/';

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

    reply.setCookie('access', nonce, {
      domain: 'safecord.xyz',
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 2),
    });

    reply.redirect(`https://safecord.xyz${redirect}`);
  });

  server.get('/user', async (request, reply) => {
    const token = request.cookies.access;

    if (!token) return reply.status(404).send({error: 'Missing token!'});

    const doc = await Session.findOne({nonce: token});
    if (!doc) return reply.status(403).send({error: 'User doesn\'t have a valid token!'});

    const res = await axios
        .get('https://discord.com/api/v9/users/@me', {
          headers: {
            Authorization: `Bearer ${doc.accessToken}`,
          },
        })
        .catch(() => console.log('fuck eslint'));

    if (!res) return reply.status(401).send({error: 'Invalid Token!'});

    return reply.status(200).send(res.data);
  });

  server.get('/guilds', async (request, reply) => {
    const token = request.cookies.access;

    if (!token) return reply.status(404).send({error: 'Missing token!'});

    const doc = await Session.findOne({nonce: token});
    if (!doc) return reply.status(403).send({error: 'User doesn\'t have a valid token!'});

    const userGuilds = await axios
        .get<Guild[]>('https://discord.com/api/v9/users/@me/guilds', {
          headers: {
            Authorization: `Bearer ${doc.accessToken}`,
          },
        })
        .catch(() => console.warn('fuck eslint'));

    const botGuilds = await axios
        .get<Guild[]>('https://discord.com/api/v9/users/@me/guilds', {
          headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
          },
        })
        .catch(() => console.log('fuck eslint'));

    if (!userGuilds) return reply.status(401).send({error: 'Invalid Token!'});
    if (!botGuilds) return reply.status(500).send({error: 'Cannot fetch bot guilds!'});

    const ids = botGuilds.data.map((g) => g.id);

    const usableGuilds = userGuilds.data.filter(
        (g) => (BigInt(g.permissions) & BigInt(1 << 5)) === BigInt(1 << 5),
    );

    const mutualGuilds = usableGuilds.filter((g) => ids.includes(g.id));
    const rest = usableGuilds.filter((g) => !ids.includes(g.id));

    doc.guilds = mutualGuilds;
    doc.markModified('guilds');
    await doc.save();

    return reply.status(200).send({mutualGuilds, rest});
  });

  server.get<{Params: GuildId}>('/guilds/:gid', async (request, res) => {
    const guildId = request.params.gid;

    if (!guildId) return res.status(500).send({error: 'Couldn\'t find guild id!'});

    const guild = await axios.post('http://172.18.0.2:1753/bot/guild', {guild_id: guildId})
        .catch(() => console.warn('fuck eslint'));

    if (!guild) return res.status(404).send({error: 'Couldn\'t find that guild!'});

    return res.status(200).send({guild: guild.data.guild});
  });
};

export const autoPrefix = '/discord';
