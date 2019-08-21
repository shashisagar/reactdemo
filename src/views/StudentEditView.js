import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { fetchStudentDetail, updateStudentInfo, updateStudentEnrolment, deleteStudentInfo } from '../modules/main';
import { fetchStudentNotes } from '../modules/service';
import { bindActionCreators } from 'redux';
import { BeatLoader, ScaleLoader } from 'react-spinners';
import DatePicker from '../components/DatePicker';
import IntlTelInput from 'react-bootstrap-intl-tel-input'
import {splitProductSku, joinProductSku} from '../utils'
import Divider from '../components/Divider';
import { HelpBlock, Glyphicon, Table, Panel, Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap';
import Select from 'react-select';
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
import { push, goBack } from 'react-router-redux';

class StudentEditView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            student: null,
            editStudent: false,

            editEnrollment: false,
            oldProductPK: null,
            productIdSku: '',

            message: null, // { type: 'danger|success', content: 'message content' }
            loading: false,
            loadingComments: true,
            comments: []
        };
        this.onSaveStudentInfo = this.onSaveStudentInfo.bind(this);
        this.prapareProductList = this.prapareProductList.bind(this);
    }

    componentWillMount() {
        let { params } = this.props;
        if(Object.keys(this.props.studentsTblData).length === 0) {
            this.props.goToStudentsView()
            return
        }
        let student = this.props.students.find(({id}) => parseInt(params.studentId) === id);
        this.setState({
            student
        })
    }

    componentDidMount() {
        try {
            this.fetchNotes()
        }catch(err){
            console.log(err);
        }
    }

    fetchNotes() {
        const { id } = this.state.student
        this.setState({loadingComments: true})
        this.props.fetchStudentNotes(id).then(comments => {
            this.setState({loadingComments: false, comments})
        })
    }

    onProductChanged = (productIdSku) => {
        this.setState({productIdSku});
    }

    updateEnrolment = () => {
        if(this.state.loading) return
        let newProductPK = splitProductSku(this.state.productIdSku)
        Object.assign(newProductPK, {id: parseInt(newProductPK.id)})
        let oldProductPK = this.state.oldProductPK;
        let order = this.state.oldProductPK.order;
        delete oldProductPK.name;
        delete oldProductPK.order;
        let reqObj = {oldRecord:{}, newRecord:{}};
        Object.assign(reqObj.oldRecord, {productPK:oldProductPK}, {studentId: order.studentId, orderId: order.orderId})
        Object.assign(reqObj.newRecord, {productPK:newProductPK}, {studentId: order.studentId, orderId: order.orderId})
        this.setState({loading: true})
        this.props.updateStudentEnrolment(reqObj).then(data => {
            this.setState({
                editEnrollment: !this.state.editEnrollment,
                oldProductPK: null,
                student: data,
                message: { type: 'success', content: 'Student enrollment updated successfully!' },
                loading: false,
                productIdSku: null
            })
        }).catch(() => {
            this.setState({
                editEnrollment: !this.state.editEnrollment,
                oldProductPK: null,
                message: { type: 'danger', content: 'Error updating student enrollment. Please contact administrator.' },
                loading: false,
                productIdSku: null
            })
        })
    }

    prapareProductList() {
        let products = this.props.products
        let enrol = this.state.student.enrolments ? this.state.student.enrolments : []
        products = Object.values(products).filter(prod => enrol.filter(enr => enr.id === prod.productPK.id && enr.sku === prod.productPK.sku).length == 0 && prod.active)
        // products = Object.values(products).filter(product => product.active && !(prod.productPK.sku && prod.productPK.id));
        return Object.values(products).map(({productPK, name}) => ({ value: joinProductSku(productPK), label: `${name} ${productPK.sku ? '(SKU: '+productPK.sku+')' : ''}`}))
    }

    onSaveStudentInfo() {
        if(this.state.loading) return
        let studentInfo = this.state.student;
        let fieldValues = {
            studentNameField: this.studentNameField.getValue(),
            studentAgeField: this.studentAgeField.getValue(),
            studentGenderField: this.studentGenderField.getValue(),
            allergicReactionField: this.allergicReactionField.getValue(),
            liabilityField: this.liabilityField.getValue(),
            photographyConsentField: this.photographyConsentField.getValue(),
            medicalConsentField: this.medicalConsentField.getValue(),
            parentInfoField: this.parentInfoField.getValue(),
            doctorInfoField: this.doctorInfoField.getValue(),
            addressInfoField: this.addressInfoField.getValue()
        }
        // student info
        let updateStudent = Object.assign({id: studentInfo.id}, fieldValues.studentNameField, fieldValues.studentAgeField, fieldValues.studentGenderField)
        // student consent info
        let additionalInfo = {
        	reactions: fieldValues.allergicReactionField.value === '' ? 'None' : fieldValues.allergicReactionField.value,
        	liability: fieldValues.liabilityField.value.toUpperCase(),
        	photographyConsent: fieldValues.photographyConsentField.value,
        	medicalConsent: fieldValues.medicalConsentField.value
        }
        Object.assign(updateStudent, {additionalInfo})
        // parent info
        let parent = Object.assign({id: studentInfo.parent.id}, fieldValues.parentInfoField, fieldValues.doctorInfoField, {address: fieldValues.addressInfoField});
        Object.assign(updateStudent, {parent})
        Object.assign(studentInfo, updateStudent)

        let invalidFields = Object.keys(fieldValues).filter(key => !fieldValues[key].valid)
        if(invalidFields.length > 0) {
            this.setState({
                message: { type: 'danger', content: 'Please complete the below mandatory fields.' }
            })
            return
        }

        let comments = this.notesField.getValue().value.trim()
        let notes = {notes: []}
        if(comments.length > 0) {
            notes.notes.push({comments})
            Object.assign(updateStudent, notes)
        }

        this.setState({loading: true, message: null})
        this.props.updateStudentInfo(updateStudent).then(data => {
            this.setState({
                editStudent: false,
                student: data,
                message: { type: 'success', content: 'Student information updated successfully!' },
                loading: false
            })
            this.fetchNotes()
        }).catch(() => {
            this.setState({
                message: { type: 'danger', content: 'Error updating student information. Please contact administrator.' },
                loading: false
            })
        })
    }

    closeEditEnrolModal = () => {
        this.setState({
            editEnrollment: !this.state.editEnrollment,
            oldProductPK: null
        })
    }

    renderLoadingContent(condn) {
        if(!condn) return null
        return (
            <div>
                <Divider />
                <center><BeatLoader color={'#000'} loading={condn} /></center>
                <Divider />
            </div>
        )
    }

    onClickDeleteStudent = () => {

        this.setState({loading: true, message: null, deleteStudent: false, deletingOne: true}, () => {
            this.props.resetScroller()
            this.props.deleteStudentInfo({id: this.state.student.id}).then(() => {
                this.props.goBack()
            }).catch(() => {
                this.setState({
                    message: { type: 'danger', content: 'Error deleting student. Please contact administrator.' },
                    loading: false
                })
            })
        })
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
        if (data.length > 0 && !this.state.editStudent ) {
            data.shift()
        }
        return data
    }

    render() {
        const {student, editStudent, loading} = this.state;
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
                <style>{`
                    .form-group {
                        margin-bottom: 0px
                    }
                `}</style>
                {this.state.loading && this.renderLoadingContent(!this.state.editEnrollment)}
                {this.state.message && <Alert bsStyle={this.state.message.type}>{this.state.message.content}</Alert>}
                <Row className="show-grid">
                    <Col xs={12} md={6} sm={12}>
                        <Table responsive className="table">
                            <thead>
                                 <tr style={{backgroundColor: '#ddd'}}>
                                    <th colSpan="2">
                                        <div>
                                            <div className="pull-left">
                                                <span style={{lineHeight: 2.1}}>Student Information</span>
                                            </div>
                                            {
                                                this.props.isAdmin &&
                                                <div className="pull-right">
                                                    {
                                                        !editStudent &&
                                                        <ButtonGroup >
                                                            <Button disabled={this.state.loadingComments} bsSize="small" onClick={() => {this.setState({editStudent: !editStudent, message: null})}}><Glyphicon glyph="edit" />&nbsp;&nbsp;{'Edit'}</Button>
                                                         </ButtonGroup>
                                                    }
                                                    {
                                                        editStudent &&
                                                        <ButtonGroup >
                                                            <Button disabled={this.state.loading} bsSize="small" onClick={() => {this.setState({editStudent: !editStudent, message: null})}}>&nbsp;{'Cancel'}&nbsp;</Button>
                                                            <Button disabled={this.state.loading} bsSize="small" onClick={() => {this.onSaveStudentInfo()}}><Glyphicon glyph="save" />&nbsp;&nbsp;{'Save'}</Button>
                                                         </ButtonGroup>
                                                    }
                                                </div>
                                            }
                                            <div className="clearfix" />
                                        </div>

                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* student name */}
                                <tr>
                                    <td><b>Name</b></td>
                                    <td><StudentNameField ref={(ref) => {this.studentNameField = ref}} loading={loading} editing={editStudent} name={student.name} firstName={student.firstName} lastName={student.lastName}/></td>
                                </tr>

                                {/* student age */}
                                <tr>
                                    <td><b>{editStudent ? 'Date of Birth' : 'Age'}</b></td>
                                    <td><StudentAgeField ref={(ref) => {this.studentAgeField = ref}} loading={loading} editing={editStudent} age={student.age} dob={student.dob}/></td>
                                </tr>

                                {/* student gender */}
                                <tr>
                                    <td><b>Gender</b></td>
                                    <td><StudentGenderField ref={(ref) => {this.studentGenderField = ref}} loading={loading} editing={editStudent} gender={student.gender}/></td>
                                </tr>

                                {/* allergic info */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Allergic Reaction</b></td>
                                    <td><AllergicReactionField ref={(ref) => {this.allergicReactionField = ref}} loading={loading} editing={editStudent} value={additionalInfo.reactions} /></td>
                                </tr>

                                {/* liability */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Liability</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.liabilityField = ref}} loading={loading} editing={editStudent} value={additionalInfo.liability === 'YES' ? 'Yes' : 'No'} options={['Yes', 'No']} /></td>
                                </tr>

                                {/* Photography Consent */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Photography Consent</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.photographyConsentField = ref}} loading={loading} editing={editStudent} value={additionalInfo.photographyConsent === 'Accept' ? 'Accept' : 'Decline'} options={['Accept', 'Decline']} /></td>
                                </tr>

                                {/* Medical Consent */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Medical Consent</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.medicalConsentField = ref}} loading={loading} editing={editStudent} value={additionalInfo.medicalConsent === 'Accept' ? 'Accept' : 'Decline'} options={['Accept', 'Decline']} /></td>
                                </tr>

                                {/* parent info */}
                                <tr>
                                    <td><b>Parent</b></td>
                                    <td><ParentInfoField ref={(ref) => {this.parentInfoField = ref}} loading={loading} editing={editStudent} firstName={parent.firstName} lastName={parent.lastName} email={parent.email} phoneNum={parent.phoneNum}/></td>
                                </tr>

                                {/* family doctor */}
                                <tr>
                                    <td><b>Family Doctor</b></td>
                                    <td><DoctorInfoField ref={(ref) => {this.doctorInfoField = ref}} loading={loading} editing={editStudent} familyDoctorName={parent.familyDoctorName} familyDoctorPhone={parent.familyDoctorPhone}/></td>
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
                                    <td><AddressInfoField ref={(ref) => {this.addressInfoField = ref}} loading={loading} editing={editStudent} address1={address.address1} address2={address.address2} city={address.city} province={address.province} postalCode={address.postalCode} country={address.country} /></td>
                                </tr>


                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td rowSpan={editStudent ? this.state.comments.length + 1 : this.state.comments.length}>
                                        <b>Notes</b>
                                    </td>
                                    <td>
                                        <NotesField ref={(ref) => {this.notesField = ref}} loading={loading} editing={editStudent} comments={this.state.comments} loadingComments={this.state.loadingComments}/>
                                    </td>
                                </tr>

                                { this.renderComments() }

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
                                                        <div style={{float: 'left'}}>
                                                            <b>{enrollment.name}</b><br />
                                                            <small>SKU: {enrollment.sku}</small>
                                                        </div>
                                                        <div style={{float: 'right'}}>
                                                            {
                                                                !this.state.loading && this.props.isAdmin &&
                                                                <Glyphicon onClick={() => {
                                                                    this.setState({
                                                                        editEnrollment: true,
                                                                        message: null,
                                                                        oldProductPK: {
                                                                            name: enrollment.name,
                                                                            sku: enrollment.sku,
                                                                            id: enrollment.id,
                                                                            order: enrollment.order
                                                                        }
                                                                    })
                                                                }} style={{cursor: 'pointer', color: 'grey'}} glyph="edit" />
                                                            }
                                                        </div>
                                                        <div style={{clear: 'both'}} />
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

                <Modal show={this.state.editEnrollment} onHide={this.closeEditEnrolModal}>

                    <Modal.Header closeButton>
                        <Modal.Title>Edit Enrollment</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {this.state.loading && this.renderLoadingContent(this.state.editEnrollment)}
                        <Alert bsStyle="warning">{'Saved attendance for the old product will be lost'}</Alert>
                        <FormGroup>
                            <ControlLabel>Old Enrolment</ControlLabel>
                            {this.state.oldProductPK && <Panel>{this.state.oldProductPK.name}<small><strong>{` (SKU: ${this.state.oldProductPK.sku})`}</strong></small></Panel>}
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>New Enrolment</ControlLabel>
                            <Select
                                menuContainerStyle={{'zIndex': 999999999, position: 'absolute !important' }}
                                matchPos={'any'}
                                matchProp={'label'}
                                multi={false}
                                simpleValue
                                disabled={false}
                                placeholder={'Search by product name or sku'}
                                isLoading={false}
                                name="form-field-name"
                                value={this.state.productIdSku}
                                onChange={this.onProductChanged}
                                options={this.prapareProductList()} />
                        </FormGroup>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.closeEditEnrolModal}>Cancel</Button>
                        <Button disabled={!this.state.productIdSku} className="btn-primary" onClick={this.updateEnrolment}>Update</Button>
                    </Modal.Footer>
                </Modal>

                <Modal bsSize='small' show={this.state.deleteStudent} onHide={() => {this.setState({deleteStudent: false})}}>

                    <Modal.Header closeButton>
                        <Modal.Title>Delete Student</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>{`Are you sure you want to delete this student?`}</Modal.Body>

                    <Modal.Footer>
                        <Button onClick={() => {this.setState({deleteStudent: false})}}>Cancel</Button>
                        <Button bsStyle="danger" onClick={this.onClickDeleteStudent}>Confirm</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        )
    }
}

class StudentNameField extends React.Component {
    constructor(props) {
        super(props)
        const { name, editing, firstName, lastName, loading } = props
        this.state = { name, editing, firstName, lastName, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.name !== this.props.name) {
            this.setState({
                name: nextProps.name
            })
        }
        if(nextProps.firstName !== this.props.firstName) {
            this.setState({
                firstName: nextProps.firstName
            })
        }
        if(nextProps.lastName !== this.props.lastName) {
            this.setState({
                lastName: nextProps.lastName
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    validateFields = () => {
        const { firstName, lastName } = this.state
        var errorFields = {}
        if(firstName === '') errorFields.firstNameError = true
        if(lastName === '') errorFields.lastNameError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    getValue(){
        const { firstName, lastName } = this.state
        return { firstName, lastName, valid: this.validateFields() }
    }
    render() {
        const { name, firstName, lastName, editing, loading } = this.state
        if (editing) {
            return (
                <div>
                    <FormGroup validationState={this.state.firstNameError ? 'error' : null}>
                        <FormControl disabled={loading} type="text" value={firstName} placeholder="First Name" onChange={event => this.setState({firstName: event.target.value, firstNameError: false})}/>
                        {this.state.firstNameError && <HelpBlock><small><b>{'First name cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.lastNameError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={lastName} placeholder="Last Name" onChange={event => this.setState({lastName: event.target.value, lastNameError: false})}/>
                        {this.state.lastNameError && <HelpBlock><small><b>{'Last name cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                </div>
            )
        } else {
            return <span>{name}</span>
        }
    }
}

class StudentAgeField extends React.Component {
    constructor(props) {
        super(props)
        const { age, dob, editing, loading } = props
        this.state = { age, dob, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.age !== this.props.age) {
            this.setState({
                age: nextProps.age
            })
        }
        if(nextProps.dob !== this.props.dob) {
            this.setState({
                dob: nextProps.dob
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        return {
            dob: this.state.dob,
            valid: true
        }
    }
    render() {
        const { age, dob, editing, loading } = this.state
        let date = `${moment(dob).locale('en').format('YYYY-MM-DD')}`
        if (editing) {
            return <DatePicker disabled={loading} dateFormat="YYYY-MM-DD" onChange={value => this.setState({dob: new Date(value).getTime()})} value={date} />
        } else {
            return <span>{age}</span>
        }
    }
}

class StudentGenderField extends React.Component {
    constructor(props) {
        super(props)
        const { gender, editing, loading } = props
        this.state = { gender: gender === '' ? 'Male': gender, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.gender !== this.props.gender) {
            this.setState({
                gender: nextProps.gender
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        return {
            gender: this.state.gender,
            valid: true
        }
    }
    render() {
        const { gender, editing, loading } = this.state
        if (editing) {
            return (
                <FormControl disabled={loading} value={gender} componentClass="select" placeholder="select" onChange={event => this.setState({gender: event.target.value})}>
    				<option value="Male">Male</option>
                    <option value="Female">Female</option>
    			</FormControl>
            )
        } else {
            return <span>{gender}</span>
        }
    }
}

class NotesField extends React.Component {
    constructor(props) {
        super(props)
        const { value = '', editing, loading, comments, loadingComments } = props
        this.state = { value, editing, loading, comments, loadingComments }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.comments !== this.props.comments) {
            this.setState({
                comments: nextProps.comments
            })
        }
        if(nextProps.loadingComments !== this.props.loadingComments) {
            this.setState({
                loadingComments: nextProps.loadingComments
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        this.setState({
            value: ''
        })
        return {
            value: this.state.value,
            valid: true
        }
    }
    render() {
        const { value, editing, loading, loadingComments, comments } = this.state
        if (loadingComments) return <ScaleLoader color={'#333'} loading={true} height={20} width={2}/>
        if (editing) {
            return (
                <FormGroup validationState={null}>
                    <FormControl maxLength={500} disabled={loading} value={value} componentClass="textarea" style={{ height: 120 }} onChange={event => this.setState({value: event.target.value})}/>
                    <HelpBlock><small><b>{`${500 - value.length} Characters left`}</b></small></HelpBlock>
                </FormGroup>
            )
        } else {
            if (comments.length > 0)
            return (
                <div>
                    <div>{comments[0].comments}</div>
                    <div style={{fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'right'}}>{moment(comments[0].updateTS).fromNow()}</div>
                </div>
            )
            return <div><div>{'None'}</div></div>
        }
    }
}

class AllergicReactionField extends React.Component {
    constructor(props) {
        super(props)
        const { value, editing, loading } = props
        this.state = { value: value === 'null' ? '' : value, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value === 'null' ? '' : nextProps.value
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        return {
            value: this.state.value,
            valid: true
        }
    }
    render() {
        const { value, editing, loading } = this.state
        if (editing) {
            return (
                <FormControl disabled={loading} value={value} componentClass="textarea" style={{ height: 120 }} onChange={event => this.setState({value: event.target.value})}/>
            )
        } else {
            return <span>{value === '' ? 'None' : value}</span>
        }
    }
}

class ConsentOptionsField extends React.Component {
    constructor(props) {
        super(props)
        const { value, editing, loading } = props
        this.state = { value, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        return {
            value: this.state.value,
            valid: true
        }
    }
    render() {
        const { value, editing, loading } = this.state
        const { options } = this.props
        if (editing) {
            return (
                <FormControl disabled={loading} value={value} componentClass="select" placeholder="select" onChange={event => this.setState({value: event.target.value})}>
                    {
                        options.map(value => (
                            <option value={value}>{value}</option>
                        ))
                    }
    			</FormControl>
            )
        } else {
            return <span>{value}</span>
        }
    }
}

class ParentInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { firstName, lastName, email, phoneNum, editing, loading } = props
        this.state = { firstName, lastName, email, phoneNum, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.firstName !== this.props.firstName) {
            this.setState({
                firstName: nextProps.firstName
            })
        }
        if(nextProps.lastName !== this.props.lastName) {
            this.setState({
                lastName: nextProps.lastName
            })
        }
        if(nextProps.email !== this.props.email) {
            this.setState({
                email: nextProps.email
            })
        }
        if(nextProps.phoneNum !== this.props.phoneNum) {
            this.setState({
                phoneNum: nextProps.phoneNum
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    validateFields = () => {
        const { firstName, lastName, email, phoneNum } = this.state
        var errorFields = {}
        if(firstName === '') errorFields.firstNameError = true
        if(lastName === '') errorFields.lastNameError = true
        if(email === '') errorFields.emailError = true
        if(phoneNum === '') errorFields.phoneNumError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    getValue(){
        const { firstName, lastName, email, phoneNum } = this.state
        return {
            firstName, lastName, email, phoneNum, valid: this.validateFields()
        }
    }
    render() {
        const { firstName, lastName, email, phoneNum, editing, loading } = this.state
        if (editing) {
            return (
                <div>
                    <FormGroup validationState={this.state.firstNameError ? 'error' : null}>
                        <FormControl disabled={loading} type="text" value={firstName} placeholder="First Name" onChange={event => this.setState({firstName: event.target.value, firstNameError: false})}/>
                        {this.state.firstNameError && <HelpBlock><small><b>{'First name cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.lastNameError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={lastName} placeholder="Last Name" onChange={event => this.setState({lastName: event.target.value, lastNameError: false})}/>
                        {this.state.lastNameError && <HelpBlock><small><b>{'Last name cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.emailError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="email" value={email} placeholder="Email" onChange={event => this.setState({email: event.target.value, emailError: false})}/>
                        {this.state.emailError && <HelpBlock><small><b>{'Email is invalid.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.phoneNumError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={phoneNum} placeholder="Phone Number" onChange={event => this.setState({phoneNum: event.target.value, phoneNumError: false})}/>
                        {this.state.phoneNumError && <HelpBlock><small><b>{'Phone number is invalid.'}</b></small></HelpBlock>}
                    </FormGroup>
                </div>
            )
        } else {
            return (
                <div>
                    <span>{`${firstName} ${lastName}`}</span><br />
                    <a href={`mailto:${email}`}>{email}</a><br />
                    <a href={`tel:${phoneNum}`}>{phoneNum}</a>
                </div>
            )
        }
    }
}

class DoctorInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { familyDoctorName, familyDoctorPhone, editing, loading } = props
        this.state = { familyDoctorName, familyDoctorPhone, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.familyDoctorName !== this.props.familyDoctorName) {
            this.setState({
                familyDoctorName: nextProps.familyDoctorName
            })
        }
        if(nextProps.familyDoctorPhone !== this.props.familyDoctorPhone) {
            this.setState({
                familyDoctorPhone: nextProps.familyDoctorPhone
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    validateFields = () => {
        const { familyDoctorName, familyDoctorPhone } = this.state
        var errorFields = {}
        if(familyDoctorName === '') errorFields.familyDoctorNameError = true
        if(familyDoctorPhone === '') errorFields.familyDoctorPhoneError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    getValue(){
        const { familyDoctorName, familyDoctorPhone } = this.state
        return {
            familyDoctorName, familyDoctorPhone, valid: this.validateFields()
        }
    }
    render() {
        const { familyDoctorName, familyDoctorPhone, editing, loading } = this.state
        if (editing) {
            return (
                <div>
                    <FormGroup validationState={this.state.familyDoctorNameError ? 'error' : null}>
                        <FormControl disabled={loading} type="text" value={familyDoctorName} placeholder="Name" onChange={event => this.setState({familyDoctorName: event.target.value, familyDoctorNameError: false})}/>
                        {this.state.familyDoctorNameError && <HelpBlock><small><b>{'Family doctor name cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.familyDoctorPhoneError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={familyDoctorPhone} placeholder="Phone Number" onChange={event => this.setState({familyDoctorPhone: event.target.value, familyDoctorPhoneError: false})}/>
                        {this.state.familyDoctorPhoneError && <HelpBlock><small><b>{'Family doctor phone number is invalid.'}</b></small></HelpBlock>}
                    </FormGroup>
                </div>
            )
        } else {
            return (
                <div>
                    <span>{`${checkForNull(familyDoctorName)}`}</span><br />
                    <a href={`tel:${familyDoctorPhone}`}>{checkForNull(familyDoctorPhone)}</a>
                </div>
            )
        }
    }
}

class AddressInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { address1, address2, city, province, postalCode, country, editing, loading } = props
        this.state = { address1, address2, city, province, postalCode, country: country === "null" ? "" : country, editing, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.address1 !== this.props.address1) {
            this.setState({
                address1: nextProps.address1
            })
        }
        if(nextProps.address2 !== this.props.address2) {
            this.setState({
                address2: nextProps.address2
            })
        }
        if(nextProps.city !== this.props.city) {
            this.setState({
                city: nextProps.city
            })
        }
        if(nextProps.province !== this.props.province) {
            this.setState({
                province: nextProps.province
            })
        }
        if(nextProps.postalCode !== this.props.postalCode) {
            this.setState({
                postalCode: nextProps.postalCode
            })
        }
        if(nextProps.country !== this.props.country) {
            this.setState({
                country: nextProps.country
            })
        }
        if(nextProps.editing !== this.props.editing) {
            this.setState({
                editing: nextProps.editing
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        const { address1, address2, city, province, postalCode, country } = this.state
        return {
            address1, address2, city, province, postalCode, country, valid: this.validateFields()
        }
    }
    validateFields = () => {
        const { address1, address2, city, province, postalCode, country } = this.state
        var errorFields = {}
        if(address1 === '') errorFields.address1Error = true
        if(city === '') errorFields.cityError = true
        if(province === '') errorFields.provinceError = true
        if(postalCode === '') errorFields.postalCodeError = true
        if(country === '') errorFields.countryError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    render() {
        const { address1, address2, city, province, postalCode, country, editing, loading } = this.state
        if (editing) {
            return (
                <div>
                    <FormGroup validationState={this.state.address1Error ? 'error' : null}>
                        <FormControl disabled={loading} type="text" value={address1} placeholder="Address 1" onChange={event => this.setState({address1: event.target.value, address1Error: false})}/>
                        {this.state.address1Error && <HelpBlock><small><b>{'Address cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={address2} placeholder="Address 2" onChange={event => this.setState({address2: event.target.value})}/>
                    <FormGroup validationState={this.state.cityError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={city} placeholder="City" onChange={event => this.setState({city: event.target.value, cityError: false})}/>
                        {this.state.cityError && <HelpBlock><small><b>{'City cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.provinceError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={province} placeholder="Province" onChange={event => this.setState({province: event.target.value, provinceError: false})}/>
                        {this.state.provinceError && <HelpBlock><small><b>{'Province cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.postalCodeError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={postalCode} placeholder="Postal Code" onChange={event => this.setState({postalCode: event.target.value, postalCodeError: false})}/>
                        {this.state.postalCodeError && <HelpBlock><small><b>{'Postal code cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                    <FormGroup validationState={this.state.countryError ? 'error' : null}>
                        <FormControl disabled={loading} style={{marginTop: 8}} type="text" value={country} placeholder="Country" onChange={event => this.setState({country: event.target.value, countryError: false})}/>
                        {this.state.countryError && <HelpBlock><small><b>{'Country cannot be empty.'}</b></small></HelpBlock>}
                    </FormGroup>
                </div>
            )
        } else {
            return (
                <div>
                    <span>{`${address1} ${address2}`}</span><br />
                    <span>{city} {province} {postalCode} {checkForNull(country)}</span>
                </div>
            )
        }
    }
}

// {(additionalInfo.reactions === '' || additionalInfo.reactions === 'null') ? 'None' : additionalInfo.reactions}

const checkForNull = value => {
    if(value === null || value === 'null') return '';
    return value;
}

const select = (store, ownProps) => ({
    params: ownProps.match.params,
    students: store.service.students,
    studentsTblData: store.main.studentsTblData,
    products: store.service.products,
    isAdmin: store.service.user.admin
});

const actions = dispatch => bindActionCreators({
    goToStudentsView: () => push(`/secured/students`),
    updateStudentInfo: (data) => updateStudentInfo({data}),
    updateStudentEnrolment: (data) => updateStudentEnrolment({data}),
    deleteStudentInfo: (data) => deleteStudentInfo({data}),
    fetchStudentNotes: (studentId) => fetchStudentNotes({studentId}),
    goBack: () => goBack(),
}, dispatch)

export default connect(select, actions)(StudentEditView);

/*
{
    !this.state.deletingOne &&
    <div style={{backgroundColor: '#ddd', borderColor: '#ddd', padding: 8, borderRadius: 4, textAlign: 'right', marginBottom: 16}}>
        <Button bsStyle="danger" onClick={() => this.setState({ deleteStudent: true })}>
            {'Delete Student'}
        </Button>
    </div>
}
*/
