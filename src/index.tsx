import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import {GlobalProvider} from "./contexts/GlobalStateContext";
import TempTest from "./components/TempTest";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <GlobalProvider>
        <App/>
    </GlobalProvider>
);
