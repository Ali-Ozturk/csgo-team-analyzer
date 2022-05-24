import React from 'react';
import {FadeLoader} from "react-spinners";

const Loading: React.FC<{loading: boolean}> = ({loading, ...props}) => {
    return (
        <div className={'d-flex justify-content-center'}>
            <FadeLoader loading={loading} {...props} />
        </div>
    );
};

export default Loading;
