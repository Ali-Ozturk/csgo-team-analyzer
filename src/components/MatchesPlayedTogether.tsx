import React, {useState} from 'react';
import {Match, MatchStatsResponseRoundStats} from "../models/Models";
import API from "../util/API";
import {CountMapDistribution} from "../util/Convertions";
import {useGlobalState} from "../contexts/GlobalStateContext";

type PlayedMatchDetail = {
    faceit_url: string;
    round_stats: MatchStatsResponseRoundStats;
}

const MatchesPlayedTogether: React.FC<{ matches: Match[] }> = ({matches}) => {
    const {state, dispatch} = useGlobalState();

    const [matchesDetailed, setMatchesDetailed] = useState<PlayedMatchDetail[]>([]);

    const onTest = () => {
        if (matches.length > 0) {

            let tempList: PlayedMatchDetail[] = [];

            matches.forEach(match => {
                dispatch({type: 'setLoading', state: true});
                API.FACEIT.getMatchStatistics(match.match_id).then((resp) => {
                    dispatch({type: 'setLoading', state: false});
                    const details: PlayedMatchDetail = {
                        faceit_url: match.faceit_url.replace("{lang}", "en"),
                        round_stats: resp.data.rounds[0].round_stats,
                    }

                    tempList.push(details);
                }).catch((err) => {
                    dispatch({type: 'setLoading', state: false});
                    console.log(err)
                })
            });

            setMatchesDetailed(tempList);
        }
    }

    return (
        <div>
            <button onClick={() => {
                onTest();
            }}> Test details
            </button>
            <button onClick={() => {
                console.log(matchesDetailed)
                console.log(CountMapDistribution(matchesDetailed.map(m => m.round_stats)));
            }}> Test details
            </button>
            <h2>Matches where 3+ played together</h2>
            {matches.length}

            {matchesDetailed.length > 1 && CountMapDistribution(matchesDetailed.map(m => m.round_stats)).sort((a, b) => (b.count - a.count)).map((mapDistri) => {
                return <div>{mapDistri.map} | Played: {mapDistri.count}</div>
            })}

            {matchesDetailed.map((match) => {
                return <div><a href={match.faceit_url} target={"_blank"}>Link</a> Map: {match.round_stats.Map}</div>
            })}


        </div>
    );
};

export default MatchesPlayedTogether;
