import React from 'react';
import { Team } from "../models/Models";

interface PropsFromParent {
    steamIds: Team['steam_ids']
}

const ExtractTeamButton: React.FC<PropsFromParent> = ({ steamIds }) => {
    const handleCopy = () => {
        // Generate the code snippet with the steamIds from props
        const codeSnippet = `
{
    name: 'Imported Team',
    league: 'Imported',
    steam_ids: [
        ${steamIds.map(id => `"${id}"`).join(',\n        ')}
    ]
}
    `.trim();

        // Copy the codeSnippet to the clipboard
        navigator.clipboard.writeText(codeSnippet)
            .then(() => {
                alert('Code copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <button onClick={handleCopy} className="badge bg-dark border-0">
            Copy team to clipboard
        </button>
    );
}

export default ExtractTeamButton;
