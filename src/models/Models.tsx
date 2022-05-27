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
