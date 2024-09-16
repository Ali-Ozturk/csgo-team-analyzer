import {
    CalculateStatsResult,
    FaceitStatsDTO_DataStructure,
    MapStats,
    Match,
    MatchStatsResponseRoundStats,
    PlayedMatchDetail
} from "../models/Models";

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
        GenerateMapStatsForGivenMap("de_anubis", matches),
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

export const isSteamID64 = (input: string) => {
    // SteamID64 should be a 17-digit number
    const steamID64Pattern = /^[0-9]{17}$/;

    return steamID64Pattern.test(input);
}

export const extractSteamIDs = (inputString: string) => {
    const steamID64Pattern = /^[0-9]{17}$/;
    const lines = inputString.split('\n'); // Split the input into lines
    const steamIDs : string[] = [];

    lines.forEach(line => {
        const words = line.split(/\s+/); // Split the line into words based on whitespace
        words.forEach(word => {
            if (steamID64Pattern.test(word)) {
                steamIDs.push(word); // Add valid SteamID64 to the array
            }
        });
    });

    return steamIDs;
}

export const calculateStats = (data: FaceitStatsDTO_DataStructure): CalculateStatsResult => {
    let totalADR = 0;
    let totalKills = 0;
    let totalKD = 0;
    let mapCount: { [map: string]: number} = {};
    let matchCount = data.items.length;

    data.items.forEach((item: any) => {
        const stats = item.stats;

        // Parse and sum ADR, Kills, K/D Ratio
        totalADR += parseFloat(stats.ADR);
        totalKills += parseInt(stats.Kills);
        totalKD += parseFloat(stats["K/D Ratio"]);

        // Count map appearances
        const map = stats.Map;
        if (mapCount[map]) {
            mapCount[map]++;
        } else {
            mapCount[map] = 1;
        }
    });

    // Sort the mapCount by the number of times played and get the top 3 maps
    const top3Maps = Object.entries(mapCount)
        .sort((a, b) => b[1] - a[1]) // Sort by count (descending order)
        .slice(0, 3)                  // Take the top 3 maps
        .map(([map, count]) => ({ map, count })); // Convert to { map, count } objects

    // Calculate averages
    const averageADR = totalADR / matchCount;
    const averageKills = totalKills / matchCount;
    const averageKD = totalKD / matchCount;

    return {
        averageADR: averageADR.toFixed(2),
        averageKills: averageKills.toFixed(2),
        averageKD: averageKD.toFixed(2),
        mapCount: mapCount,
        top3Maps: top3Maps
    };
}