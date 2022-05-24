import React, {useState} from 'react';
import {Match, PlayerDetails, Team} from "../models/Models";
import API from "../util/API";
import Loading from "./Loading";
import PlayerCard from "./PlayerCard";
import {useGlobalState} from "../contexts/GlobalStateContext";
import MatchesOverview from "./MatchesOverview";
import {FindUniqueMatchesInArray} from "../util/Convertions";
import MatchesPlayedTogether from "./MatchesPlayedTogether";


const TeamLayout: React.FC<{ team: Team }> = ({team}) => {

        const {state, dispatch} = useGlobalState();
        const [players, setPlayers] = useState<PlayerDetails[]>([]);
        const [matchHistory, setMatchHistory] = useState<Match[]>();
        const [teamMatches, setTeamMatches] = useState<Match[]>();

        const intersection = (arrA: Array<any>, arrB: Array<any>) => arrA.filter(x => arrB.includes(x));

        const findRelevantMatches = () => {
            let relevantMatches: Match[] = [];
            const uniqueMatches = FindUniqueMatchesInArray(matchHistory ?? []);

            uniqueMatches.forEach((match) => {
                let matches = intersection(match.playing_players, players.map((p) => p.player_id));

                // If at least two players found -> save to list
                if (matches.length > 2) {
                    relevantMatches.push(match);
                }
            });

            setTeamMatches(relevantMatches);
        }

        const fetchMatchesForAllPlayers = () => {
            let tempMatchList: Match[] = [];

            for (const player of players) {
                dispatch({type: 'setLoading', state: true});

                API.FACEIT.getPlayerGameHistory(player.player_id, 100).then((resp) => {
                    dispatch({type: 'setLoading', state: false});

                    // tempMatchList = tempMatchList.concat(resp.data.items);
                    tempMatchList.push(...resp.data.items);
                })
                    .catch((err) => {
                        dispatch({type: 'setLoading', state: false});
                        console.log(err);
                    })
            }

            setMatchHistory(tempMatchList);
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

        const generateTeamMatchHistory = () => {

        }

        // Find Distinct between two arrays (https://stackoverflow.com/questions/15912538/get-the-unique-values-from-two-arrays-and-put-them-in-another-array)
        // var array3 = array1.filter(function(obj) { return array2.indexOf(obj) == -1; });

        return (
            <div>

                <button onClick={() => console.log(players)}>Temp</button>
                <button onClick={() => dispatch({type: 'setLoading', state: !state.loading})}>Loading test</button>
                <button onClick={() => fetchMatchesForAllPlayers()}> Test match history</button>
                <button onClick={() => {
                    findRelevantMatches()
                    console.log(teamMatches);
                }}> Find relevant matches
                </button>
                <button onClick={() => console.log(players)}>Players test</button>
                <button onClick={() => fetchFaceitIds(team?.steam_ids)}>Test faceit ids</button>
                <Loading loading={state.loading}/>

                <h2>Team {team.name}</h2>

                <div className={'row gy-3'}>
                    {players.sort((a, b) => b.faceit_elo - a.faceit_elo).map((player, key) => {
                        return <div className={'col'}><PlayerCard key={key} player={player}/></div>
                    })}
                </div>

                {matchHistory && <MatchesOverview matches={matchHistory}/>}

                {teamMatches && <MatchesPlayedTogether matches={teamMatches}/>}
            </div>
        );
    }
;

export default TeamLayout;
