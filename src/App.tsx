import React from 'react';
import {Team} from "./models/Models";
import {Syntax_METAL} from "./data/TeamData";
import TeamLayout from "./components/TeamLayout";
import {Container} from "react-bootstrap";

function App() {
    const [team, setTeam] = React.useState<Team | undefined>(undefined);
    const [search, setSearch] = React.useState<string>("");

    const onSearch = () => {
        const manipulated = search.split(",").map(val => val.trim());

        const tempTeam: Team = {
            name: 'Search results',
            steam_ids: manipulated,
        }

        console.log(manipulated);
        setTeam(tempTeam);
    }

    return (
        <Container>
            <label htmlFor="sids">Steam ids:</label>
            <input type="text" id="sids" name="sids" onChange={(e) => setSearch(e.target.value)}/>
            <button onClick={onSearch}>Search</button>

            <button onClick={() => setTeam(Syntax_METAL)}>Team: Syntax</button>

            {team && <TeamLayout team={team}/>}
        </Container>
    );
}

export default App;
