import axios from "axios";
import {
    FaceitLifetimeStatsDTO,
    FaceitStatsDTO_DataStructure,
    MatchResponsePaginated,
    MatchStatsResponse,
    VoteHistoryResponse
} from "../models/Models";

axios.defaults.headers.common['Authorization'] = `Bearer ${process.env.REACT_APP_FACEIT_API_KEY}`;

export default {
    FACEIT: {
        getSteamID64: (customURL: string) => {
            return axios.post('https://tradeit.gg/api/steam/v1/steams/id-finder', {id: customURL})
        },
        getFaceitStats: (player_id: string | number) => {
            return axios.get<FaceitStatsDTO_DataStructure>(`https://open.faceit.com/data/v4/players/${player_id}/games/cs2/stats`)
        },
        getFaceitLifetimeStats: (player_id: string | number) => {
            return axios.get<FaceitLifetimeStatsDTO>(`https://open.faceit.com/data/v4/players/${player_id}/stats/cs2`)
        },
        getFaceitID: (player: string | number) => {
            return axios.get('https://open.faceit.com/data/v4/players?game=cs2&game_player_id=' + player);
        },
        getPlayerGameHistory: (faceitID: string, limit: number) => {
            return axios.get<MatchResponsePaginated>(`https://open.faceit.com/data/v4/players/${faceitID}/history?game=cs2&offset=0&limit=${limit}`);
        },
        getMatchStatistics: async (matchID: string) => {
            return await axios.get<MatchStatsResponse>(`https://open.faceit.com/data/v4/matches/${matchID}/stats`);
        },
        getMatchVoteHistory: async (matchID: string) => {
            return await axios.get<VoteHistoryResponse>(`/democracy/v1/match/${matchID}/history`, {
                headers: {
                    'Authorization': '',
                },
            });
        },
    }
}
