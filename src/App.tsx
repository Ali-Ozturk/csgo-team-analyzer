import React, {useEffect} from 'react';
import {Team} from "./models/Models";
import {
    TEAMS
} from "./data/TeamData";
import TeamLayout from "./components/TeamLayout";
import {Button, Container, FloatingLabel, Form, InputGroup} from "react-bootstrap";
import Loading from "./components/Loading";
import {useGlobalState} from "./contexts/GlobalStateContext";
import API from "./util/API";
import styled from "styled-components";
import {extractSteamIDs} from "./util/Convertions";

function App() {
    const {state, dispatch} = useGlobalState();
    const [team, setTeam] = React.useState<Team | undefined>(undefined);
    const [search, setSearch] = React.useState<string>("");

    const onSearch = () => {
        const extractedIds = extractSteamIDs(search)

        const tempTeam: Team = {
            name: 'Search results',
            steam_ids: extractedIds,
        }

        setTeam(tempTeam);
    }

    return (
        <Container className={'pt-4'}>
            <div className={'d-flex align-items-center flex-column w-50 m-auto'}>
                {!team && <>
                    <InputGroup className="mb-3">
                        <FloatingLabel controlId="steamidTextarea" label="Multi-search by inserting Steam64 ID's"
                                       className={'col-10'}>
                            <Form.Control
                                as="textarea"
                                placeholder="Search by Steam64 ID (comma seperated)"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </FloatingLabel>
                        <Button onClick={onSearch} variant="outline-success" id="button-addon2" className={'col-2'}>
                            Search
                        </Button>
                    </InputGroup>


                    <div className={'w-100'}>
                        <p className={''}><strong>Or choose from predefined teams</strong></p>

                            <div className="row">
                                {TEAMS.map((team, key) => {
                                    return (
                                        <div className="col-3 mb-3" key={key}>
                                            <StyledButton variant="outline-dark" onClick={() => setTeam(team)}>
                                                {team.name} ({team.steam_ids.length})
                                            </StyledButton>
                                        </div>
                                    );
                                })}
                            </div>

                    </div>
                </>}
            </div>

            <TeamLayout team={team}/>

            <Loading loading={state.loading}/>
        </Container>
    );
}

const StyledButton = styled(Button)`
  flex-grow: 1;
  height: 100px; /* Fixed height */
  min-width: 150px; /* Fixed width */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export default App;
