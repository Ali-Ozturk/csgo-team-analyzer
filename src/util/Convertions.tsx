import {MapStats, Match, MatchStatsResponseRoundStats} from "../models/Models";

export const FindUniqueMatchesInArray = (allMatches: Match[]) => {
    // Ensure unique matches in case players have played in the same match
    return [...new Map(allMatches.map(item => [item['match_id'], item])).values()];
}

export const CountMapDistribution = (matches: MatchStatsResponseRoundStats[]) => {

    let MapDistribution: MapStats[] = [
        {map: 'de_ancient', count: matches.filter((m) => m.Map === 'de_ancient').length, wins: 0, loss: 0},
        {map: 'de_dust2', count: matches.filter((m) => m.Map === 'de_dust2').length, wins: 0, loss: 0},
        {map: 'de_inferno', count: matches.filter((m) => m.Map === 'de_inferno').length, wins: 0, loss: 0},
        {map: 'de_mirage', count: matches.filter((m) => m.Map === 'de_mirage').length, wins: 0, loss: 0},
        {map: 'de_nuke', count: matches.filter((m) => m.Map === 'de_nuke').length, wins: 0, loss: 0},
        {map: 'de_overpass', count: matches.filter((m) => m.Map === 'de_overpass').length, wins: 0, loss: 0},
        {map: 'de_vertigo', count: matches.filter((m) => m.Map === 'de_vertigo').length, wins: 0, loss: 0},
    ]

    console.log(MapDistribution);
    return MapDistribution;
}
