import React from 'react';
import {Card, Col, ProgressBar, Row} from "react-bootstrap";
import {PowerStatsVetoStat} from "../models/Models";

type Props = {
    vetoStats?: PowerStatsVetoStat[];
};

const PowerStatsVetoStats: React.FC<Props> = ({vetoStats}) => {
    if (!vetoStats || vetoStats.length === 0) {
        return null;
    }

    const sortedStats = [...vetoStats].sort((a, b) => {
        // Put most played maps first, then picked, then by name
        if (b.amountPlayed !== a.amountPlayed) return b.amountPlayed - a.amountPlayed;
        if (b.amountPicked !== a.amountPicked) return b.amountPicked - a.amountPicked;
        return a.mapName.localeCompare(b.mapName);
    });

    const getWinRate = (stat: PowerStatsVetoStat) => {
        if (stat.amountPlayed === 0) return 0;
        return Math.round((stat.amountWon / stat.amountPlayed) * 100);
    };

    return (
        <div className="mt-4">
            <h4 className="mb-3">PowerStats veto overview</h4>

            <Row className="g-3">
                {sortedStats.map((stat) => {
                    const winRate = getWinRate(stat);

                    return (
                        <Col xs={12} sm={6} lg={4} xl={3} key={stat.mapName}>
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <Card.Title className="mb-0">{stat.mapName}</Card.Title>
                                        <span className="badge bg-dark">
                                            {stat.amountPlayed} played
                                        </span>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        <span className="badge bg-primary">
                                            Picked: {stat.amountPicked}
                                        </span>
                                        <span className="badge bg-danger">
                                            Banned: {stat.amountBanned}
                                        </span>
                                        <span className="badge bg-success">
                                            Won: {stat.amountWon}
                                        </span>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Win rate</span>
                                            <span>{winRate}%</span>
                                        </div>
                                        <ProgressBar now={winRate} />
                                    </div>

                                    <div>
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span>Chosen CT %</span>
                                            <span>{stat.chosenCTPercentage}%</span>
                                        </div>
                                        <ProgressBar now={stat.chosenCTPercentage} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default PowerStatsVetoStats;