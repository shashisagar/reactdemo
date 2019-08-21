import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import main from './main';
import service from './service';
import student from './student';

export default combineReducers({
    router: routerReducer,
    main,
    service,
    student
})
