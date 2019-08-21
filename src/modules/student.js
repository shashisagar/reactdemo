import { prepareStudentsTableData, filterTable } from './main'
import { splitProductSku, joinProductSku } from '../utils'
import { push } from 'react-router-redux'

export const UPDATE_SELECTION = 'student/UPDATE_SELECTION';
export const UPDATE_LOADING = 'student/UPDATE_LOADING';
export const UPDATE_PRODUCT_FILTER_CHANGED = 'student/UPDATE_PRODUCT_CHANGED';
export const UPDATE_PARENT_FILTER_CHANGED = 'student/UPDATE_PARENT_FILTER_CHANGED';
export const UPDATE_STUDENT_FILTER_CHANGED = 'student/UPDATE_STUDENT_FILTER_CHANGED';
export const UPDATE_CURRENT_PAGE = 'student/UPDATE_CURRENT_PAGE';

const initialState = {
    filters: [],
    loading: false,
    productIdSku: '',
    studentName: '',
    parentName: '',
    selection: [],
    showStudentDetail: false,
    selectedStudent: null,
    currentPage: 0
};

export default (state = initialState, action) => {
    if (action.type === UPDATE_SELECTION) {
        let { selection } = action.data;
        return {
            ...state,
            selection
        };
    }
    if (action.type === UPDATE_LOADING) {
        let { loading } = action.data;
        return {
            ...state,
            loading
        };
    }
    if (action.type === UPDATE_PRODUCT_FILTER_CHANGED) {
        let { productIdSku } = action.data
        return {
            ...state,
            productIdSku
        }
    }
    if(action.type === UPDATE_PARENT_FILTER_CHANGED) {
        let { parentName } = action.data
        return {
            ...state,
            parentName
        }
    }
    if(action.type === UPDATE_STUDENT_FILTER_CHANGED) {
        let { studentName } = action.data
        return {
            ...state,
            studentName
        }
    }
    if(action.type === UPDATE_CURRENT_PAGE) {
        let { currentPage } = action.data
        return {
            ...state,
            currentPage
        }
    }

    return state;
}

export const showStudentDetail = (params) => {
    return (dispatch, getState) => {
        let { selection } = params
        var diff = selection.filter(x => getState().student.selection.indexOf(x) < 0 )
        let studentId = getState().main.studentsTblData.rows[selection[0]].id
        dispatch({
            type: UPDATE_SELECTION,
            data: {
                selection: diff
            }
        })
        goToStudentDetail(studentId, dispatch)
    }
}

const goToStudentDetail = (studentId, dispatch) => {
    dispatch(push(`/secured/student/${studentId}`))
}

export const loadData = (params) => {
    return (dispatch, getState) => {
        dispatch({
            type: UPDATE_LOADING,
            data: {
                loading: true
            }
        })
        dispatch(prepareStudentsTableData()).then(() => {
            dispatch({
                type: UPDATE_LOADING,
                data: {
                    loading: false
                }
            })
        })
    }
}

const filterTableData = (state, dispatch) => {
    const { productIdSku, studentName, parentName } = state.student
    console.log(studentName);
    console.log(parentName);
    let productPK = splitProductSku(productIdSku);
    dispatch(filterTable({studentName, parentName, productId: productPK.id, productSku: productPK.sku})).then(() => {})
}

export const productChanged = (params) => {
    return (dispatch, getState) => {
        let { productIdSku } = params
        dispatch({
            type: UPDATE_PRODUCT_FILTER_CHANGED,
            data: {
                productIdSku
            }
        })
        filterTableData(getState(), dispatch)
    }
}

export const filterByStudent = (params) => {
    return (dispatch, getState) => {
        let { studentName } = params
        dispatch({
            type: UPDATE_STUDENT_FILTER_CHANGED,
            data: {
                studentName
            }
        })
        filterTableData(getState(), dispatch)
    }
}

export const filterByParent = (params) => {
    return (dispatch, getState) => {
        let { parentName } = params
        dispatch({
            type: UPDATE_PARENT_FILTER_CHANGED,
            data: {
                parentName
            }
        })
        filterTableData(getState(), dispatch)
    }
}

export const updateCurrentPage = (params) => {
    return (dispatch, getState) => {
        let { currentPage } = params
        dispatch({
            type: UPDATE_CURRENT_PAGE,
            data: {
                currentPage
            }
        })
    }
}
