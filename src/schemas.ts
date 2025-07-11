import {FastifyReply, FastifyRequest} from "fastify";
enum GameMode {
    Bullet = "bullet",
    Blitz = "blitz",
    Rapid = "rapid",
    Classical = "classical",
    Correspondence = "correspondence",
    Chess960 = "chess960",
    KingOfTheHill = "king of the hill",
    ThreeCheck = "three-check",
    Antichess = "antichess",
    Atomic = "atomic",
    Horde = "horde",
    RacingKings = "racing kings",
    Crazyhouse = "crazyhouse",
    Puzzles = "puzzles",
    UltraBullet = "ultrabullet"
}
export const getTop10Opts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    bullet: { type: 'array' },
                    blitz: { type: 'array' },
                    rapid: { type: 'array' },
                    classical: { type: 'array' },
                    ultraBullet: { type: 'array' },
                    crazyhouse: { type: 'array' },
                    chess960: { type: 'array' },
                    kingOfTheHill: { type: 'array' },
                    threeCheck: { type: 'array' },
                    antichess: { type: 'array' },
                    atomic: { type: 'array' },
                    horde: { type: 'array' },
                    racingKings: { type: 'array' }
                },
                required: [
                    "bullet", "blitz", "rapid", "classical", "ultraBullet",
                    "crazyhouse", "chess960", "kingOfTheHill", "threeCheck",
                    "antichess", "atomic", "horde", "racingKings"
                ],
                additionalProperties: false
            }
        }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
        let result = await fetch(`https://lichess.org/api/player`);
        let data = await result.json();
        reply.send(data);
    }
};
export const getUserOpts = {
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
            },
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            }
        }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
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
    }
}
export const getEnrichedUserOpts = {
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
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            }
        }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
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
    }
}
export const getTopPlayerHistoryOpts = {
    schema: {
        querystring: {
            type: 'object',
            properties: {
                mode: { 'type': 'string', 'minLength': 1 },
                top: {
                    'type': 'integer',
                    minimum: 1,
                    maximum: 200
                },
            },
            required: ['mode', 'top']
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    history: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                date: { type: 'string', format: 'date-time' },
                                rating: { type: 'integer' }
                            }
                        }
                    }
                }
            },
            400: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            },
            404: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                },
                required: ['error'],
                additionalProperties: false
            }
        }
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
        let { mode, top } = request.query as { mode: string, top: number };
        if (!Object.values(GameMode).includes(mode as GameMode)) {
            reply.status(404).send({ error: `Game Mode not found.` });
            return;
        }
        let result = await fetch(`https://lichess.org/api/player/top/${top}/${mode}`);
        let topData = await result.json();
        let username = topData.users[0].username;
        result = await fetch(`https://lichess.org/api/user/${username}/rating-history`);
        let historyData = await result.json();
        let modeHistory = historyData.find((item: any) => item.name.toLowerCase() === mode);

        let response = {
            username,
            history: modeHistory.points.map((item: any) => ({
                date: new Date(item[0], item[1], item[2]).toISOString().split('T')[0],
                rating: item[3]
            }))
        }
        reply.send(response);
    }
}