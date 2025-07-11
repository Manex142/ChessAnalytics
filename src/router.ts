import {FastifyInstance} from "fastify";


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
                    id: {type: 'string'},
                    username: {type: 'string'},
                    modes: {type: 'object', additionalProperties: true},
                    flair: {type: 'string'},
                    patron: {type: 'boolean'},
                    verified: {type: 'boolean'},
                    createdAt: {type: 'integer'},
                    profile: {type: 'object', additionalProperties: true},
                    seenAt: {type: 'integer'},
                    playTime: {type: 'object', additionalProperties: true}
                },
                additionalProperties: false
            },
            400: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            }
        }
    }
}

const getEnrichedUserOpts = {
    schema: {
        querystring: {
            type: 'object',
            properties: {
                id: { 'type': 'string', 'minLength': 1 },
                mode: { 'type': 'string', 'minLength': 1 }
            },
            required: ['id', 'mode']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    username: { type: 'string' },
                    profile: { type: 'object', additionalProperties: true },
                    playTime: { type: 'object', additionalProperties: true },
                    rank: { type: ['integer', 'null'] },
                    resultStreak: {
                        type: 'object',
                        properties: {
                            wins: {
                                type: 'object',
                                properties: {
                                    current: { type: 'integer' },
                                    max: { type: 'integer' }
                                }
                            },
                            losses: {
                                type: 'object',
                                properties: {
                                    current: { type: 'integer' },
                                    max: { type: 'integer' }
                                }
                            }
                        }
                    }
                },
                required: ['id', 'username', 'profile', 'playTime', 'rank', 'resultStreak'],
                additionalProperties: false
            },
            400: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            },
        }
    }
}

export default function router(fastify: FastifyInstance, options: any, done: () => void) {
    fastify.get("/chess/top10", async (request, reply) => {
        let result = await fetch(`https://lichess.org/api/player`);
        let data = await result.json();
        fastify.log.info(data);
        reply.send(data);
    });

    fastify.setErrorHandler((error, request, reply) => {
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
            } else {
                reply.status(400).send({ error: 'Esto es un error genérico' })
            }
        } else {
            reply.status(error.statusCode || 500).send({ error: error.message });
        }
    });

    fastify.get("/chess/user", getUserOpts, async (request, reply) => {
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
        const { perfs, ...rest } = data[0];

        reply.send({
            ...rest,
            modes: perfs
        });
    });

    fastify.get("/chess/user/enriched", getEnrichedUserOpts, async (request, reply) => {
        let { id } = request.query as { id: string };
        let result = await fetch(`https://lichess.org/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: id
        });
        let userData = await result.json();
        if (userData.length === 0) {
            reply.status(404).send({ error: 'User or Game Mode not found.' });
            return;
        }
        let username = userData[0].username;
        let { mode } = request.query as { mode: string };
        if (!mode) {
            mode = 'blitz';
        }
        result = await (fetch(`https://lichess.org/api/user/${username}/perf/${mode}`));
        let performanceData = await result.json();

        let response = {
            id,
            username: userData[0].username,
            profile: userData[0].profile,
            playTime: userData[0].playTime,
            rank: performanceData.rank,
            resultStreak: {
                wins: {
                    current: performanceData.stat.resultStreak.win.cur.v,
                    max: performanceData.stat.resultStreak.win.max.v
                },
                losses: {
                    current: performanceData.stat.resultStreak.loss.cur.v,
                    max: performanceData.stat.resultStreak.loss.max.v
                }
            }
        }

        reply.send(response);
    });

    done();
}