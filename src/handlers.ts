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

export const getTop10Handler =
    async (request: FastifyRequest, reply: FastifyReply) => {
        let result = await fetch(`https://lichess.org/api/player`);
        let data = await result.json();
        reply.send(data);
    }

export const getUserHandler =
    async (request: FastifyRequest, reply: FastifyReply) => {
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

export const getEnrichedUserHandler =
    async (request: FastifyRequest, reply: FastifyReply) => {
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

export const getTopPlayerHistoryHandler =
    async (request: FastifyRequest, reply: FastifyReply) => {
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