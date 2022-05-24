import axios from "axios";
import {MatchResponsePaginated, MatchStatsResponse} from "../models/Models";

axios.defaults.headers.common['Authorization'] = "Bearer c635b735-b4af-4893-9298-c0ef3a56ae7f";

export default {
    FACEIT: {
        getFaceitID: (player: string | number) => {
            return axios.get('https://open.faceit.com/data/v4/players?game=csgo&game_player_id=' + player);
        },
        getPlayerGameHistory: (faceitID: string, limit: number) => {
            return axios.get<MatchResponsePaginated>(`https://open.faceit.com/data/v4/players/${faceitID}/history?game=csgo&offset=0&limit=${limit}`);
        },
        getMatchStatistics: (matchID: string) => {
            return axios.get<MatchStatsResponse>(`https://open.faceit.com/data/v4/matches/${matchID}/stats`);
        },
    }
}
