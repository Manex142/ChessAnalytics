import Fastify, {FastifyReply, FastifyRequest} from 'fastify';
import swagger from "@fastify/swagger";
import swaggerUI from '@fastify/swagger-ui';

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
const PORT = 3000;

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

fastify.get("/chess/top10", (request: FastifyRequest, reply: FastifyReply): void => {
    reply.send("Hello World")
})

fastify.listen({ port: PORT }, (err, address: string): void => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
})