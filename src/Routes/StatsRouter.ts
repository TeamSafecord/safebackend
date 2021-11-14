import {FastifyInstance} from 'fastify';
import {botPost} from '../Interfaces/bot';
import * as mongoose from 'mongoose';

export default async (server: FastifyInstance) => {
  const Schema = mongoose.Schema;

  const stats = new Schema({
    botID: Number,
    guilds: Number,
  });

  const sModel = mongoose.model('stats', stats);
  server.get('/stats', async (request, reply) => {
    async function getStats() {
      try {
        const result = await sModel.find({
          botID: '908904270978494514',
        });
        let guildNum;

        if (typeof result[0].guilds == 'undefined') {
          guildNum = 0;
        } else {
          guildNum = result[0].guilds;
        }

        return guildNum || false;
      } catch (error) {
        return 0;
      }
    }

    reply.send({
      statusCode: 200,
      data: {
        guilds: await getStats(),
      },
    });
  });

  server.post<{Body: botPost}>('/stats', async (request, reply) => {
    if (request.headers.authorization === `163__0oursupersecurepassw0rd@*29::DAcX`) {
      try {
        try {
          await sModel.findOneAndUpdate(
              {
                botID: '908904270978494514',
              },
              {
                guilds: request.body?.guilds ?? 0,
              },
              {
                upsert: true,
                new: true,
              },
          );
        } catch (error) {
          console.trace(error);
        }

        reply.send({
          statusCode: 200,
          message: 'sent!',
        });
      } catch {
        reply.send({
          statusCode: 400,
          message: 'error!',
        });
      }
    } else {
      reply.send({
        statusCode: 400,
        message: 'not the right password bro',
      });
    }
  });
};

export const autoPrefix = '/bot';
