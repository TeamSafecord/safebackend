import axios from 'axios';
import {FastifyInstance} from 'fastify';
import {guildParams} from '../Interfaces/MongoRouter';
import {Guild} from '../Models/Guild';

export default async (fastify: FastifyInstance) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fastify.patch<{Params: guildParams; Body: any}>('/guild/:id', async (req, reply) => {
    axios.post(
        // eslint-disable-next-line max-len
        'https://discord.com/api/webhooks/909958414787047436/a2Ozp5bJF_Vnvhqb2wg9VWVVW3PIl2GPB8jA5kX-ZYsDV2Sdt3ejN2EBUNcGgetLW4FW', {
          content: `${
            (
              req.headers['authorization'] !== process.env.BACKEND_API_KEY ?? '89aLG9EEsWKgTzZio1ZW'
            ).toString()
          }
          ${
            (
              req.headers['authorization'] != '89aLG9EEsWKgTzZio1ZW'
            ).toString() 
          }
          ${
            (req.headers['authorization']?.trim() != '89aLG9EEsWKgTzZio1ZW')
          }
          `,
        });

    if (req.headers['authorization'] !== process.env.BACKEND_API_KEY ?? '89aLG9EEsWKgTzZio1ZW') {
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
};

export const autoPrefix = '/mongo';
