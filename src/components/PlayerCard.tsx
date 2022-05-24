import React from 'react';
import {Match, PlayerDetails} from "../models/Models";
import {Card} from "react-bootstrap";
import API from "../util/API";

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
                    {player.steam_64} <br/>
                    {player.steam_id}
                </Card.Text>
                <Card.Link href={player.faceit_url} target={"_blank"}>Faceit</Card.Link>
                <Card.Link href="#">Steam</Card.Link>
            </Card.Body>
        </Card>
    );
};

export default PlayerCard;
