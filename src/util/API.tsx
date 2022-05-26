import axios from "axios";
import {MatchResponsePaginated, MatchStatsResponse, VoteHistoryResponse} from "../models/Models";

axios.defaults.headers.common['Authorization'] = "Bearer c635b735-b4af-4893-9298-c0ef3a56ae7f";

export default {
    FACEIT: {
        getFaceitID: (player: string | number) => {
            return axios.get('https://open.faceit.com/data/v4/players?game=csgo&game_player_id=' + player);
        },
        getPlayerGameHistory: (faceitID: string, limit: number) => {
            return axios.get<MatchResponsePaginated>(`https://open.faceit.com/data/v4/players/${faceitID}/history?game=csgo&offset=0&limit=${limit}`);
        },
        getMatchStatistics: async (matchID: string) => {
            return await axios.get<MatchStatsResponse>(`https://open.faceit.com/data/v4/matches/${matchID}/stats`);
        },
        getMatchVoteHistory: async (matchID: string) => {
            return await axios.get<VoteHistoryResponse>(`https://api.faceit.com/democracy/v1/match/${matchID}/history`, {
                headers: {
                    'Authorization': '',
                },
            });
        }
    }
}
