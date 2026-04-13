import {Team} from "../models/Models";

const SAVED_TEAMS_KEY = "saved_teams";

const normalizeSteamIds = (steamIds: Team["steam_ids"]): string[] => {
    return steamIds.map((id) => String(id)).sort();
};

export const getTeamStorageKey = (team: Team): string => {
    if (team.power_team_id) {
        return `powerstats:${team.power_team_id}`;
    }

    if (team.url) {
        return `url:${team.url}`;
    }

    const normalizedSteamIds = normalizeSteamIds(team.steam_ids);

    if (normalizedSteamIds.length > 0) {
        return `steam:${normalizedSteamIds.join(",")}`;
    }

    return `name:${team.name.trim().toLowerCase()}`;
};

export const getSavedTeams = (): Team[] => {
    try {
        const raw = localStorage.getItem(SAVED_TEAMS_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch (error) {
        console.error("Failed to read saved teams from localStorage:", error);
        return [];
    }
};

export const saveTeams = (teams: Team[]): void => {
    try {
        localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams));
    } catch (error) {
        console.error("Failed to save teams to localStorage:", error);
    }
};

export const addOrMoveTeamToFront = (team: Team): Team[] => {
    const existingTeams = getSavedTeams();
    const teamKey = getTeamStorageKey(team);

    const filteredTeams = existingTeams.filter(
        (savedTeam) => getTeamStorageKey(savedTeam) !== teamKey
    );

    const updatedTeams = [team, ...filteredTeams];
    saveTeams(updatedTeams);

    return updatedTeams;
};

export const removeSavedTeam = (team: Team): Team[] => {
    const existingTeams = getSavedTeams();
    const teamKey = getTeamStorageKey(team);

    const updatedTeams = existingTeams.filter(
        (savedTeam) => getTeamStorageKey(savedTeam) !== teamKey
    );

    saveTeams(updatedTeams);
    return updatedTeams;
};

export const clearSavedTeams = (): void => {
    localStorage.removeItem(SAVED_TEAMS_KEY);
};