import {FastifyInstance} from 'fastify';
import {guildParams} from '../Interfaces/MongoRouter';
import {Guild} from '../Models/Guild';

export default async (fastify: FastifyInstance) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fastify.patch<{Params: guildParams; Body: any}>('/guilds/:id', async (req, reply) => {
    if (req.headers['authorization'] !== '89aLG9EEsWKgTzZio1ZW') {
      return reply.code(401).send({
        error: 'Unauthorized',
      });
    }

    Guild.findOneAndUpdate({_id: req.params.id}, {...req.body}, {upsert: true}, (err, guild) => {
      if (err) {
        reply.send({error: err});
      }
      reply.send({success: true, guild});
    });
  });

  fastify.get<{Params: guildParams}>('/guilds/:id', async (req, res) => {
    if (req.headers['authorization'] !== '89aLG9EEsWKgTzZio1ZW') {
      return res.code(401).send({
        error: 'Unauthorized',
      });
    }

    const guild = await Guild.findOne({_id: req.params.id});

    if (guild) return res.status(200).send({guild});
    else return res.status(404).send({error: 'Could not find guild!'});
  });
};

export const autoPrefix = '/mongo';
