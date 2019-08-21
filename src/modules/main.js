import axios from 'axios';
import { push } from 'react-router-redux';
import { logoutAction, patchProduct, patchStudent, fetchAttendanceByProduct, fetchAttendanceByDate, fetchEnrollmentsByProduct, fetchAllProducts, fetchAllStudents, baseURL, fetchLoggedInUser, changePasswordAction, patchStudentEnrolment, putStudentInfo, searchParentInfo, deleteStudentInfoSer } from './service';
import moment from 'moment';
import {splitProductSku, joinProductSku} from '../utils';
import _ from 'lodash'

export const UPDATE_ATTENDENCE = 'enrolments/UPDATE_ATTENDENCE';
export const ATTEN_HISTORY_TBL_DATA = 'view/attendance/history';
export const ATTEN_HISTORY_PRINT_TBL_DATA = 'print/attendance/history';
export const UPDATE_ATTENDANCE_TAKE_DATA = 'view/attendance/take';
export const STUDENTS_TBL_DATA = 'view/students';
export const PRODUCTS_TBL_DATA = 'view/products';

const initialState = {
    product: {},
    productHistory: {},
    attendanceTakeData: [],
    attenHistoryTblData: [],
    attenHistoryPrintTblData: [],
    studentsTblData: {},
    productsTblData: {}
};

export default (state = initialState, action) => {

    // atten take table
    if (action.type === UPDATE_ATTENDANCE_TAKE_DATA) {
        let { attendance, enrolments, products, selectedProducts } = action.data;
        attendance.forEach(student => {
            let { attended } = student, { studentId, productSku, productId } = student.id;
            var enrolment = enrolments.find(enrolment => enrolment.id === studentId);
            if(enrolment) enrolment.attended = attended;
        })
        enrolments = _.sortBy(enrolments, ['firstName', 'lastName']);
        return {
            ...state,
            attendanceTakeData: enrolments
        }
    }

    // mark single attendance
    if (action.type === UPDATE_ATTENDENCE) {
        const { index, attended } = action.data;
        return {
            ...state,
            attendanceTakeData: [
                ...state.attendanceTakeData.slice(0, index),
                {
                    ...state.attendanceTakeData[index],
                    attended
                },
                ...state.attendanceTakeData.slice(index + 1),
            ]
        };
    }

    // preapare attendance history table data
    if (action.type === ATTEN_HISTORY_TBL_DATA) {
        const { attendanceHistory, enrolments, products, selectedProducts } = action.data;
        let attenHistoryTblData = {}, dates = {};
        attendanceHistory.forEach(attnd => {
            let studentId = attnd.id.studentId, timestamp = attnd.id.attendanceDate, attended = attnd.attended;
            if(typeof dates[timestamp] === 'undefined'){
                dates[timestamp] = {};
            }
            dates[timestamp][studentId] = attended;
        });

        var columns = [], columnsWidth = {};
        columns.push({name: 'name', title: 'Student Name'});
        columns.push({name: 'orderId', title: 'Order Id', align: 'center'});
        columnsWidth['name'] = 200;
        columnsWidth['orderId'] = 90;
        Object.keys(dates).forEach(key => {
            columns.push({name: key, title: `${moment(parseInt(key, 10)).locale('en').format('DD/MM/YY')}`, align: 'center'});
            columnsWidth[key] = 100;
        });

        var rows = enrolments.map(student => {
            var row = {};
            row['name'] = `${student.firstName} ${student.lastName}`;
            row['firstName'] = student.firstName;
            row['lastName'] = student.lastName;
            row['studentId'] = student.id;
            row['id'] = student.id;
            row['dob'] = student.dob;
            row['healthCardNumber'] = student.healthCardNumber;
            row['parentName'] = `${student.parent.firstName} ${student.parent.lastName}`;
            row['parentEmail'] = student.parent.email;
            row['parentPhone'] = student.parent.phoneNum;
            row['familyDoctorName'] = student.parent.familyDoctorName;
            row['familyDoctorPhone'] = student.parent.familyDoctorPhone;
            row['orderId'] = student.order.orderId;
            Object.keys(dates).forEach(key => {
                row[key] = typeof dates[key][student.id] === 'undefined' ? 'N/A' : (dates[key][student.id] ? 'Present' : 'Absent');
            });
            return row;
        });

        attenHistoryTblData.columns = columns;
        attenHistoryTblData.rows = rows;
        attenHistoryTblData.columnsWidth = columnsWidth;

        return {
            ...state,
            attenHistoryTblData
        };
    }

    // prepare history table for attendance
    if (action.type === ATTEN_HISTORY_PRINT_TBL_DATA) {
        let { enrolments, attendanceHistory } = action.data;
        let totalSessions = 10;
        let dates = {}, attenHistoryPrintTblData = {}, columns = [];
        attendanceHistory.forEach(attnd => {
            let studentId = attnd.id.studentId, timestamp = attnd.id.attendanceDate, attended = attnd.attended;
            if(typeof dates[timestamp] === 'undefined'){
                dates[timestamp] = {};
            }
            dates[timestamp][studentId] = attended;
        });
        columns.push({field: 'name', displayName: 'Student Name'});
        Object.keys(dates).forEach((date, index) => {
            columns.push({field: `session${index+1}`, displayName: `${moment(parseInt(date, 10)).locale('en').format('DD/MM')}`});
        });
        for (let index = Object.keys(dates).length ; index < totalSessions; index ++) {
            columns.push({field: `session${index+1}`, displayName: `${index+1}`});
        }
        var rows = enrolments.map(student => {
            var row = {};
            row['name'] = `${student.firstName} ${student.lastName}`;
            Object.keys(dates).forEach((date, index) => {
                row[`session${index+1}`] = typeof dates[date][student.id] === 'undefined' ? '' : (dates[date][student.id] ? 'P' : 'A');
            });
            for (let index = Object.keys(dates).length ; index < totalSessions; index ++) {
                row[`session${index+1}`] = '';
            }
            return row;
        });

        attenHistoryPrintTblData.columns = columns;
        attenHistoryPrintTblData.rows = rows;

        return {
            ...state,
            attenHistoryPrintTblData
        };
    }
    if (action.type === STUDENTS_TBL_DATA) {
        let { students } = action.data;
        let studentsTblData = {}, rows = [], columns = [];
        columns  = [
            {name: 'name', title: 'Name'},
            {name: 'age', title: 'Age', align: 'left'},
            {name: 'gender', title: 'Gender'},
            {name: 'parentName', title: 'Parent Name'},
            {name: 'parentEmail', title: 'Parent Email'},
            {name: 'parentPhone', title: 'Parent Phone'},
            {name: 'reactions', title: 'Reactions', align: 'center'},
            {name: 'liability', title: 'Liability', align: 'center'},
            {name: 'photographyConsent', title: 'Photography Consent', align: 'center'},
            {name: 'medicalConsent', title: 'Medical Consent', align: 'center'}
        ];
        rows = students.map(({id, name, age, gender, parent, additionalInfo}) => {
            return {
                id,
                name,
                age,
                gender,
                parentId: parent.id,
                parentName: `${parent.firstName} ${parent.lastName}`,
                parentEmail: parent.email === 'null' ? '' : parent.email,
                parentPhone: parent.phoneNum,
                reactions: (additionalInfo.reactions === 'null' || additionalInfo.reactions === '') ? false : true,
                liability: additionalInfo.liability === 'YES' ? true : false,
                photographyConsent: additionalInfo.photographyConsent === 'Accept' ? true : false,
                medicalConsent: additionalInfo.medicalConsent === 'Accept' ? true : false
            }
        })
        studentsTblData.rows = rows;
        studentsTblData.columns = columns;
        return {
            ...state,
            studentsTblData
        };
    }

    if (action.type === PRODUCTS_TBL_DATA) {
        let { products } = action.data;
        let productsTblData = {}, rows = [], columns = [];
        columns  = [
            {name: 'name', title: 'Name'},
            {name: 'sku', title: 'SKU', align: 'left'},
            {name: 'groupName', title: 'Group', align: 'left'},
            {name: 'startDate', title: 'Start Date', align: 'center'},
            {name: 'endDate', title: 'End Date', align: 'center'},
            {name: 'numOfSessions', title: 'No. of Sessions', align: 'center'},
            {name: 'inventory', title: 'Inventory', align: 'center'},
            {name: 'numOfEnrollments', title: 'Enrollments', align: 'center'}
        ];
        rows = products.map(({productPK, name, sku, startDate, endDate, numOfSessions, inventory, numOfEnrollments, groupName}, index) => {
            return {
                id: index,
                productId: productPK.id,
                name,
                sku: productPK.sku,
                startDate: startDate === null ? '' : `${moment(startDate).locale('en').format('YYYY-MM-DD')}`,
                endDate: endDate === null ? '' : `${moment(endDate).locale('en').format('YYYY-MM-DD')}`,
                numOfSessions,
                inventory,
                numOfEnrollments,
                groupName: groupName === 'null' ? '' : groupName
            }
        })
        productsTblData.rows = rows;
        productsTblData.columns = columns;
        return {
            ...state,
            productsTblData
        };
    }
    return state;
}

// update attendance
export const updateAttendence = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { index, attended, productId, productSku, date } = params;
            let record = getState().main.attendanceTakeData[index];
            let request = [{attended: attended === 1 ? true : false, id: {studentId: record.id, productId, productSku}}]
            axios.post(`${baseURL}/attendance/${date}`, request)
            .then(function (response) {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
        });
    }
}

// save attendance request
export const saveAttendence = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { productId, date } = params;
            var filtered = getState().main.attendanceTakeData
                .filter(o => typeof o.attended !== 'undefined')
                .map(data => ({attended:data.attended, id: {studentId: data.id}}));
            axios.post(`${baseURL}/attendance/${productId}/${date}`, filtered)
            .then(function (response) {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            });
        });
    }
}

// prepare attendance data for take
export const prepareAttendanceTakeData = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { selectedDate, selectedProducts } = params;
            Promise.all([
                dispatch(fetchEnrollmentsByProduct({selectedProducts})),
                dispatch(fetchAttendanceByDate({selectedProducts,selectedDate})),
                dispatch(fetchAllStudents())
            ]).then(() => {
                var { attendance, enrolments, products } = getState().service;
                dispatch({
                    type: UPDATE_ATTENDANCE_TAKE_DATA,
                    data: {
                        attendance, enrolments, products, selectedProducts
                    }
                });
                resolve();
            }).catch(function (error) {
                reject(error);
            });
        });
    }
}

// prepare product list
export const prepareProductList = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(fetchAllProducts({})).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }
}

// show attendance table
export const prepareAttendanceHistoryData = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { selectedProducts } = params;
            Promise.all([
                dispatch(fetchAttendanceByProduct({selectedProducts})),
                dispatch(fetchEnrollmentsByProduct({selectedProducts})),
                dispatch(fetchAllStudents())
            ]).then(() => {
                var { attendanceHistory, enrolments, products } = getState().service;
                dispatch([{
                    type: ATTEN_HISTORY_TBL_DATA,
                    data: {
                        attendanceHistory, enrolments, products, selectedProducts
                    }
                },
                {
                    type: ATTEN_HISTORY_PRINT_TBL_DATA,
                    data: {
                        attendanceHistory, enrolments
                    }
                }]);
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}

// show all students
export const prepareStudentsTableData = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(fetchAllStudents()),
                dispatch(fetchAllProducts())
            ]).then(() => {
                var { students } = getState().service;
                dispatch([{
                    type: STUDENTS_TBL_DATA,
                    data: {
                        students
                    }
                }]);
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const filterTable = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { studentName, parentName, productId, productSku } = params;
            let { students } = getState().service;
            if(productId !== '')
            students = students.filter(student => {
                if(!student.enrolments) return false;
                return student.enrolments.filter(enrolment => (enrolment.id === parseInt(productId) && enrolment.sku === productSku)).length > 0;
            });
            if(studentName !== '') {
                console.log('--> not empty %s', studentName);
            }else{
                console.log('--> empty');
            }
            var regExS = new RegExp(studentName !== '' ? studentName.toLowerCase() : '.', "g");
            var regExP = new RegExp(parentName !== '' ? parentName.toLowerCase() : '.', "g");
            students = students.filter(student => {
                var fullParentName = `${student.parent.firstName} ${student.parent.lastName}`;
                if(student.name.toLowerCase().match(regExS) && fullParentName.toLowerCase().match(regExP)) return true;
                return false;
            });
            dispatch([{
                type: STUDENTS_TBL_DATA,
                data: {
                    students
                }
            }]);
            resolve();
        });
    }
}

export const filterProductTable = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { productName } = params;
            let { products } = getState().service;
            var regExProduct = new RegExp(productName !== '' ? productName.toLowerCase() : '.', "g");
            products = products.filter(product => (product.productPK.sku.toLowerCase().match(regExProduct) || product.name.toLowerCase().match(regExProduct)));
            dispatch([{
                type: PRODUCTS_TBL_DATA,
                data: {
                    products
                }
            }]);
            resolve();
        });
    }
}

export const fetchStudentDetail = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { studentId } = params;
            Promise.all([
                dispatch(fetchAllStudents())
            ]).then(() => {
                var { students } = getState().service;
                let student = students.find(student => student.id === parseInt(studentId));
                if (typeof student !== 'undefined') {
                    resolve(student);
                } else {
                    reject();
                }
            })
        });
    }
}

export const fetchParentDetail = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { parentId } = params;
            resolve();
        });
    }
}

// prepare products table
export const prepareProductTableData = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(fetchAllProducts())
            ]).then(() => {
                var { products } = getState().service;
                dispatch([{
                    type: PRODUCTS_TBL_DATA,
                    data: {
                        products
                    }
                }]);
                resolve();
            })
        });
    }
}

export const saveProductDetails = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(patchProduct(params))
            ]).then((data) => {
                resolve(data[0]);
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const updateStudentInfo = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(patchStudent(params)).then((data) => {
                dispatch(fetchAllStudents()).then(() => {
                    var { students } = getState().service
                    dispatch([{
                        type: STUDENTS_TBL_DATA,
                        data: {
                            students
                        }
                    }])
                    const student = students.find(s => s.id === data.studentId)
                    resolve(student)
                })
            }).catch(error => {
                reject(error);
            })
        });
    }
}

/*

export const prepareStudentsTableData = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(fetchAllStudents()),
                dispatch(fetchAllProducts())
            ]).then(() => {
                var { students } = getState().service;
                dispatch([{
                    type: STUDENTS_TBL_DATA,
                    data: {
                        students
                    }
                }]);
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}

*/

export const updateStudentEnrolment = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(patchStudentEnrolment(params)).then((data) => {
                dispatch(fetchAllStudents()).then(() => {
                    var { students } = getState().service
                    dispatch([{
                        type: STUDENTS_TBL_DATA,
                        data: {
                            students
                        }
                    }])
                    const student = students.find(s => s.id === data.studentId)
                    resolve(student)
                })
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const createNewStudent = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(putStudentInfo(params)).then((data) => {
                dispatch(fetchAllStudents()).then(() => {
                    var { students } = getState().service
                    dispatch([{
                        type: STUDENTS_TBL_DATA,
                        data: {
                            students
                        }
                    }])
                    resolve()
                })
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const searchParent = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(searchParentInfo(params)).then((data) => {
                resolve(data)
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const deleteStudentInfo = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            dispatch(deleteStudentInfoSer(params)).then(() => {
                dispatch(fetchAllStudents()).then(() => {
                    var { students } = getState().service
                    dispatch([{
                        type: STUDENTS_TBL_DATA,
                        data: {
                            students
                        }
                    }])
                    resolve()
                })
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const userLogout = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(logoutAction(params))
            ]).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const fetchCurrentUser = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                dispatch(fetchLoggedInUser(params))
            ]).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}

export const changePassword = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            console.log(params);
            Promise.all([
                dispatch(changePasswordAction(params))
            ]).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            })
        });
    }
}
