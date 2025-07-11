import {getTop10Handler, getUserHandler, getEnrichedUserHandler, getTopPlayerHistoryHandler} from "./handlers";

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
    handler: getTop10Handler
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
    handler: getUserHandler
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
    handler: getEnrichedUserHandler
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
    handler: getTopPlayerHistoryHandler
}