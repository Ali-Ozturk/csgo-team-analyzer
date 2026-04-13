import React from 'react';
import {Team} from "./models/Models";
import TeamLayout from "./components/TeamLayout";
import {Button, Col, Container, FloatingLabel, Form, Row} from "react-bootstrap";
import Loading from "./components/Loading";
import {useGlobalState} from "./contexts/GlobalStateContext";
import styled from "styled-components";
import {extractFaceitMatch, extractSteamIDs} from "./util/Convertions";
import {
    extractPowerStatsTeamId,
    extractSteamIdsFromPowerStatsPlayersResponse,
    getLatestPowerStatsSeason,
    getPowerStatsPlayersByTeamId,
    getPowerStatsTeamByTeamIdAndSeason,
    getPowerStatsVetoStats
} from "./util/powerstats";
import {
    addOrMoveTeamToFront,
    clearSavedTeams,
    getSavedTeams, getTeamStorageKey,
    removeSavedTeam
} from "./util/localStorageTeams";

function App() {
    const {state} = useGlobalState();
    const [team, setTeam] = React.useState<Team | undefined>(undefined);
    const [search, setSearch] = React.useState<string>("");
    const [savedTeams, setSavedTeams] = React.useState<Team[]>([]);

    React.useEffect(() => {
        setSavedTeams(getSavedTeams());
    }, []);

    const saveTeamAndSelect = (teamToSave: Team) => {
        const updatedTeams = addOrMoveTeamToFront(teamToSave);
        setSavedTeams(updatedTeams);
        setTeam(teamToSave);
    };

    const onDeleteTeam = (teamToDelete: Team) => {
        const updatedTeams = removeSavedTeam(teamToDelete);
        setSavedTeams(updatedTeams);
    };

    const onDeleteAllTeams = () => {
        clearSavedTeams();
        setSavedTeams([]);
    };

    const onSelectSavedTeam = (selectedTeam: Team) => {
        const updatedTeams = addOrMoveTeamToFront(selectedTeam);
        setSavedTeams(updatedTeams);
        setTeam(selectedTeam);
    };

    const onSearch = async () => {
        try {
            const trimmedSearch = search.trim();

            if (!trimmedSearch) {
                return;
            }

            const powerStatsTeamId = extractPowerStatsTeamId(trimmedSearch);

            if (powerStatsTeamId) {
                const latestSeason = await getLatestPowerStatsSeason();

                const [teamDetails, vetoStats, playersResponse] = await Promise.all([
                    getPowerStatsTeamByTeamIdAndSeason(powerStatsTeamId, latestSeason),
                    getPowerStatsVetoStats(powerStatsTeamId, latestSeason),
                    getPowerStatsPlayersByTeamId(powerStatsTeamId, latestSeason),
                ]);

                const extractedIds = extractSteamIdsFromPowerStatsPlayersResponse(playersResponse);

                const tempTeam: Team = {
                    name: teamDetails.teamName || `PowerStats team (${powerStatsTeamId})`,
                    steam_ids: extractedIds,
                    power_team_id: powerStatsTeamId,
                    power_veto_stats: vetoStats,
                    league: teamDetails.division ?? undefined,
                    url: `https://powerstats.dk/team/${powerStatsTeamId}?season=${latestSeason}`,
                };

                saveTeamAndSelect(tempTeam);
                return;
            }

            const faceitMatchExtracted = await extractFaceitMatch(trimmedSearch);

            if (faceitMatchExtracted) {
                const tempTeam: Team = {
                    name: 'Faceit match',
                    steam_ids: faceitMatchExtracted,
                };

                saveTeamAndSelect(tempTeam);
                return;
            }

            const extractedIds = extractSteamIDs(trimmedSearch);

            const tempTeam: Team = {
                name: 'Search results',
                steam_ids: extractedIds,
            };

            saveTeamAndSelect(tempTeam);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    return (
        <Container className={'pt-4'}>

            {team && (
                <div className="mt-3">
                    <Button variant="outline-secondary" onClick={() => setTeam(undefined)}>
                        Back to frontpage
                    </Button>
                </div>
            )}

            <div
                className="m-auto"
                style={{
                    maxWidth: '100%',
                    ...(window.innerWidth < 576 ? {maxWidth: '800px'} : {})
                }}
            >
                <div className={'d-flex align-items-center flex-column'}>
                    {!team && (
                        <>
                            <Row className="mb-3 w-100">
                                <Col xs={12} sm={9}>
                                    <FloatingLabel
                                        controlId="steamidTextarea"
                                        label="Search by Steam64 IDs, Faceit match URL, or PowerStats team URL"
                                    >
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            placeholder="Steam64 IDs, Faceit match URL, or PowerStats team URL"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    onSearch();
                                                }
                                            }}
                                        />
                                    </FloatingLabel>
                                </Col>

                                <Col xs={12} sm={3} className="d-flex align-items-end mt-2 mt-sm-0">
                                    <Button onClick={onSearch} variant="outline-success" className="w-100 h-100">
                                        Search
                                    </Button>
                                </Col>
                            </Row>

                            <div className={'w-100'}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <p className="mb-0"><strong>Recent searches</strong></p>

                                    {savedTeams.length > 0 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={onDeleteAllTeams}
                                        >
                                            Delete all
                                        </Button>
                                    )}
                                </div>

                                {savedTeams.length === 0 ? (
                                    <p className="text-muted">No saved searches yet.</p>
                                ) : (
                                    <Row>
                                        {savedTeams.map((savedTeam, key) => {
                                            return (
                                                <Col
                                                    xs={12}
                                                    sm={6}
                                                    md={4}
                                                    lg={3}
                                                    className="mb-3 d-flex align-items-stretch"
                                                    key={getTeamStorageKey(savedTeam)}
                                                >
                                                    <SavedTeamCard>
                                                        <StyledButton
                                                            variant="outline-dark"
                                                            onClick={() => onSelectSavedTeam(savedTeam)}
                                                        >
                                                            <div className="w-100">
                                                                <div className="fw-bold text-truncate">
                                                                    {savedTeam.name}
                                                                </div>
                                                                <div className="small text-muted">
                                                                    Players: {savedTeam.steam_ids.length}
                                                                </div>
                                                                {savedTeam.league && (
                                                                    <div className="small text-muted text-truncate">
                                                                        {savedTeam.league}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </StyledButton>

                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() => onDeleteTeam(savedTeam)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </SavedTeamCard>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                )}
                            </div>
                        </>
                    )}
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

const SavedTeamCard = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export default App;