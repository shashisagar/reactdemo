import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { BeatLoader } from 'react-spinners';
import Divider from '../components/Divider';
import { Table, Panel, Pager, ControlLabel, HelpBlock, Modal, FormGroup, FormControl, Form, Button, ButtonToolbar, Alert, ButtonGroup, DropdownButton, MenuItem, ToggleButtonGroup, ToggleButton, Col, Row, Nav, NavItem, NavDropdown, Grid as BGrid} from 'react-bootstrap';
import { changePassword } from '../modules/main';

class ChangePasswordView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            success: false,
            failed: false,
            currentPassword: '',
            newPassword: '',
            verifyNewPassword: ''
        };
        this.changePassword = this.changePassword.bind(this);
    }

    changePassword() {
        let {currentPassword, newPassword, verifyNewPassword} = this.state;
        let data = {currentPassword, newPassword};
        this.setState({loading: true});
        this.props.changePassword({data}).then(() => {
            this.setState({
                success: true,
                loading: false,
                currentPassword: '',
                newPassword: '',
                verifyNewPassword: ''
            })
        }).catch(err => {
            this.setState({
                failed: true,
                loading: false,
                currentPassword: '',
                newPassword: '',
                verifyNewPassword: ''
            })
        })
    }

    validate() {
        return true;
    }

    render() {
        return (
            <div>
                <Form horizontal>
                    <FormGroup validationState={this.state.success ? 'success' : (this.state.failed ? 'error' : '')}>
                        <Col mdOffset={3} smOffset={3} sm={6}>
                            <h3>{'Change your password'}</h3>
                            {this.state.success ? <HelpBlock>{'Password changed successfully'}</HelpBlock> : null}
                            {this.state.failed ? <HelpBlock>{'Error changing password'}</HelpBlock> : null}
                            <BeatLoader color={'#000'} loading={this.state.loading} />
                        </Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalCurrentPassword">
                        <Col componentClass={ControlLabel} md={3} sm={3} xs={12}>{'Current password'}</Col>
                        <Col md={4} sm={6} xs={12}><FormControl type="password" placeholder="" value={this.state.currentPassword} onChange={event => {this.setState({currentPassword: event.target.value})}}/></Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalNewPassword">
                        <Col componentClass={ControlLabel} md={3} sm={3} xs={12}>{'New password'}</Col>
                        <Col md={4} sm={6} xs={12}><FormControl type="password" placeholder="" value={this.state.newPassword} onChange={event => {this.setState({newPassword: event.target.value})}}/></Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalVerifyNewPassword" validationState={this.state.verifyNewPassword !== '' && (this.state.newPassword !== this.state.verifyNewPassword) ? 'error': (this.state.verifyNewPassword === '' ? '' : 'success')}>
                        <Col componentClass={ControlLabel} md={3} sm={3} xs={12}>{'Verify new password'}</Col>
                        <Col md={4} sm={6} xs={12}>
                            <FormControl type="password" placeholder="" value={this.state.verifyNewPassword} onChange={event => {this.setState({verifyNewPassword: event.target.value})}}/>
                            {this.state.verifyNewPassword === '' ? null : <HelpBlock>{this.state.newPassword === '' || this.state.verifyNewPassword === '' || (this.state.newPassword !== this.state.verifyNewPassword) ? 'Password did not match' : 'Password match'}</HelpBlock>}
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col mdOffset={3} smOffset={3} sm={6}>
                            <Button bsStyle="primary" disabled={this.state.currentPassword === '' || this.state.newPassword === '' || this.state.verifyNewPassword === '' || (this.state.newPassword !== this.state.verifyNewPassword)} onClick={this.changePassword}>{'Change Password'}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}

const select = store => ({

});

const actions = dispatch => bindActionCreators({
    changePassword: (params) => changePassword(params)
}, dispatch)

export default connect(select, actions)(ChangePasswordView);
