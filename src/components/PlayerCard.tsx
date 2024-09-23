import React from 'react';
import {PlayerDetails} from "../models/Models";
import {Card} from "react-bootstrap";

interface PropsFromParent {
    player: PlayerDetails
}

const PlayerCard: React.FC<PropsFromParent> = ({player}) => {

    return (
        <Card>
            <Card.Body>
                <Card.Title>{player.nickname}</Card.Title>
                <Card.Subtitle>Elo: {player.faceit_elo} (lv. {player.faceit_level})</Card.Subtitle>
                <Card.Text>
                    {player.stats &&
                        <>
                            {/**DEPRECATED - Not used because not giving any details
                             <p className={'mb-0 mt-2'}>Avg. Kills: {player.stats?.averageKills}</p>
                             <p className={'mb-0'}>Avg. ADR: {player.stats?.averageADR}</p>
                             <p className={'mb-0'}>Avg. KD: {player.stats?.averageKD}</p>
                             */}
                            <p className={'mb-0'}>Last 20: 3 most played maps:</p>
                            <ul>
                                {player.stats?.top3Maps.map(mapObj => (
                                    <li key={mapObj.map}>
                                        {mapObj.map}: {mapObj.count} times
                                    </li>
                                ))}
                            </ul>
                            <p className={'mb-0'}>Lifetime:</p>
                            <ul>
                                {player.lifetimeMapDistribution?.slice(0, 8).map(map => (
                                    <li key={map.map}>
                                        {map.map}: {map.played} ({map.wins} | {map.loss}) {map.pctDistribution.toFixed(0)}%
                                    </li>
                                ))}
                            </ul>

                        </>
                    }
                    {player.steam_64} <br/>
                    {player.steam_id}
                </Card.Text>
                <Card.Link target="_blank" href={player.faceit_url}>Faceit</Card.Link>
                <Card.Link target="_blank"
                           href={"https://steamcommunity.com/profiles/" + player.steam_64}>Steam</Card.Link>
            </Card.Body>
        </Card>
    );
};

export default PlayerCard;
