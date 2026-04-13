// src/util/powerstats.ts

export interface PowerStatsTeamDetails {
    teamId: string;
    teamName: string;
    teamLogo?: string | null;
    ownerId?: string | null;
    season: number;
    division?: string | null;
    twitter?: string | null;
    coachID?: string | null;
    website?: string | null;
    playsInLigaen?: boolean;
}

export const extractPowerStatsTeamId = (input: string): string | null => {
    const trimmed = input.trim();

    // Raw team id support
    if (/^[a-f0-9]{24}$/i.test(trimmed)) {
        return trimmed;
    }

    // URL support:
    // https://powerstats.dk/team/677c45b15d1a61cd9c5d6ea9
    // https://powerstats.dk/team/677c45b15d1a61cd9c5d6ea9?season=31
    const match = trimmed.match(/powerstats\.dk\/team\/([a-f0-9]{24})/i);
    return match ? match[1] : null;
};

export const getLatestPowerStatsSeason = async (): Promise<number> => {
    const response = await fetch(
        'https://api.powerstats.dk/PowerStats/api/Match/latestSeason'
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch latest PowerStats season: ${response.status}`);
    }

    const data = await response.json();

    if (typeof data === 'number') {
        return data;
    }

    if (typeof data?.season === 'number') {
        return data.season;
    }

    if (typeof data?.latestSeason === 'number') {
        return data.latestSeason;
    }

    const parsed = Number(data);
    if (!Number.isNaN(parsed)) {
        return parsed;
    }

    throw new Error('Could not parse latest PowerStats season from API response');
};

export const getPowerStatsTeamByTeamIdAndSeason = async (
    teamId: string,
    season: number
): Promise<PowerStatsTeamDetails> => {
    const response = await fetch(
        `https://api.powerstats.dk/PowerStats/api/Team/getTeamByTeamIdAndSeason?teamId=${teamId}&season=${season}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch PowerStats team details: ${response.status}`);
    }

    return response.json();
};

export const getPowerStatsVetoStats = async (
    teamId: string,
    season: number
): Promise<any> => {
    const response = await fetch(
        `https://api.powerstats.dk/PowerStats/api/Match/getVetoStats?teamid=${teamId}&season=${season}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch PowerStats veto stats: ${response.status}`);
    }

    return response.json();
};

export const getPowerStatsPlayersByTeamId = async (
    teamId: string,
    season: number
): Promise<any> => {
    const response = await fetch(
        `https://api.powerstats.dk/PowerStats/api/PlayerStat/getPlayersByTeamId?teamid=${teamId}&season=${season}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch PowerStats players: ${response.status}`);
    }

    return response.json();
};

const findSteamIdInObject = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') {
        return null;
    }

    const record = obj as Record<string, unknown>;

    const candidateKeys = [
        'steamId',
        'steamID',
        'steamid',
        'steam_id',
        'playerSteamId',
        'playerSteamID',
        'playerSteamid',
    ];

    for (const key of candidateKeys) {
        const value = record[key];
        if (typeof value === 'string' && /^\d{17}$/.test(value)) {
            return value;
        }
        if (typeof value === 'number') {
            const asString = String(value);
            if (/^\d{17}$/.test(asString)) {
                return asString;
            }
        }
    }

    return null;
};

export const extractSteamIdsFromPowerStatsPlayersResponse = (data: any): string[] => {
    let players: any[] = [];

    if (Array.isArray(data)) {
        players = data;
    } else if (Array.isArray(data?.players)) {
        players = data.players;
    } else if (Array.isArray(data?.data)) {
        players = data.data;
    } else if (Array.isArray(data?.result)) {
        players = data.result;
    }

    const steamIds = players
        .map(findSteamIdInObject)
        .filter((id): id is string => Boolean(id));

    return Array.from(new Set(steamIds));
};