import {MapStats, Match, MatchStatsResponseRoundStats, PlayedMatchDetail} from "../models/Models";

export const FindUniqueMatchesInArray = (allMatches: Match[]) => {
    // Ensure unique matches in case players have played in the same match
    return [...new Map(allMatches.map(item => [item['match_id'], item])).values()];
}

const CountWinsForMap = (map: string, list: PlayedMatchDetail[]) => {
    return list.filter((match => match.round_stats.Map === map && match.isWinner)).length
}

const CountLossForMap = (map: string, list: PlayedMatchDetail[]) => {
    return list.filter((match => match.round_stats.Map === map && !match.isWinner)).length
}

const CountWinPercentage = (map: string, list: PlayedMatchDetail[]): number => {
    const wins = CountWinsForMap(map, list);
    const loss = CountLossForMap(map, list);
    const totalMatches = wins + loss;

    return parseFloat((wins / totalMatches * 100).toFixed(2)) ?? 0;
}

const GenerateMapStatsForGivenMap = (map: string, matches: PlayedMatchDetail[]): MapStats => {
    return {
        map,
        count: matches.filter((m) => m.round_stats.Map === map).length,
        wins: CountWinsForMap(map, matches),
        loss: CountLossForMap(map, matches),
        winPercentage: CountWinPercentage(map, matches)
    }
}

export const CountMapDistribution = (matches: PlayedMatchDetail[]): MapStats[] => {

    return [
        GenerateMapStatsForGivenMap("de_ancient", matches),
        GenerateMapStatsForGivenMap("de_dust2", matches),
        GenerateMapStatsForGivenMap("de_inferno", matches),
        GenerateMapStatsForGivenMap("de_mirage", matches),
        GenerateMapStatsForGivenMap("de_nuke", matches),
        GenerateMapStatsForGivenMap("de_overpass", matches),
        GenerateMapStatsForGivenMap("de_vertigo", matches),
    ]
}


export const CountUniqueStringsInArray = (list: string[]) => {
    let counts: { [key: string]: number } = {};

    for (let i = 0; i < list.length; i++) {
        counts[list[i]] = 1 + (counts[list[i]] || 0);
    }

    // sort
    const sortableArray = Object.entries(counts);
    const sortedArray = sortableArray.sort(([, a], [, b]) => b - a);

    return sortedArray;
}
