import React, {useEffect, useState} from 'react';
import {Match, PlayerDetails, Team} from "../models/Models";
import API from "../util/API";
import PlayerCard from "./PlayerCard";
import {useGlobalState} from "../contexts/GlobalStateContext";
import {FindUniqueMatchesInArray} from "../util/Convertions";
import MatchesPlayedTogether from "./MatchesPlayedTogether";
import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import axios from "axios";

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

        const fetchFaceitIds = (playerList: string[] | number[]) => {
            let tempPlayerList: PlayerDetails[] = [];

            for (const player of playerList) {
                dispatch({type: 'setLoading', state: true});
                API.FACEIT.getFaceitID(player)
                    .then((resp) => {
                        dispatch({type: 'setLoading', state: false});
                        const playerDetails: PlayerDetails = {
                            nickname: resp.data.nickname,
                            faceit_elo: resp.data.games.csgo.faceit_elo,
                            faceit_level: resp.data.games.csgo.skill_level,
                            player_id: resp.data.player_id,
                            steam_64: resp.data.games.csgo.game_player_id,
                            steam_id: resp.data.platforms?.steam ?? 'Unknown',
                            faceit_url: `https://www.faceit.com/en/players/${resp.data.nickname}`
                        }

                        tempPlayerList.push(playerDetails);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }

            setPlayers(tempPlayerList);
        }

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
