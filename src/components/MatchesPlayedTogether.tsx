import React, {useEffect, useState} from 'react';
import {Match, PlayedMatchDetail, PlayerDetails} from "../models/Models";
import API from "../util/API";
import {CountMapDistribution, CountUniqueStringsInArray} from "../util/Convertions";
import {useGlobalState} from "../contexts/GlobalStateContext";
import {Table} from "react-bootstrap";


const MatchesPlayedTogether: React.FC<{ allMatches: Match[], matches: Match[], playerCount: number, players: PlayerDetails[] }> = ({
                                                                                                                                       matches,
                                                                                                                                       allMatches,
                                                                                                                                       playerCount,
                                                                                                                                       players
                                                                                                                                   }) => {
        const {state, dispatch} = useGlobalState();

        const [matchesDetailed, setMatchesDetailed] = useState<PlayedMatchDetail[]>();


        useEffect(() => {
            onTest();
            return () => {
                console.log("Test");
                setMatchesDetailed(undefined);
            };
        }, [])

        const onTest = async () => {
            if (matches.length > 0) {
                let tempList: PlayedMatchDetail[] = [];

                for (const match of matches) {
                    dispatch({type: 'setLoading', state: true});
                    try {
                        const matchStats = await API.FACEIT.getMatchStatistics(match.match_id);
                        const votingStats = await API.FACEIT.getMatchVoteHistory(match.match_id);

                        const test1 = players.map(p => p.player_id)
                        const test2 = match.teams.faction1.players.map(p => p.player_id);
                        const test3 = test2.filter(val => test1.indexOf(val) != -1);
                        const isFaction1 = test3.length > 0;

                        const votesByTeam = votingStats.data.payload.tickets[1].entities.filter(vote => vote.selected_by === (isFaction1 ? 'faction1' : 'faction2'));

                        const details: PlayedMatchDetail = {
                            match_id: match.match_id,
                            faceit_url: match.faceit_url.replace("{lang}", "en"),
                            date: new Date(match.finished_at * 1000),
                            round_stats: matchStats.data.rounds[0].round_stats,
                            isWinner: matchStats.data.rounds[0].round_stats.Winner === (isFaction1 ? match.teams.faction1.team_id : match.teams.faction2.team_id),
                            votesByTeam: votesByTeam
                        }

                        tempList.push(details);
                    } catch (err) {
                        console.log(err);
                    } finally {
                        dispatch({type: 'setLoading', state: false});
                    }

                    setMatchesDetailed(tempList);
                }
            }
        }

        return (
            <div>
                <h4 className={'pt-4 mb-0'}>Matches played statistics</h4>
                <small className={'text-muted d-block pb-2'}>Based on <strong>{allMatches.length}</strong> matches where at
                    least <strong>{playerCount}</strong> players are present.</small>
                <p><strong>Relevant matches found: </strong> {matches.length}</p>

                <div className={'row'}>
                    <div className={'col-6'}>
                        <strong>Banned maps count</strong>
                        {matchesDetailed &&
                        <div>{CountUniqueStringsInArray(matchesDetailed?.map(m => m.votesByTeam).flat(1).map(m => m.guid)).map((vote => {
                            return <div>{vote[0]} | {vote[1]}</div>
                        }))}</div>}
                    </div>

                    <div className={'col-6'}>
                        <strong>Maps played distribution</strong>
                        {(matchesDetailed && matchesDetailed.length > 1) && CountMapDistribution(matchesDetailed).sort((a, b) => (b.count - a.count)).map((mapDistri, key) => {
                            return <div key={key}>{mapDistri.map} | Played: {mapDistri.count} | Win perc.: {mapDistri.winPercentage} %</div>
                        })}
                    </div>
                </div>


                {matchesDetailed &&
                <>
                    <p><strong>Relevant matches list</strong></p>
                    <Table hover size={"sm"} style={{whiteSpace: 'nowrap', overflow: 'scroll'}}>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Faceit url</th>
                            <th>Map</th>
                            <th>Win/Lose</th>
                            <th>Rounds</th>
                            <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {matchesDetailed.sort((a, b) => b.date.getTime() - a.date.getTime()).map((match, key) => {
                            return (
                                <tr key={key}>
                                    <td>{key}</td>
                                    <td>{match.date.toDateString()}</td>
                                    <td><a href={match.faceit_url} target={"_blank"} rel="noreferrer">Link</a></td>
                                    <td>{match.round_stats.Map}</td>
                                    <td>{match.isWinner ? 'Win' : 'Lose'}</td>
                                    <td>{match.round_stats.Rounds}</td>
                                    <td>{match.round_stats.Score}</td>
                                </tr>
                            )
                        })}

                        </tbody>
                    </Table>
                </>
                }


            </div>
        );
    }
;

export default MatchesPlayedTogether;
