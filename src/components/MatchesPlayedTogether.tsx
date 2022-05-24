import React, {useEffect, useState} from 'react';
import {Match, MatchStatsResponseRoundStats, PlayerDetails} from "../models/Models";
import API from "../util/API";
import {CountMapDistribution} from "../util/Convertions";
import {useGlobalState} from "../contexts/GlobalStateContext";
import {Table} from "react-bootstrap";

type PlayedMatchDetail = {
    faceit_url: string;
    date: Date;
    round_stats: MatchStatsResponseRoundStats;
    isWinner: boolean;
}

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

    const onTest = () => {
        if (matches.length > 0) {
            let tempList: PlayedMatchDetail[] = [];

            matches.forEach(match => {
                dispatch({type: 'setLoading', state: true});

                API.FACEIT.getMatchStatistics(match.match_id).then((resp) => {
                    dispatch({type: 'setLoading', state: false});

                    const test1 = players.map(p => p.player_id)
                    const test2 = match.teams.faction1.players.map(p => p.player_id);
                    const test3 = test2.filter(val => test1.indexOf(val) != -1);
                    const isFaction1 = test3.length > 0 ? true : false;

                    const details: PlayedMatchDetail = {
                        faceit_url: match.faceit_url.replace("{lang}", "en"),
                        date: new Date(match.finished_at * 1000),
                        round_stats: resp.data.rounds[0].round_stats,
                        isWinner: resp.data.rounds[0].round_stats.Winner === (isFaction1 ? match.teams.faction1.team_id : match.teams.faction2.team_id),
                    }

                    tempList.push(details);
                }).catch((err) => {
                    dispatch({type: 'setLoading', state: false});
                    console.log(err);
                })
            });

            setMatchesDetailed(tempList);
        }
    }

    return (
        <div>
            <h4 className={'pt-4 mb-0'}>Matches played statistics</h4>
            <small className={'text-muted d-block pb-2'}>Based on <strong>{allMatches.length}</strong> matches where at
                least <strong>{playerCount}</strong> players are present.</small>
            <p><strong>Relevant matches found: </strong> {matches.length}</p>

            {(matchesDetailed && matchesDetailed.length > 1) && CountMapDistribution(matchesDetailed.map(m => m.round_stats)).sort((a, b) => (b.count - a.count)).map((mapDistri, key) => {
                return <div key={key}>{mapDistri.map} | Played: {mapDistri.count}</div>
            })}

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
};

export default MatchesPlayedTogether;
