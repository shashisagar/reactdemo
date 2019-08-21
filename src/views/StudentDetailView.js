import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { fetchStudentDetail } from '../modules/main';
import { bindActionCreators } from 'redux';
import { BeatLoader, ScaleLoader } from 'react-spinners';
import { fetchStudentNotes } from '../modules/service';
import { Glyphicon, Table, Panel, Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap';
import {
    PagingState,
    LocalPaging,
    RowDetailState,
    LocalFiltering,
    LocalSorting,
    LocalGrouping,
    FilteringState,
    EditingState,
    TableEditColumn,
    TableEditRow,
    SortingState,
    TableColumnResizing
} from '@devexpress/dx-react-grid';

import {
    Grid,
    TableView,
    TableHeaderRow,
    PagingPanel,
    TableRowDetail
} from '@devexpress/dx-react-grid-bootstrap3';

class StudentDetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            student: null,
            loadingComments: false,
            comments: []
        };
    }

    componentDidMount() {
        let student = this.props.students.find(({id}) => this.props.studentId === id);
        this.setState({
            student
        }, () => {
            try {
                if (student.id) {
                    this.setState({loadingComments: true})
                    setTimeout(function() {
                        this.fetchNotes()
                    }.bind(this), 500)
                }
            } catch(err) {
                console.log(err);
            }
        })
    }

    fetchNotes() {
        const { id } = this.state.student
        this.setState({loadingComments: true})
        this.props.fetchStudentNotes(id).then(comments => {
            this.setState({loadingComments: false, comments})
        })
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.studentId !== this.props.studentId) {
            let student = this.props.students.find(({id}) => this.props.studentId === id);
            this.setState({
                student
            })
        }
    }

    renderComments = () => {
        if(this.state.loadingComments) return null
        let data = this.state.comments.map(obj => (
            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                <td>
                    <div>{obj.comments}</div>
                    <div style={{fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'right'}}>{moment(obj.updateTS).fromNow()}</div>
                </td>
            </tr>
        ))
        if (data.length > 0) {
            data.shift()
        }
        return data
    }

    render() {
        const {student} = this.state;
        if(!student) return null;
        let columnsEnrol = [
            {name: 'name', title: 'Name'},
            {name: 'sku', title: 'SKU'},
            {name: 'orderId', title: 'Order Id', align: 'center'},
            {name: 'orderDate', title: 'Order Date', align: 'center'},
            {name: 'lineTotal', title: 'Order Amount', align: 'center'}
        ];
        let rowsEnrol = (student.enrolments !== null && typeof student.enrolments === "object") ? student.enrolments : [];
        rowsEnrol = rowsEnrol.map(enrolm => {
            return {
                ...enrolm,
                orderId: enrolm.order.orderId,
                orderDate: `${moment(enrolm.order.orderDate).locale('en').format('DD/MM/YYYY')}`,
                lineTotal: enrolm.order.lineTotal,
            }
        });
        let columnsContact = [
            {name: 'name', title: 'Name'},
            {name: 'primaryPhone', title: 'Primary Phone'},
            {name: 'secondaryPhone', title: 'Secondary Phone'},
        ];
        let tmpContact = null;
        if(student.parent.contacts) {
            tmpContact = student.parent.contacts.map(contact => ({
                ...contact,
                name: `${contact.firstName} ${contact.lastName}`,
                secondaryPhone: checkForNull(contact.secondaryPhone),
                primaryPhone: checkForNull(contact.primaryPhone)
            }))
        }
        let rowsContact = (tmpContact !== null && typeof tmpContact === "object") ? tmpContact : [];
        const { parent, additionalInfo } = student;
        const { address } = student.parent;


        return (
            <div>
            <Row className="show-grid">
                <Col xs={12} md={6} sm={12}>
                    <Table responsive className="table">
                        <thead>
                             <tr style={{backgroundColor: '#ddd'}}><th colspan="2">Student Information</th></tr>
                        </thead>
                        <tbody>
                            {/* student name */}
                            <tr>
                                <td><b>Name</b></td>
                                <td>{student.name}</td>
                            </tr>

                            {/* student age */}
                            <tr>
                                <td><b>Age</b></td>
                                <td>{student.age}</td>
                            </tr>

                            {/* student gender */}
                            <tr>
                                <td><b>Gender</b></td>
                                <td>{student.gender}</td>
                            </tr>

                            {/* allergic info */}
                            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                <td><b>Allergic Reaction</b></td>
                                <td>{(additionalInfo.reactions === '' || additionalInfo.reactions === 'null') ? 'None' : additionalInfo.reactions}</td>
                            </tr>

                            {/* liability */}
                            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                <td><b>Liability</b></td>
                                <td>{additionalInfo.liability === 'YES' ? 'Yes' : 'No'}</td>
                            </tr>

                            {/* Photography Consent */}
                            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                <td><b>Photography Consent</b></td>
                                <td>{additionalInfo.photographyConsent === 'Accept' ? 'Accept' : 'Decline'}</td>
                            </tr>

                            {/* Medical Consent */}
                            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                <td><b>Medical Consent</b></td>
                                <td>{additionalInfo.medicalConsent === 'Accept' ? 'Accept' : 'Decline'}</td>
                            </tr>

                            {/* parent info */}
                            <tr>
                                <td><b>Parent</b></td>
                                <td>
                                    <span>{`${parent.firstName} ${parent.lastName}`}</span><br />
                                    <a href={`mailto:${parent.email}`}>{parent.email}</a><br />
                                    <a href={`tel:${parent.phoneNum}`}>{parent.phoneNum}</a>
                                </td>
                            </tr>

                            {/* family doctor */}
                            <tr>
                                <td><b>Family Doctor</b></td>
                                <td>
                                    <span>{`${checkForNull(parent.familyDoctorName)}`}</span><br />
                                    <a href={`tel:${parent.familyDoctorPhone}`}>{checkForNull(parent.familyDoctorPhone)}</a>
                                </td>
                            </tr>

                            {/* contacts */}
                            {
                                rowsContact.map((contact, index) => {
                                    if(index === 0) {
                                        return (
                                            <tr>
                                                <td rowSpan={rowsContact.length}><b>Contacts</b></td>
                                                <td>
                                                    <span>{contact.name}</span><br />
                                                    <a href={`tel:${contact.primaryPhone}`}>{contact.primaryPhone}</a><br />
                                                    <a href={`tel:${contact.secondaryPhone}`}>{contact.secondaryPhone}</a>
                                                </td>
                                            </tr>
                                        )
                                    }
                                    return (
                                        <tr>
                                            <td>
                                                <span>{contact.name}</span><br />
                                                <a href={`tel:${contact.primaryPhone}`}>{contact.primaryPhone}</a><br />
                                                <a href={`tel:${contact.secondaryPhone}`}>{contact.secondaryPhone}</a>
                                            </td>
                                        </tr>
                                    )
                                })
                            }

                            {/* address */}
                            <tr>
                                <td><b>Address</b></td>
                                <td>
                                    <span>{`${address.address1} ${address.address2}`}</span><br />
                                    <span>{address.city} {address.province} {address.postalCode} {checkForNull(address.country)}</span>
                                </td>
                            </tr>

                            {/* notes */}
                            <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                <td rowSpan={this.state.comments.length}>
                                    <b>Notes</b>
                                </td>
                                {
                                    this.state.loadingComments &&
                                    <td>
                                        <ScaleLoader color={'#333'} loading={true} height={20} width={2}/>
                                    </td>
                                }
                                {
                                    !this.state.loadingComments && this.state.comments.length > 0 &&
                                    <td>
                                        <div>{this.state.comments[0].comments}</div>
                                        <div style={{fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'right'}}>{moment(this.state.comments[0].updateTS).fromNow()}</div>
                                    </td>
                                }
                                {
                                    !this.state.loadingComments && this.state.comments.length === 0 &&
                                    <td>None</td>
                                }
                            </tr>

                            {this.renderComments()}

                        </tbody>
                    </Table>
                </Col>

                <Col xs={12} md={6} sm={12}>
                    <Table responsive className="table table-bordered">
                        <thead>
                             <tr style={{backgroundColor: '#ddd'}}><th colSpan="2">Enrollments</th></tr>
                        </thead>
                        <tbody>

                            {/* enrollments */}
                            {
                                rowsEnrol.map((enrollment, index) => {
                                    return (
                                        <tr key={index}>
                                            <td><b>{index + 1}</b></td>
                                            <td>
                                                <div>
                                                    <div>
                                                        <b>{enrollment.name}</b><br />
                                                        <small>SKU: {enrollment.sku}</small>
                                                    </div>
                                                </div>
                                                <div>
                                                    <ul className={'enrolmOrderDetails'}>
                                                        <li><strong>Order Id</strong><br /><span>{enrollment.orderId}</span></li>
                                                        <li><strong>Date</strong><br /><span>{enrollment.orderDate}</span></li>
                                                        <li><strong>Amount</strong><br /><span>{enrollment.lineTotal}</span></li>
                                                    </ul>
                                                </div>

                                            </td>
                                        </tr>
                                    )
                                })
                            }

                            {
                                rowsEnrol.length === 0 &&
                                <tr>
                                    <td colSpan="2"><center>No Data Found</center></td>
                                </tr>
                            }

                        </tbody>
                    </Table>
                </Col>
            </Row>

                {false &&<Row className="show-grid">
                    <Col xs={12} md={12}>
                        <Button bsSize="small" onClick={this.props.onClose}>Close</Button>
                    </Col>
                </Row>}
            </div>
        )
    }
}

const checkForNull = value => {
    if(value === null || value === 'null') return '';
    return value;
}

const select = (store, ownProps) => ({
    students: store.service.students
});

const actions = dispatch => bindActionCreators({
    fetchStudentNotes: (studentId) => fetchStudentNotes({studentId}),
}, dispatch)

export default connect(select, actions)(StudentDetailView);
