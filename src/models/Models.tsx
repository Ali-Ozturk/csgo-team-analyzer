import {calculateStats} from "../util/Convertions";

export interface MapStats {
    map: string;
    count: number;
    wins: number;
    loss: number;
    winPercentage: number;
}

export interface PlayerDetails {
    nickname: string;
    faceit_elo: number;
    faceit_level: number;
    player_id: string;
    steam_64: string;
    steam_id?: string;
    faceit_url: string;
    stats?: CalculateStatsResult;
    lifetimeMapDistribution?: LifetimeMapDistribution[];
}

export interface Team {
    name: string;
    steam_ids: string[] | number[];
    league?: string;
    url?: string;
}

export interface TeamDetailed extends Team {
    players?: PlayerDetails[];
    maps?: MapStats[];
}

export interface MatchResponsePaginated {
    end: number;
    from: number;
    items: Match[];
    start: number;
    to: number;
}

export interface Match {
    match_id: string;
    playing_players: string[];
    started_at: number;
    finished_at: number;
    faceit_url: string;

    results: {
        winner: string;
    }
    teams: {
        faction1: TeamFraction;
        faction2: TeamFraction;
    }
}

export interface TeamFraction {
    nickname: string;
    players: PlayerFraction[];
    team_id: string;
}

export interface PlayerFraction {
    avatar: string;
    faceit_url: string;
    game_player_id: string;
    game_player_name: string;
    nickname: string;
    player_id: string;
    skill_level: number;
}

export interface MatchStatsResponse {
    rounds: {
        round_stats: MatchStatsResponseRoundStats;
        teams: { players: PlayerDetails, team_id: string }[]
    }[]
}

export interface MatchStatsResponseRoundStats {
    Map: string;
    Rounds: string;
    Score: string;
    Winner: string;
}


export interface VoteHistoryEntity {
    guid: string;
    status: string;
    random: boolean;
    round: number;
    selected_by: "faction1" | "faction2";
}

export interface VoteHistoryTicket {
    entities: VoteHistoryEntity[];
    entity_type: string;
    vote_type: string;
}

export interface VoteHistoryPayload {
    match_id: string;
    tickets: VoteHistoryTicket[];
}

export interface VoteHistoryResponse {
    payload: VoteHistoryPayload;
}

export type PlayedMatchDetail = {
    match_id: string;
    faceit_url: string;
    date: Date;
    round_stats: MatchStatsResponseRoundStats;
    isWinner: boolean;
    votesByTeam: VoteHistoryEntity[];
}


export interface FaceitStatsDTO_Stats {
    ADR: string;
    Team: string;
    "Quadro Kills": string;
    Region: string;
    "Player Id": string;
    Headshots: string;
    Damage: string;
    Deaths: string;
    "Triple Kills": string;
    "Flash Successes": string;
    "Best Of": string;
    Result: string;
    "Sniper Kills": string;
    "Game Mode": string;
    "Utility Successes": string;
    Assists: string;
    Map: string;
    MVPs: string;
    "1v1Wins": string;
    "Zeus Kills": string;
    "Match Round": string;
    "Entry Wins": string;
    "1v2Count": string;
    "Pistol Kills": string;
    "Penta Kills": string;
    "Updated At": string;
    "Second Half Score": string;
    "Headshots %": string;
    "Enemies Flashed": string;
    "Utility Enemies": string;
    "Utility Count": string;
    "First Kills": string;
    "First Half Score": string;
    "K/R Ratio": string;
    Kills: string;
    "Flash Count": string;
    "Clutch Kills": string;
    "Double Kills": string;
    "1v2Wins": string;
    Score: string;
    Rounds: string;
    Nickname: string;
    "K/D Ratio": string;
    "Entry Count": string;
    "Match Id": string;
    "Utility Damage": string;
    "Created At": string;
    "Knife Kills": string;
    "Final Score": string;
    "1v1Count": string;
    "Overtime score": string;
    "Competition Id": string;
    Winner: string;
    Game: string;
}

export interface FaceitStatsDTO_Item {
    stats: FaceitStatsDTO_Stats;
}

export interface FaceitStatsDTO_DataStructure {
    items: FaceitStatsDTO_Item[];
}

export interface FaceitLifetimeStatsDTO_segment {
    img_regular: string;
    label: string;
    stats: {
        "Wins": number;
        "Matches": number;
    }
}
export interface FaceitLifetimeStatsDTO {
    lifetime: any;
    segments: FaceitLifetimeStatsDTO_segment[]
}

interface TopMap {
    map: string;
    count: number;
}

export interface CalculateStatsResult {
    averageADR: string;
    averageKills: string;
    averageKD: string;
    mapCount: {
        [key: string]: number; // Map name as key, count of occurrences as value
    };
    top3Maps: TopMap[]; // Array of objects for the top 3 most played maps
}

export interface LifetimeMapDistribution {
    map: string;
    played: number;
    wins: number;
    loss: number;
    pctDistribution: number;
}