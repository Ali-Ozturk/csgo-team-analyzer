import React, {useEffect} from 'react';
import {Match} from "../models/Models";
import {FindUniqueMatchesInArray} from "../util/Convertions";

const MatchesOverview: React.FC<{matches: Match[]}> = ({ matches}) => {

    useEffect(() => {
        console.log("Test");
    }, [])

    return (
        <div>
            <h2>Map statistics</h2>
            {matches.length}
        </div>
    );
};

export default MatchesOverview;
