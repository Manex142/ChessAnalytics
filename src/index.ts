import Fastify from 'fastify';
import swagger from "@fastify/swagger";
import swaggerUI from '@fastify/swagger-ui';
import dotenv from 'dotenv';

dotenv.config();
const PORT: number = parseInt(process.env.PORT || "3000", 10);
const fastify = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname'
            }
        }
    }
});

const getUserOpts = {
    schema: {
        querystring: {
            type: 'object',
            properties: {
                id: { 'type': 'string', 'minLength': 1 }
            },
            required: ['id']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    perfs: { type: 'object', additionalProperties: true },
                    flair: { type: 'string' },
                    patron: { type: 'boolean' },
                    verified: { type: 'boolean' },
                    createdAt: { type: 'integer' },
                    profile: { type: 'object', additionalProperties: true },
                    seenAt: { type: 'integer' },
                    playTime: { type: 'object', additionalProperties: true }
                }
            }
        }
    }
}

fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Prueba de Fastify API',
            version: '1.0.0',
        },
    },
});
fastify.register(swaggerUI, {
    routePrefix: '/docs',
});

fastify.get("/chess/top10", async (request, reply) => {
    let result = await fetch(`https://lichess.org/api/player`);
    let data = await result.json();
    fastify.log.info(data);
    reply.send(data);
});

fastify.setErrorHandler((error, request, reply) => {
    if (error.validation) {
        if(request.routeOptions.url === '/chess/user') {
            reply.status(400).send({
                error: 'Invalid or missing \'id\' parameter.'
            });
        } else {
            reply.status(400).send({ error: 'Esto es un error genérico' })
        }
    } else {
        reply.status(error.statusCode || 500).send({ error: error.message });
    }
});

fastify.get("/chess/user", getUserOpts,async (request, reply) => {
    let { id } = request.query as { id: string };
    let result = await fetch(`https://lichess.org/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: id
    });
    let data = await result.json();
    if(data.length === 0) {
        reply.status(404).send({ error: 'User not found.' });
    }

    reply.send(data[0]);
});

fastify.listen({ port: PORT }, (err, address): void => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});