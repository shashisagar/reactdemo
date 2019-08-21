import axios from 'axios';
import { push } from 'react-router-redux';

export const SERVICE_PRODUCTS               = 'service/products';
export const SERVICE_ENROLMENTS_BY_PROD     = 'service/enrolments/product';
export const SERVICE_ATTENDANCE_BY_PROD     = 'service/attendance/product';
export const SERVICE_ATTENDANCE_BY_DATE     = 'service/attendance/date';
export const SERVICE_STUDENTS               = 'service/students';
export const SERVICE_USER                   = 'service/user';

export let baseURL                          = '';

if (process.env.NODE_ENV === 'development') {
    baseURL = 'http://localhost:8886';
    // baseURL = 'https://stemminds.alluri.ca'
}

const initialState = {
    products: [],
    enrolments: [],
    attendance: [],
    attendanceHistory: [],
    students: [],
    user: {
        admin: false
    }
};

export default (state = initialState, action) => {

    if (action.type === SERVICE_PRODUCTS) {
        const { products } = action.data;
        return {
            ...state,
            products,
        };
    }
    if (action.type === SERVICE_ENROLMENTS_BY_PROD) {
        const { enrolments } = action.data;
        return {
            ...state,
            enrolments
        };
    }
    if (action.type === SERVICE_ATTENDANCE_BY_DATE) {
        const { attendance } = action.data;
        return {
            ...state,
            attendance
        };
    }
    if (action.type === SERVICE_ATTENDANCE_BY_PROD) {
        const { attendanceHistory } = action.data;
        return {
            ...state,
            attendanceHistory
        };
    }
    if (action.type === SERVICE_STUDENTS) {
        const { students } = action.data;
        return {
            ...state,
            students
        };
    }
    if (action.type === SERVICE_USER) {
        const { admin, username, email } = action.data;
        return {
            ...state,
            user: {admin, username, email}
        };
    }
    return state;
}

// get all the products
export const fetchAllProducts = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            axios.get(`${baseURL}/products`)
            .then(function (response) {
                const products = response.data;
                dispatch({
                    type: SERVICE_PRODUCTS,
                    data: {
                        products
                    }
                });
                resolve();
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }
};

// get all the enrolments by product id
export const fetchEnrollmentsByProduct = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { selectedProducts } = params;
            axios.post(`${baseURL}/products/enrolments`, selectedProducts)
            .then(function (response) {
                const enrolments = response.data;
                dispatch({
                    type: SERVICE_ENROLMENTS_BY_PROD,
                    data: {
                        enrolments
                    }
                });
                resolve();
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }
};

// get the attendance by date and product id
export const fetchAttendanceByDate = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { selectedProducts, selectedDate } = params;
            axios.post(`${baseURL}/attendance?attendanceDate=${selectedDate}`, selectedProducts)
            .then(function (response) {
                const attendance = response.data;

                dispatch({
                    type: SERVICE_ATTENDANCE_BY_DATE,
                    data: {
                        attendance
                    }
                });
                resolve();
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }
};

// get the history of attendance by product id
export const fetchAttendanceByProduct = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            let { selectedProducts } = params;
            axios.post(`${baseURL}/attendance`, selectedProducts)
            .then(function (response) {
                const attendanceHistory = response.data;
                dispatch({
                    type: SERVICE_ATTENDANCE_BY_PROD,
                    data: {
                        attendanceHistory
                    }
                });
                resolve();
            })
            .catch(function (error) {
                console.log(error);
            });
        });
    }
};

// get the history of attendance by product id
export const fetchAllStudents = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            axios.get(`${baseURL}/students`)
            .then(function (response) {
                const students = response.data;
                dispatch({
                    type: SERVICE_STUDENTS,
                    data: {
                        students
                    }
                });
                resolve();
            })
            .catch(function (error) {
                console.log(error);
                reject();
            });
        });
    }
};

// get the history of attendance by product id
export const patchProduct = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const {productId, productSku, data} = params;
            axios.patch(`${baseURL}/products`, Object.assign({productPK: {id: productId, sku: productSku}}, data))
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                console.log(error);
                reject();
            });
        });
    }
};

export const patchStudent = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { data } = params;
            axios.patch(`${baseURL}/students`, data)
            .then(function (response) {
                if(response.status == 200) return resolve({studentId: response.data.id})
                reject()
            })
            .catch(function (error) {
                reject();
            });
        });
    }
};

export const patchStudentEnrolment = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { data } = params;
            axios.put(`${baseURL}/products/enrolments`, data)
            .then(function (response) {
                if(response.status == 200 && response.data === "success") return resolve({studentId: data.newRecord.studentId})
                reject()
            })
            .catch(function (error) {
                reject()
            });
        });
    }
};

export const putStudentInfo = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { data } = params;
            axios.put(`${baseURL}/students`, data)
            .then(function (response) {
                if(response.status == 200) return resolve()
                reject()
            })
            .catch(function (error) {
                reject()
            });
        });
    }
};

export const searchParentInfo = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { data } = params;
            axios.get(`${baseURL}/persons/search/findByName?name=${data}`)
            .then(function (response) {
                if(response.status == 200) {
                    return resolve(response.data._embedded.persons)
                }
                reject()
            })
            .catch(function (error) {
                reject()
            });
        });
    }
};

export const deleteStudentInfoSer = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { data } = params;
            axios.delete(`${baseURL}/students/${data.id}`)
            .then(function (response) {
                if(response.status == 200) {
                    return resolve()
                }
                reject()
            })
            .catch(function (error) {
                reject()
            });
        });
    }
};

export const logoutAction = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            axios.get(`${baseURL}/logout`)
            .then(() => {
                resolve();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
        });
    }
};

export const changePasswordAction = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const {data} = params;
            axios.post(`${baseURL}/auth/changePassword`, data)
            .then(() => {
                resolve();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
        });
    }
};

export const fetchLoggedInUser = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            axios.get(`${baseURL}/auth/userInfo`)
            .then(response => {
                let userInfo;
                if (process.env.NODE_ENV === 'development') {
                    userInfo = {
                        id:1,
                        email: "admin@stemminds.com",
                        name: "Admin",
                        lastName: "Stemminds",
                        active:1,
                        roles:[
                            { id:1, role:"ADMIN" }
                        ],
                        bcryptPasswordEncoder:null
                    }
                } else {
                    userInfo = response.data;
                }
                dispatch({
                    type: SERVICE_USER,
                    data: {
                        admin: userInfo.roles[0].role === 'ADMIN',
                        username: `${userInfo.name} ${userInfo.lastName}`,
                        email: `${userInfo.email}`
                    }
                });
                resolve();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
        });
    }
};

export const fetchStudentNotes = (params) => {
    return (dispatch, getState) => {
        return new Promise((resolve, reject) => {
            const { studentId } = params
            axios.get(`${baseURL}/students/${studentId}/notes`)
            .then(response => {
                if(response && response.data) return resolve(response.data);
                reject();
            })
            .catch(error => {
                console.log(error);
                reject();
            });
        });
    }
};
