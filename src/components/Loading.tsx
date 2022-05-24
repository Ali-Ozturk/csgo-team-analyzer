import React from 'react';
import {BeatLoader} from "react-spinners";

const Loading: React.FC<{ loading: boolean }> = ({loading, ...props}) => {

    const color = "#dc3545";

    if (!loading) {
        return null;
    }
    return (
        <div className={'position-absolute top-0'} style={{zIndex: '1150'}}>
            <div className={'d-flex align-items-center'} style={{marginTop: '2rem', color: color}}>
                <BeatLoader loading={loading} {...props} size={10} speedMultiplier={0.7} color={color}/>
                <span className={'mx-2'}><strong>Fetching data..</strong></span>
            </div>
        </div>
    );
};

export default Loading;
