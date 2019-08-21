import React from 'react';
import MaterialTitlePanel from '../components/MaterialTitlePanel';
import PropTypes from 'prop-types';
import * as FontAwesome from 'react-icons/lib/fa'

const styles = {
    sidebar: {
        width: 220,
        height: '100%',
    },
    sidebarLink: {
        cursor: 'pointer',
        display: 'block',
        padding: '16px 0px',
        color: 'rgba(255,255,255,.7)',
        textDecoration: 'none',

        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0
    },
    divider: {
        margin: '8px 0',
        height: 1,
        backgroundColor: '#262f3d',
    },
    content: {
        padding: '16px',
        height: '100%',
        backgroundColor: '#19212b',
    },
};

const MenuItem = (props) => {
    return (
        <a onClick={() => { props.onClick() } } style={styles.sidebarLink}>
            {props.icon}
            <span style={{marginLeft: 10, fontSize: 14, letterSpacing: .8, fontWeight: '500'}}>{props.title}</span>
        </a>
    );
};

const SidebarContent = (props) => {
    const style = props.style ? {...styles.sidebar, ...props.style} : styles.sidebar;

    const links = [];
    links.push(<MenuItem key={'attendance'} onClick={() => {props.changeMenu('attendance', 'Attendance')}} title={'Attendance'} {...props} icon={<FontAwesome.FaGroup color={'rgba(255,255,255,.7)'} size={20}/>} />);
    if(props.isAdmin) {
        links.push(<MenuItem key={'students'} onClick={() => {props.changeMenu('students', 'Students')}} title={'Students'} {...props} icon={<FontAwesome.FaUser color={'rgba(255,255,255,.7)'} size={20}/>} />);
        // links.push(<MenuItem key={'addstudent'} onClick={() => {props.changeMenu('addstudent', 'Add Student')}} title={'Add Student'} {...props} icon={<FontAwesome.FaPlus color={'rgba(255,255,255,.7)'} size={20}/>} />);
        links.push(<MenuItem key={'products'} onClick={() => {props.changeMenu('products', 'Products')}} title={'Products'} {...props} icon={<FontAwesome.FaCubes color={'rgba(255,255,255,.7)'} size={20}/>} />);
        links.push(<MenuItem key={'crm'} onClick={() => {props.changeMenu('crm', 'CRM')}} title={'CRM'} {...props} icon={<FontAwesome.FaCubes color={'rgba(255,255,255,.7)'} size={20}/>} />);
    }

    return (
        <MaterialTitlePanel nav={true} title="StemMinds" style={style}>
            <div style={styles.content}>
                {links}
            </div>
        </MaterialTitlePanel>
    );
};

// <div style={styles.divider} />
// <MenuItem key={'products'} onClick={() => {
//     props.changeMenu('logout', '')
// }} title={'Logout'} {...props} icon={<FontAwesome.FaSignOut color={'rgba(255,255,255,.7)'} size={18}/>} />

SidebarContent.propTypes = {
    style: PropTypes.object,
};

export default SidebarContent;
