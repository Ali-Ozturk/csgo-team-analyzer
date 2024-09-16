import React, {useEffect, useState} from 'react';
import {Match, PlayerDetails, Team} from "../models/Models";
import API from "../util/API";
import PlayerCard from "./PlayerCard";
import {useGlobalState} from "../contexts/GlobalStateContext";
import {calculateStats, FindUniqueMatchesInArray, isSteamID64} from "../util/Convertions";
import MatchesPlayedTogether from "./MatchesPlayedTogether";
import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import axios from "axios";
import ExtractTeamButton from "./ExtractTeam";

const MATCHES_PER_PLAYER_SEARCH_AMOUNT = 100;

const TeamLayout: React.FC<{ team: Team | undefined }> = ({team}) => {

        const {state, dispatch} = useGlobalState();
        const [players, setPlayers] = useState<PlayerDetails[]>([]);
        const [matchHistory, setMatchHistory] = useState<Match[]>([]);
        const [teamMatches, setTeamMatches] = useState<Match[]>();
        const [showFetch, setShowFetch] = useState<boolean>(true);
        const [noRelevantPlayers, setNoRelevantPlayers] = useState<number>(3);

        useEffect(() => {
            if (players.length < 1 && team) {
                fetchFaceitIds(team?.steam_ids);
            }
        }, [team])

        useEffect(() => {
            if (!team) {
                setPlayers([]);
            }
        }, [team])

        const intersection = (arrA: Array<any>, arrB: Array<any>) => arrA.filter(x => arrB.includes(x));

        const findRelevantMatches = (list: Match[]) => {
            let relevantMatches: Match[] = [];
            const uniqueMatches = FindUniqueMatchesInArray(list);


            uniqueMatches.forEach((match) => {
                let matches = intersection(match.playing_players, players.map((p) => p.player_id));

                // If at least two players found -> save to list
                if (matches.length >= noRelevantPlayers) {
                    relevantMatches.push(match);
                }
            });

            setTeamMatches(relevantMatches);
        }


        const calculateAverageElo = (players: PlayerDetails[]) => {
            const totalElo = players.reduce((acc, player) => acc + player.faceit_elo, 0);
            return totalElo / players.length;
        }

        const fetchMatchesForAllPlayers = () => {
            dispatch({type: 'setLoading', state: true});

            let collectedRequests = players.map((player) => API.FACEIT.getPlayerGameHistory(player.player_id, MATCHES_PER_PLAYER_SEARCH_AMOUNT));

            axios
                .all(collectedRequests)
                .then(
                    axios.spread((...responses) => {
                        dispatch({type: 'setLoading', state: false});

                        const collectedData = responses.map((resp) => resp.data.items).flat(1);

                        findRelevantMatches(collectedData);
                        setMatchHistory(collectedData);
                    })
                )
                .catch((errors) => {
                    dispatch({type: 'setLoading', state: false});
                    // react on errors.
                    console.error(errors);
                });
        }

    const fetchFaceitIds = async (playerList: (string | number)[]) => {
        let tempPlayerList: PlayerDetails[] = [];
        dispatch({ type: 'setLoading', state: true });

        for (const player of playerList) {
            let steamID = player.toString();

            // Check if steamID is not a valid SteamID64 and fetch the correct one if needed
            if (!isSteamID64(steamID)) {
                try {
                    const resp = await API.FACEIT.getSteamID64(steamID);
                    steamID = resp.data.steamID;
                } catch (err) {
                    console.log(`Error fetching SteamID64 for player ${player}:`, err);
                    continue; // Skip this player and move on to the next one in case of error
                }
            }

            try {
                const resp = await API.FACEIT.getFaceitID(steamID);
                const faceit_id = resp.data.player_id;

                const stats = await API.FACEIT.getFaceitStats(faceit_id);

                const playerDetails: PlayerDetails = {
                    nickname: resp.data.nickname,
                    faceit_elo: resp.data.games.cs2.faceit_elo,
                    faceit_level: resp.data.games.cs2.skill_level,
                    player_id: resp.data.player_id,
                    steam_64: resp.data.games.cs2.game_player_id,
                    steam_id: resp.data.platforms?.steam ?? 'Unknown',
                    faceit_url: `https://www.faceit.com/en/players/${resp.data.nickname}`,
                    stats: calculateStats(stats.data),
                };

                tempPlayerList.push(playerDetails);
            } catch (err) {
                console.log(`Error fetching FaceitID for player ${steamID}:`, err);
            }
        }

        setPlayers(tempPlayerList);
        dispatch({ type: 'setLoading', state: false });
    };


    // Find Distinct between two arrays (https://stackoverflow.com/questions/15912538/get-the-unique-values-from-two-arrays-and-put-them-in-another-array)
        // var array3 = array1.filter(function(obj) { return array2.indexOf(obj) == -1; });

        if (!team) {
            return null;
        }

        return (
            <div className={'pt-4'}>
                <h2>Team {team.name}</h2>
                <div className={'d-flex gap-2'}>
                    {team.league && <span className="badge bg-danger">Players: {team.steam_ids.length}</span>}
                    {team.league && <span className="badge bg-info">League: {team.league}</span>}
                    {players.length > 0 && <span className="badge bg-primary">Average Elo: {calculateAverageElo(players)}</span>}
                    {team && <ExtractTeamButton steamIds={team.steam_ids} />}
                </div>

                <div className={'row gy-3 py-3'}>
                    {players.sort((a, b) => b.faceit_elo - a.faceit_elo).map((player, key) => {
                        return <div className={'col'} key={key}><PlayerCard player={player}/></div>
                    })}
                </div>

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
                                Fetch match statistics</Button>
                        </InputGroup>
                    </Form>
                </div>


                {false &&
                    <>
                        <button onClick={() => dispatch({type: 'setLoading', state: !state.loading})}>Loading test</button>
                        <button onClick={() => fetchMatchesForAllPlayers()}>(2) Test match history</button>
                        <button onClick={() => {
                            // findRelevantMatches()
                            console.log(teamMatches);
                        }}>(3) Find relevant matches
                        </button>
                    </>
                }

                {(matchHistory && teamMatches) &&
                    <MatchesPlayedTogether playerCount={noRelevantPlayers} allMatches={matchHistory}
                                           matches={teamMatches} players={players}/>}
            </div>
        );
    }
;

export default TeamLayout;
