import * as React from 'react'

type Action = { type: 'setLoading', state: boolean }
type Dispatch = (action: Action) => void
type State = { loading: boolean }
type GlobalProviderProps = { children: React.ReactNode }

const GlobalStateContext = React.createContext<{ state: State; dispatch: Dispatch } | undefined>(undefined)

function globalReducer(state: State, action: Action) {
    switch (action.type) {
        case 'setLoading': {
            return {loading: action.state}
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

function GlobalProvider({children}: GlobalProviderProps) {
    const [state, dispatch] = React.useReducer(globalReducer, {loading: false})
    // NOTE: you *might* need to memoize this value
    // Learn more in http://kcd.im/optimize-context
    const value = {state, dispatch}
    return (
        <GlobalStateContext.Provider value={value}>
            {children}
        </GlobalStateContext.Provider>
    )
}

function useGlobalState() {
    const context = React.useContext(GlobalStateContext)
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider')
    }
    return context
}

export {GlobalProvider, useGlobalState}
