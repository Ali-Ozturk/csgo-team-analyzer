import React from 'react';
import {Team} from "./models/Models";
import {FastForward_METAL, ObliviateElite_METAL, Smage_METAL, Syntax_METAL, Vulture_METAL} from "./data/TeamData";
import TeamLayout from "./components/TeamLayout";
import {Button, Container, FloatingLabel, Form, InputGroup} from "react-bootstrap";
import Loading from "./components/Loading";
import {useGlobalState} from "./contexts/GlobalStateContext";

function App() {
    const {state, dispatch} = useGlobalState();
    const [team, setTeam] = React.useState<Team | undefined>(undefined);
    const [search, setSearch] = React.useState<string>("");

    const onSearch = () => {
        const manipulated = search.split(",").map(val => val.trim());

        const tempTeam: Team = {
            name: 'Search results',
            steam_ids: manipulated,
        }

        setTeam(tempTeam);
    }

    return (
        <Container className={'pt-4'}>
            <div className={'d-flex align-items-center flex-column w-50 m-auto'}>
                {!team && <>
                    <InputGroup className="mb-3">
                        <FloatingLabel controlId="steamidTextarea" label="Search by Steam64 ID (comma seperated)"
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
                        <p className={''}><strong>Or choose from predefined sets</strong></p>

                        <div className={'d-flex gap-5 justify-content-center'}>
                            <div>
                                <Button variant="outline-dark" onClick={() => setTeam(Syntax_METAL)}>
                                    Team: {Syntax_METAL.name} ({Syntax_METAL.steam_ids.length})</Button>
                            </div>
                            <div>
                                <Button variant="outline-dark" onClick={() => setTeam(Smage_METAL)}>
                                    Team: {Smage_METAL.name} ({Smage_METAL.steam_ids.length})
                                </Button>
                            </div>
                            <div>
                                <Button variant="outline-dark" onClick={() => setTeam(ObliviateElite_METAL)}>
                                    Team: {ObliviateElite_METAL.name} ({ObliviateElite_METAL.steam_ids.length})
                                </Button>
                            </div>
                            <div>
                                <Button variant="outline-dark" onClick={() => setTeam(Vulture_METAL)}>
                                    Team: {Vulture_METAL.name} ({Vulture_METAL.steam_ids.length})
                                </Button>
                            </div>
                            <div>
                                <Button variant="outline-dark" onClick={() => setTeam(FastForward_METAL)}>
                                    Team: {FastForward_METAL.name} ({FastForward_METAL.steam_ids.length})
                                </Button>
                            </div>
                        </div>
                    </div>
                </>}
            </div>

            {team && <div className={'d-flex justify-content-center'}>
                <Button variant={"outline-dark"} onClick={() => {
                    setTeam(undefined);
                }}>Choose different team</Button>
            </div>}

            <TeamLayout team={team}/>

            <Loading loading={state.loading}/>
        </Container>
    );
}

export default App;
