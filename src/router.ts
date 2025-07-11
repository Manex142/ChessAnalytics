import {FastifyError, FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {getTop10Opts, getUserOpts, getEnrichedUserOpts, getTopPlayerHistoryOpts} from "./schemas";

export default function router(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
        request.log.error(error, 'Unhandled exception occurred');
        if (error.validation) {
            if(request.routeOptions.url === '/chess/user') {
                reply.status(400).send({
                    error: 'Invalid or missing \'id\' parameter.'
                });
            } else if (request.routeOptions.url === '/chess/user/enriched') {
                reply.status(400).send({
                    error: 'Invalid or missing \'id\' or \'mode\' parameter.'
                });
            } else if (request.routeOptions.url === '/chess/topPlayerHistory') {
                reply.status(400).send({
                    error: 'Invalid or missing \'id\' or \'mode\' parameter.'
                });
            } else {
                reply.status(400).send({ error: 'Esto es un error genérico' })
            }
        } else {
            reply.status(error.statusCode || 500).send({ error: error.message });
        }
    });

    fastify.get("/chess/top10", getTop10Opts);
    fastify.get("/chess/user", getUserOpts);
    fastify.get("/chess/user/enriched", getEnrichedUserOpts);
    fastify.get("/chess/topPlayerHistory", getTopPlayerHistoryOpts);

    done();
}