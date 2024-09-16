import React from 'react';
import { Team } from "./models/Models";
import { TEAMS } from "./data/TeamData";
import TeamLayout from "./components/TeamLayout";
import { Button, Container, FloatingLabel, Form, Row, Col } from "react-bootstrap";
import Loading from "./components/Loading";
import { useGlobalState } from "./contexts/GlobalStateContext";
import styled from "styled-components";
import { extractSteamIDs } from "./util/Convertions";

function App() {
    const { state } = useGlobalState();
    const [team, setTeam] = React.useState<Team | undefined>(undefined);
    const [search, setSearch] = React.useState<string>("");

    const onSearch = () => {
        const extractedIds = extractSteamIDs(search);

        const tempTeam: Team = {
            name: 'Search results',
            steam_ids: extractedIds,
        };

        setTeam(tempTeam);
    };

    return (
        <Container className={'pt-4'}>
            <div className="m-auto" style={{ maxWidth: '800px' }}>
                <div className={'d-flex align-items-center flex-column'}>
                    {!team && <>
                        <Row className="mb-3 w-100">
                            <Col xs={12} sm={9}>
                                <FloatingLabel controlId="steamidTextarea" label="Multi-search by inserting Steam64 ID's">
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        placeholder="Search by Steam64 ID (comma separated)"
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col xs={12} sm={3} className="d-flex align-items-end mt-2 mt-sm-0">
                                <Button onClick={onSearch} variant="outline-success h-100" className="w-100">
                                    Search
                                </Button>
                            </Col>
                        </Row>

                        <div className={'w-100'}>
                            <p><strong>Or choose from predefined teams</strong></p>

                            <Row>
                                {TEAMS.map((team, key) => {
                                    return (
                                        <Col xs={12} sm={6} md={4} lg={3} className="mb-3 d-flex align-items-stretch" key={key}>
                                            <StyledButton variant="outline-dark" onClick={() => setTeam(team)}>
                                                {team.name} ({team.steam_ids.length})
                                            </StyledButton>
                                        </Col>
                                    );
                                })}
                            </Row>
                        </div>
                    </>}
                </div>

                <TeamLayout team={team} />

                <Loading loading={state.loading} />
            </div>
        </Container>
    );
}

const StyledButton = styled(Button)`
  width: 100%;
  min-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export default App;
