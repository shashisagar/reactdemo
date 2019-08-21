import React from 'react';
import PropTypes from 'prop-types';
import {Image, Popover, OverlayTrigger, Button} from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {userLogout} from '../modules/main';
import userImage from '../images/default-user.png'
import { Link } from 'react-router-dom';

const styles = {
    root: {
        fontFamily: '"HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
        fontWeight: 300,
    }
};


const MaterialTitlePanel = (props) => {
    const rootStyle = props.style ? {...styles.root, ...props.style} : styles.root;
    var bgcolor = props.nav ? '#262f3d' : 'rgb(3,155,229)';
    const popoverLeft = (
        <Popover id="popover-trigger-click-root-close" footer="Popover left" onClick={() => {}}>
            <div>
                <div className='pull-left' style={{marginRight: 12}}>
                    <Image style={{height: 65, width: 65, cursor: 'pointer'}} src={userImage} circle />
                </div>
                <div className='pull-right' style={{paddingTop: 10}}>
                    <b>{props.username}</b><br />
                    <small>{props.email}</small>
                </div>
                <div className='clearfix' />
                <div style={{textAlign: 'right', marginTop: 5}}>
                    <a href="/logout">Logout</a> | <Link to="/secured/changepassword">Change Password</Link>
                </div>
            </div>
        </Popover>
    );
    return (
        <div style={rootStyle}>
            <div style={{
                backgroundColor:bgcolor,
                color: 'white',
                padding: '16px',
                fontSize: '1.5em',
            }}>
            {props.title}
            {
                !props.nav &&
                <div className='pull-right'>
                    <OverlayTrigger trigger='click' rootClose placement="bottom" overlay={popoverLeft}>
                        <Image style={{height: 35, width: 35, cursor: 'pointer'}} src={userImage} circle />
                    </OverlayTrigger>
                </div>
            }
            </div>
            {props.children}
        </div>
    );
};

MaterialTitlePanel.propTypes = {
    style: PropTypes.object,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    children: PropTypes.object,
};

const select = store => ({
    username: store.service.user.username,
    email: store.service.user.email
});

const actions = dispatch => bindActionCreators({
    userLogout: () => userLogout()
}, dispatch)

export default connect(select, actions)(MaterialTitlePanel);
