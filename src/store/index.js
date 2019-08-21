import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import analytics from './analytics';
import promise from './promise';
import array from './array';
import createHistory from 'history/createBrowserHistory';
import rootReducer from '../modules';
import { composeWithDevTools } from 'remote-redux-devtools';

export const history = createHistory()

const initialState = {}
const enhancers = []
const middleware = [
    thunk,
    promise,
    array,
    analytics,
    routerMiddleware(history)
]

if (process.env.NODE_ENV === 'development') {
    enhancers.push(composeWithDevTools({ realtime: true, port: 8086 })())
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
)

export default createStore(
    rootReducer,
    initialState,
    composedEnhancers
)
