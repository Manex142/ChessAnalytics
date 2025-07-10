import Fastify from 'fastify';
import swagger from "@fastify/swagger";
import swaggerUI from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import router from './router';

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
fastify.register(router);

fastify.listen({ port: PORT }, (err, address): void => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});