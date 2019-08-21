import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push, goBack } from 'react-router-redux'
import { BeatLoader } from 'react-spinners';
import DatePicker from '../components/DatePicker';
import IntlTelInput from 'react-bootstrap-intl-tel-input'
import { splitProductSku, joinProductSku } from '../utils'
import Divider from '../components/Divider';
import moment from 'moment';
import { createNewStudent, searchParent } from '../modules/main'
import { ListGroupItem, ListGroup, InputGroup, HelpBlock, Glyphicon, Table, Panel, Pager, ControlLabel, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap'

const initialStudent = {
    firstName: "",
    lastName: "",
    dob: new Date().getTime(),
    gender: "",
    additionalInfo: {
        reactions: "",
        liability: "",
        photographyConsent: "",
        medicalConsent: ""
    },
    parent: {
        firstName: "",
        lastName: "",
        email: "",
        phoneNum: "",
        familyDoctorName: "",
        familyDoctorPhone: "",
        address: {
            address1: "",
            address2: "",
            city: "",
            province: "",
            postalCode: "",
            country: ""
        },
        contacts: [
            {
                firstName: "",
                lastName: "",
                primaryPhone: "",
                secondaryPhone: ""
            }
        ]
    }
}
/*

"lastName": "Shammy",
"firstName": "Mobi",
"middleInitials": null,
"email": "mail@mobi.in",
"phoneNum": "1233333333",
"familyDoctorName": "Yau",
"familyDoctorPhone": "1111111111",

*/
class CreateStudent extends React.Component {
    state = {
        student: initialStudent,
        message: null, // { type: 'danger|success', content: 'message content' }
        loading: false,

        newParentRecord: true,
        searchByName: '',

        parentSearchModal: false,
        parentSearchData: null,
        selectedParent: null,
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
    saveStudent = () => {
        const { newParentRecord, selectedParent } = this.state
        this.props.resetScroller()
        let fieldValues = {
            studentNameField: this.studentNameField.getValue(),
            studentAgeField: this.studentAgeField.getValue(),
            studentGenderField: this.studentGenderField.getValue(),
            allergicReactionField: this.allergicReactionField.getValue(),
            liabilityField: this.liabilityField.getValue(),
            photographyConsentField: this.photographyConsentField.getValue(),
            medicalConsentField: this.medicalConsentField.getValue()
        }
        if(newParentRecord)
        Object.assign(fieldValues, {
            parentInfoField: this.parentInfoField.getValue(),
            doctorInfoField: this.doctorInfoField.getValue(),
            addressInfoField: this.addressInfoField.getValue(),
            contactsField: this.contactsField.getValue()
        })

        let invalidFields = Object.keys(fieldValues).filter(key => {
            if(!Array.isArray(fieldValues[key])) return !fieldValues[key].valid
            return fieldValues[key].filter(obj => !obj.valid).length !== 0
        })

        if(invalidFields.length > 0) return this.setState({ message: { type: 'danger', content: 'Please complete the below mandatory fields.' } })
        if(!newParentRecord && selectedParent === null) return this.setState({ message: { type: 'danger', content: 'Existing parent is not specified. [Tip: Search Parent > Select Parent Record]' } })

        let studentInfo = {}
        // student info
        let student = Object.assign({}, fieldValues.studentNameField, fieldValues.studentAgeField, fieldValues.studentGenderField)

        // student consent info
        let additionalInfo = {
        	reactions: fieldValues.allergicReactionField.value === '' ? 'None' : fieldValues.allergicReactionField.value,
        	liability: fieldValues.liabilityField.value.toUpperCase(),
        	photographyConsent: fieldValues.photographyConsentField.value,
        	medicalConsent: fieldValues.medicalConsentField.value
        }

        Object.assign(student, {additionalInfo})


        // parent info
        let parent = newParentRecord
            ? Object.assign(fieldValues.parentInfoField, fieldValues.doctorInfoField, {address: fieldValues.addressInfoField}, {contacts: fieldValues.contactsField.contacts})
            : selectedParent
        Object.assign(student, {parent})

        Object.assign(studentInfo, student)

        this.setState({loading: true, message: null})
        this.props.createNewStudent(studentInfo).then(data => {
            this.setState({
                student: initialStudent,
                message: { type: 'success', content: 'Student created successfully!' },
                loading: false
            })
        }).catch(() => {
            this.setState({
                message: { type: 'danger', content: 'Error creating student. Please contact administrator.' },
                loading: false
            })
        })

    }
    searchParentInfo = () => {
        this.setState({parentSearchData: [], loading: true})
        this.props.searchParent(this.state.searchByName)
        .then(persons => {
            this.setState({parentSearchData: persons, loading: false})
        })
    }
    render() {
        const {student, loading} = this.state;
        return (
            <div>
                <style>{`
                    .form-group {
                        margin-bottom: 0px
                    }
                `}</style>
                {this.state.loading && this.renderLoadingContent(!this.state.parentSearchModal)}
                {this.state.message && <Alert bsStyle={this.state.message.type}>{this.state.message.content}</Alert>}
                <Row className="show-grid">
                    <Col xs={12} md={6} sm={12}>
                        <Table responsive className="table">
                            <thead>
                                 <tr style={{backgroundColor: '#ddd'}}>
                                    <th colSpan="2">
                                        <span style={{lineHeight: 2.1}}>Student Information</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* student name */}
                                <tr>
                                    <td><b>{'Name'}</b></td>
                                    <td><StudentNameField ref={(ref) => {this.studentNameField = ref}} loading={loading} firstName={student.firstName} lastName={student.lastName}/></td>
                                </tr>

                                {/* student age */}
                                <tr>
                                    <td><b>{'Date of Birth'}</b></td>
                                    <td><StudentAgeField ref={(ref) => {this.studentAgeField = ref}} loading={loading} dob={student.dob}/></td>
                                </tr>

                                {/* student gender */}
                                <tr>
                                    <td><b>Gender</b></td>
                                    <td><StudentGenderField ref={(ref) => {this.studentGenderField = ref}} loading={loading} gender={student.gender}/></td>
                                </tr>

                                {/* allergic info */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Allergic Reaction</b></td>
                                    <td><AllergicReactionField ref={(ref) => {this.allergicReactionField = ref}} loading={loading} value={student.additionalInfo.reactions} /></td>
                                </tr>

                                {/* liability */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Liability</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.liabilityField = ref}} loading={loading} value={student.additionalInfo.liability} options={['Yes', 'No']} /></td>
                                </tr>

                                {/* Photography Consent */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Photography Consent</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.photographyConsentField = ref}} loading={loading} value={student.additionalInfo.photographyConsent} options={['Accept', 'Decline']} /></td>
                                </tr>

                                {/* Medical Consent */}
                                <tr style={{backgroundColor: 'rgb(255, 249, 235)'}}>
                                    <td><b>Medical Consent</b></td>
                                    <td><ConsentOptionsField ref={(ref) => {this.medicalConsentField = ref}} loading={loading} value={student.additionalInfo.medicalConsent} options={['Accept', 'Decline']} /></td>
                                </tr>

                            </tbody>
                        </Table>
                    </Col>
                    <Col xs={12} md={6} sm={12}>
                        <Table responsive className="table">
                            <thead>
                                 <tr style={{backgroundColor: '#ddd'}}>
                                    <th colSpan="2">
                                        <span style={{lineHeight: 2.1}}>Parent Information</span>
                                    </th>
                                </tr>
                            </thead>

                            {
                                <tbody>

                                    <tr>
                                        <td><b>Record Type</b></td>
                                        <td>
                                            <FormControl disabled={loading} value={this.state.newParentRecord ? 0 : 1} componentClass="select" placeholder="select" onChange={event => this.setState({newParentRecord: event.target.value == 0, searchByName: '', message: null})}>
                                                <option value={0}>{'New Parent'}</option>
                                                <option value={1}>{'Existing Parent'}</option>
                                            </FormControl>
                                        </td>
                                    </tr>

                                    { this.state.selectedParent &&
                                        <tr>
                                            <td><b>Name</b></td>
                                            <td><span>{`${this.state.selectedParent.firstName} ${this.state.selectedParent.lastName}`}</span></td>
                                        </tr>
                                    }

                                    { this.state.selectedParent &&
                                        <tr>
                                            <td><b>Email</b></td>
                                            <td><span>{`${this.state.selectedParent.email}`}</span></td>
                                        </tr>
                                    }

                                    { this.state.selectedParent &&
                                        <tr>
                                            <td><b>Phone Number</b></td>
                                            <td><span>{`${this.state.selectedParent.phoneNum}`}</span></td>
                                        </tr>
                                    }

                                    { !this.state.newParentRecord && <tr>
                                        <td colSpan='2' style={{textAlign: 'right'}}>
                                            <Button onClick={this.openParentSearchModal} disabled={loading}>
                                                <Glyphicon  glyph="zoom-in" />
                                                {!this.state.selectedParent ? ' Search Parent' : ' Modify Search'}
                                            </Button>
                                        </td>
                                    </tr>}

                                    {/* parent info */}
                                    { this.state.newParentRecord && <tr>
                                        <td><b>Parent</b></td>
                                        <td><ParentInfoField ref={(ref) => {this.parentInfoField = ref}} loading={loading} firstName={student.parent.firstName} lastName={student.parent.lastName} email={student.parent.email} phoneNum={student.parent.phoneNum}/></td>
                                    </tr> }

                                    {/* family doctor */}
                                    { this.state.newParentRecord && <tr>
                                        <td><b>Family Doctor</b></td>
                                        <td><DoctorInfoField ref={(ref) => {this.doctorInfoField = ref}} loading={loading} familyDoctorName={student.parent.familyDoctorName} familyDoctorPhone={student.parent.familyDoctorPhone}/></td>
                                    </tr>}

                                    {/* address */}
                                    { this.state.newParentRecord && <tr>
                                        <td><b>Contacts</b></td>
                                        <td><ContactsField ref={(ref) => {this.contactsField = ref}} loading={loading} contacts={student.parent.contacts} /></td>
                                    </tr>}

                                    {/* address */}
                                    { this.state.newParentRecord && <tr>
                                        <td><b>Address</b></td>
                                        <td><AddressInfoField ref={(ref) => {this.addressInfoField = ref}} loading={loading} address1={student.parent.address.address1} address2={student.parent.address.address2} city={student.parent.address.city} province={student.parent.address.province} postalCode={student.parent.address.postalCode} country={student.parent.address.country} /></td>
                                    </tr>}
                                </tbody>
                            }
                        </Table>

                        <div style={{backgroundColor: '#ddd', borderColor: '#ddd', padding: 8, borderRadius: 4, textAlign: 'right'}}>
                            <Button bsStyle="primary" onClick={this.saveStudent}>
                                {'Save'}
                            </Button>
                        </div>
                    </Col>
                </Row>

                <Modal show={this.state.parentSearchModal} onHide={this.closeParentSearchModal}>

                    <Modal.Header closeButton>
                        <Modal.Title>Search Parent</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {this.state.loading && this.renderLoadingContent(this.state.parentSearchModal)}
                        { this.state.parentSearchData !== null && this.state.parentSearchData.length == 0 && !this.state.loading && <Alert bsStyle="warning">{`Sorry, no result found.`}</Alert>}
                        <FormGroup disabled={loading}>
                            <InputGroup>
                                <FormControl type="text" value={this.state.searchByName} placeholder="Search by First Name / Last Name" onChange={event => this.setState({searchByName: event.target.value, message: null})}/>
                                <InputGroup.Button>
                                    <Button onClick={this.searchParentInfo} disabled={this.state.searchByName === ''} bsStyle="primary">Seach</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                        {
                            this.state.parentSearchData !== null &&
                            <ListGroup style={{marginTop: 8}}>
                            { this.state.parentSearchData.map((prnt, idx) =>
                                <ListGroupItem onClick={this.chooseParent(idx)} header={`${prnt.firstName} ${prnt.lastName}`}>
                                    <Row className="show-grid">
                                        <Col xs={12} smHidden={true} mdHidden={true} lgHidden={true}>
                                            <small><strong>Email:</strong> {prnt.email}</small>
                                        </Col>
                                        <Col xs={12} smHidden={true} mdHidden={true} lgHidden={true}>
                                            <small><strong>Phone Number:</strong> {prnt.phoneNum}</small>
                                        </Col>
                                        <Col xsHidden={true} sm={12} md={12} lg={12}>
                                            <small><strong>Email:</strong> {prnt.email} <strong>Phone Number:</strong> {prnt.phoneNum}</small>
                                        </Col>
                                    </Row>
                                </ListGroupItem>) }
                            </ListGroup>
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeParentSearchModal}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        )
    }
    confirmParentSelect = () => {
        console.log('confirmParentSelect --> ');
    }
    closeParentSearchModal = () => {
        this.setState({parentSearchModal: false, message: null, parentSearchData: null, searchByName: ''})
    }
    openParentSearchModal = () => {
        this.setState({parentSearchModal: true, message: null, parentSearchData: null, searchByName: ''})
    }
    chooseParent = idx => () => {
        this.setState({parentSearchModal: false, message: null, parentSearchData: null, searchByName: '', selectedParent: this.state.parentSearchData[idx]})
    }
}

class StudentNameField extends React.Component {
    constructor(props) {
        super(props)
        const { firstName, lastName, loading } = props
        this.state = { firstName, lastName, loading }
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
        const { firstName, lastName, loading } = this.state
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
    }
}

class StudentAgeField extends React.Component {
    constructor(props) {
        super(props)
        const { dob, loading } = props
        this.state = { dob, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.dob !== this.props.dob) {
            this.setState({
                dob: nextProps.dob
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
        const { dob, loading } = this.state
        let date = `${moment(dob).locale('en').format('YYYY-MM-DD')}`
        return <DatePicker disabled={loading} dateFormat="YYYY-MM-DD" onChange={value => this.setState({dob: new Date(value).getTime()})} value={date} />
    }
}

class StudentGenderField extends React.Component {
    constructor(props) {
        super(props)
        const { gender, loading } = props
        this.state = { gender, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.gender !== this.props.gender) {
            this.setState({
                gender: nextProps.gender
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    validateFields = () => {
        const { gender } = this.state
        var errorFields = {}
        if(gender === '') errorFields.genderError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    getValue(){
        return {
            gender: this.state.gender,
            valid: this.validateFields()
        }
    }
    render() {
        const { gender, loading } = this.state
        return (
            <FormGroup validationState={this.state.genderError ? 'error' : null}>
                <FormControl disabled={loading} value={gender} componentClass="select" placeholder="select" onChange={event => this.setState({gender: event.target.value, genderError: false})}>
                    <option value="">Please Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </FormControl>
            </FormGroup>
        )
    }
}

class AllergicReactionField extends React.Component {
    constructor(props) {
        super(props)
        const { value, loading } = props
        this.state = { value, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value === 'null' ? '' : nextProps.value
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
        const { value, loading } = this.state
        return (
            <FormControl disabled={loading} value={value} componentClass="textarea" style={{ height: 120 }} onChange={event => this.setState({value: event.target.value})}/>
        )
    }
}

class ConsentOptionsField extends React.Component {
    constructor(props) {
        super(props)
        const { value, loading } = props
        this.state = { value, loading }
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.value !== this.props.value) {
            this.setState({
                value: nextProps.value
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    validateFields = () => {
        const { value } = this.state
        var errorFields = {}
        if(value === '') errorFields.valueError = true
        this.setState({...errorFields})
        return Object.keys(errorFields).length === 0
    }
    getValue(){
        return {
            value: this.state.value,
            valid: this.validateFields()
        }
    }
    render() {
        const { value, loading } = this.state
        const { options } = this.props
        let tval = options.map(value => (
            <option value={value}>{value}</option>
        ))
        tval.unshift(<option value=''>Please Select</option>)
        return (
            <FormGroup validationState={this.state.valueError ? 'error' : null}>
                <FormControl disabled={loading} value={value} componentClass="select" placeholder="select" onChange={event => this.setState({value: event.target.value, valueError: false})}>
                { tval }
                </FormControl>
            </FormGroup>

        )
    }
}

class ParentInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { firstName, lastName, email, phoneNum, loading } = props
        this.state = { firstName, lastName, email, phoneNum, loading }
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
        const { firstName, lastName, email, phoneNum, loading } = this.state
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
    }
}

class DoctorInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { familyDoctorName, familyDoctorPhone, loading } = props
        this.state = { familyDoctorName, familyDoctorPhone, loading }
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
        const { familyDoctorName, familyDoctorPhone, loading } = this.state
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
    }
}

class AddressInfoField extends React.Component {
    constructor(props) {
        super(props)
        const { address1, address2, city, province, postalCode, country, loading } = props
        this.state = { address1, address2, city, province, postalCode, country, loading }
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
        const { address1, address2, city, province, postalCode, country, loading } = this.state
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
    }
}

class ContactsField extends React.Component {
    constructor(props) {
        super(props)
        const { contacts, loading } = props
        this.state = { contacts, loading }
    }
    handleAddSpec = () => this.setState({ contacts: this.state.contacts.concat([{ firstName: '', lastName: '', primaryPhone: '', secondaryPhone: '' } ]) })
    handleRemoveSpec = idx => () => this.setState({ contacts: this.state.contacts.filter((s, sidx) => idx !== sidx) })
    handleSpecChange = idx => (e) => {
        const contacts = this.state.contacts.map((contact, sidx) => {
            if (idx !== sidx) return contact
            let name = e.target.name, value = e.target.value, errKey = `${name}Error`
            return { ...contact, [name]: value, [errKey]: false }
        })
        this.setState({ contacts })
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.contacts !== this.props.contacts) {
            this.setState({
                contacts: nextProps.contacts
            })
        }
        if(nextProps.loading !== this.props.loading) {
            this.setState({
                loading: nextProps.loading
            })
        }
    }
    getValue(){
        const { contacts } = this.state
        return {
            contacts, valid: this.validateFields()
        }
    }
    validateFields = () => {
        const { contacts } = this.state
        let fields = contacts.map((contact, idx) => {
            var errorFields = {}
            if(contact.firstName === '') errorFields.firstNameError = true
            if(contact.lastName === '') errorFields.lastNameError = true
            if(contact.primaryPhone === '') errorFields.primaryPhoneError = true
            return {
                ...contact,
                ...errorFields,
                valid: Object.keys(errorFields).length === 0
            }
        })
        this.setState({contacts: fields})
        return fields.filter(v => !v.valid).length === 0
    }
    render() {
        const { contacts, loading } = this.state
        return (
            <div>
            {
                contacts.map((contact, idx) => (
                    <div style={{backgroundColor: '#f5f5f5', borderColor: '#ddd', padding: 8, borderRadius: 4, marginTop: idx === 0 ? 0 : 8}}>
                        <FormGroup validationState={contact.firstNameError ? 'error' : null}>
                            <FormControl disabled={loading} type="text" value={contact.firstName} placeholder="First Name" name='firstName' onChange={this.handleSpecChange(idx)}/>
                        </FormGroup>
                        <FormGroup style={{marginTop: 8}} validationState={contact.lastNameError ? 'error' : null}>
                            <FormControl disabled={loading} type="text" value={contact.lastName} placeholder="Last name" name='lastName' onChange={this.handleSpecChange(idx)}/>
                        </FormGroup>
                        <FormGroup style={{marginTop: 8}} validationState={contact.primaryPhoneError ? 'error' : null}>
                            <FormControl disabled={loading} type="text" value={contact.primaryPhone} placeholder="Primary Phone" name='primaryPhone' onChange={this.handleSpecChange(idx)}/>
                        </FormGroup>
                        <FormGroup style={{marginTop: 8}} validationState={contact.secondaryPhoneError ? 'error' : null}>
                            <FormControl disabled={loading} type="text" value={contact.secondaryPhone} placeholder="Secondary Phone" name='secondaryPhone' onChange={this.handleSpecChange(idx)}/>
                        </FormGroup>
                        <Button style={{marginTop: 8}} bsSize="small" onClick={this.handleRemoveSpec(idx)}>
                            <Glyphicon  glyph="minus" />
                            {' Remove contact'}
                        </Button>
                    </div>
                ))
            }
            <div style={{backgroundColor: '#f5f5f5', borderColor: '#ddd', padding: 8, borderRadius: 4, marginTop: contacts.length === 0 ? 0 : 8}}>
                <Button bsSize="small" onClick={this.handleAddSpec}>
                    <Glyphicon  glyph="plus" />
                    {' Add a new contact'}
                </Button>
            </div>
            </div>
        )
    }
}

/*
<Form.Group>
    <Form.Input error={contact.specName === ''} width={6} fluid placeholder='SKU' name='specName' value={contact.specName} onChange={this.handleSpecChange(idx)}/>
    <Form.Input width={6} fluid placeholder='Model' name='specValue' value={contact.specValue} onChange={this.handleSpecChange(idx)}/>
    <Form.Button width={2} circular icon='minus' onClick={this.handleRemoveSpec(idx)} />
</Form.Group>
*/

const select = store => ({
})

const actions = dispatch => bindActionCreators({
    createNewStudent: (data) => createNewStudent({data}),
    searchParent: (data) => searchParent({data})
}, dispatch)

export default connect(select, actions)(CreateStudent)
