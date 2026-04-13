import React, {useEffect, useRef, useState} from 'react';
import {Match, PlayerDetails, Team} from "../models/Models";
import API from "../util/API";
import PlayerCard from "./PlayerCard";
import {useGlobalState} from "../contexts/GlobalStateContext";
import {
    aggregateMapDistributions,
    calculateLifetimeMapDistribution,
    calculateStats,
    FindUniqueMatchesInArray,
    isSteamID64
} from "../util/Convertions";
import MatchesPlayedTogether from "./MatchesPlayedTogether";
import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import ExtractTeamButton from "./ExtractTeam";
import PowerStatsVetoStats from "./PowerStatsVetoStats";

const MATCHES_PER_PLAYER_SEARCH_AMOUNT = 100;
const FACEIT_CONCURRENCY = Number(process.env.REACT_APP_FACEIT_CONCURRENCY ?? 3);
const MATCH_HISTORY_CONCURRENCY = Number(process.env.REACT_APP_MATCH_HISTORY_CONCURRENCY ?? 3);

const TeamLayout: React.FC<{ team: Team | undefined }> = ({team}) => {
    const {state, dispatch} = useGlobalState();
    const [players, setPlayers] = useState<PlayerDetails[]>([]);
    const [matchHistory, setMatchHistory] = useState<Match[]>([]);
    const [teamMatches, setTeamMatches] = useState<Match[]>();
    const [showFetch, setShowFetch] = useState<boolean>(true);
    const [noRelevantPlayers, setNoRelevantPlayers] = useState<number>(3);

    const playerCache = useRef<Map<string, PlayerDetails>>(new Map());
    const activeRequestId = useRef(0);

    useEffect(() => {
        if (team) {
            setShowFetch(true);
            setMatchHistory([]);
            setTeamMatches(undefined);
            fetchFaceitIds(team.steam_ids);
        } else {
            setPlayers([]);
            setMatchHistory([]);
            setTeamMatches(undefined);
        }
    }, [team]);

    const intersection = (arrA: Array<any>, arrB: Array<any>) => arrA.filter(x => arrB.includes(x));

    const findRelevantMatches = (list: Match[], currentPlayers: PlayerDetails[]) => {
        const relevantMatches: Match[] = [];
        const uniqueMatches = FindUniqueMatchesInArray(list);
        const playerIds = currentPlayers.map((p) => p.player_id);

        uniqueMatches.forEach((match) => {
            const matches = intersection(match.playing_players, playerIds);

            if (matches.length >= noRelevantPlayers) {
                relevantMatches.push(match);
            }
        });

        setTeamMatches(relevantMatches);
    };

    const calculateAverageElo = (players: PlayerDetails[]) => {
        const totalElo = players.reduce((acc, player) => acc + player.faceit_elo, 0);
        return totalElo / players.length;
    };

    const mapWithConcurrency = async <T, R>(
        items: T[],
        concurrency: number,
        mapper: (item: T, index: number) => Promise<R>
    ): Promise<R[]> => {
        const results: R[] = new Array(items.length);
        let currentIndex = 0;

        const workers = Array.from(
            {length: Math.min(concurrency, items.length)},
            async () => {
                while (true) {
                    const index = currentIndex++;
                    if (index >= items.length) {
                        break;
                    }

                    results[index] = await mapper(items[index], index);
                }
            }
        );

        await Promise.all(workers);
        return results;
    };

    const fetchPlayerDetails = async (player: string | number): Promise<PlayerDetails | null> => {
        let steamID = player.toString();

        if (!isSteamID64(steamID)) {
            try {
                const resp = await API.FACEIT.getSteamID64(steamID);
                steamID = resp.data.steamID;
            } catch (err) {
                console.log(`Error fetching SteamID64 for player ${player}:`, err);
                return null;
            }
        }

        const cached = playerCache.current.get(steamID);
        if (cached) {
            return cached;
        }

        try {
            const resp = await API.FACEIT.getFaceitID(steamID);
            const faceit_id = resp.data.player_id;

            const [stats, lifetimeStats] = await Promise.all([
                API.FACEIT.getFaceitStats(faceit_id),
                API.FACEIT.getFaceitLifetimeStats(faceit_id),
            ]);

            const playerDetails: PlayerDetails = {
                nickname: resp.data.nickname,
                faceit_elo: resp.data.games.cs2.faceit_elo,
                faceit_level: resp.data.games.cs2.skill_level,
                player_id: resp.data.player_id,
                steam_64: resp.data.games.cs2.game_player_id,
                steam_id: resp.data.platforms?.steam ?? 'Unknown',
                faceit_url: `https://www.faceit.com/en/players/${resp.data.nickname}`,
                stats: calculateStats(stats.data),
                lifetimeMapDistribution: calculateLifetimeMapDistribution(lifetimeStats.data)
            };

            playerCache.current.set(steamID, playerDetails);
            return playerDetails;
        } catch (err) {
            console.log(`Error fetching Faceit data for player ${steamID}:`, err);
            return null;
        }
    };

    const fetchFaceitIds = async (playerList: (string | number)[]) => {
        const requestId = ++activeRequestId.current;
        dispatch({type: 'setLoading', state: true});

        try {
            const results = await mapWithConcurrency(
                playerList,
                FACEIT_CONCURRENCY,
                async (player) => fetchPlayerDetails(player)
            );

            if (requestId !== activeRequestId.current) {
                return;
            }

            const validPlayers = results.filter((player): player is PlayerDetails => player !== null);
            setPlayers(validPlayers);
        } catch (err) {
            if (requestId === activeRequestId.current) {
                console.error("Error fetching players:", err);
            }
        } finally {
            if (requestId === activeRequestId.current) {
                dispatch({type: 'setLoading', state: false});
            }
        }
    };

    const fetchMatchesForAllPlayers = async () => {
        dispatch({type: 'setLoading', state: true});

        try {
            const currentPlayers = [...players];

            const responses = await mapWithConcurrency(
                currentPlayers,
                MATCH_HISTORY_CONCURRENCY,
                async (player) => API.FACEIT.getPlayerGameHistory(player.player_id, MATCHES_PER_PLAYER_SEARCH_AMOUNT)
            );

            const collectedData = responses.map((resp) => resp.data.items).flat();

            findRelevantMatches(collectedData, currentPlayers);
            setMatchHistory(collectedData);
        } catch (error) {
            console.error(error);
        } finally {
            dispatch({type: 'setLoading', state: false});
        }
    };

    if (!team) {
        return null;
    }

    const aggregatedResult = aggregateMapDistributions(players);
    const sortedPlayers = [...players].sort((a, b) => b.faceit_elo - a.faceit_elo);

    return (
        <div className={'pt-4'}>
            <h2>Team {team.name}</h2>

            <div className={'d-flex gap-2 flex-wrap'}>
                <span className="badge bg-danger">Players: {team.steam_ids.length}</span>

                {team.league && <span className="badge bg-info">League: {team.league}</span>}

                {players.length > 0 && (
                    <span className="badge bg-primary">
                        Average Elo: {Math.round(calculateAverageElo(players))}
                    </span>
                )}

                {team.power_team_id && (
                    <a
                        href={`https://powerstats.dk/team/${team.power_team_id}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <span className="badge bg-secondary">PowerStats</span>
                    </a>
                )}

                <ExtractTeamButton steamIds={team.steam_ids}/>
            </div>

            <div className={'row gy-3 py-3'}>
                {sortedPlayers.map((player) => {
                    return (
                        <div className={'col'} key={player.player_id}>
                            <PlayerCard player={player}/>
                        </div>
                    );
                })}
            </div>

            <PowerStatsVetoStats vetoStats={team.power_veto_stats}/>

            {players.length > 0 && (
                <div className="row justify-content-center">
                    <p>FaceIT map distribution</p>
                    {Object.entries(aggregatedResult).slice(0, 8).map(([map, pct]) => (
                        <div key={map} className="col-auto text-center mb-4">
                            <div className="p-3 bg-light border rounded shadow-sm">
                                <p className="mb-1 text-uppercase font-weight-bold">{map}</p>
                                <p className="mb-0">{pct}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={(!showFetch ? 'd-none' : 'd-block')} style={{width: '15rem'}}>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    fetchMatchesForAllPlayers();
                    setShowFetch(false);
                }}>
                    <InputGroup className="mb-3">
                        <FormControl
                            type={"number"}
                            value={noRelevantPlayers}
                            min="2"
                            max="5"
                            onChange={(e) => setNoRelevantPlayers(parseInt(e.target.value))}
                            aria-describedby="basic-addon2"
                        />
                        <Button variant={"outline-success"} type="submit">
                            Fetch match statistics
                        </Button>
                    </InputGroup>
                </Form>
            </div>

            {(matchHistory && teamMatches) && (
                <MatchesPlayedTogether
                    playerCount={noRelevantPlayers}
                    allMatches={matchHistory}
                    matches={teamMatches}
                    players={players}
                />
            )}
        </div>
    );
};

export default TeamLayout;