import React from 'react';
import Sidebar from '../components/Sidebar';
import MaterialTitlePanel from '../components/MaterialTitlePanel';
import SidebarContent from '../components/SidebarContent';
import * as FontAwesome from 'react-icons/lib/fa';
import moment from 'moment';
import { connect } from 'react-redux';
import { push } from 'react-router-redux'
import { Route, Switch } from 'react-router-dom';
import UrlPattern from 'url-pattern'

// views
import AttendenceView from './AttendenceView';
import RecordAttenView from './RecordAttenView';
import StudentsView from './StudentsView';
import ProductsView from './ProductsView';
import StudentDetailView from './StudentDetailView';
import StudentEditView from './StudentEditView';
import NoMatchView from './NoMatchView';
import ChangePasswordView from './ChangePasswordView';
import StudentsDashboard from './StudentsDashboard';
import CreateStudent from './CreateStudent'
import CRMView from './CRMView'

const styles = {
    contentHeaderMenuLink: {
        textDecoration: 'none',
        color: 'white',
        padding: 8,
    },
    content: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 15,
        paddingBottom: 15
    },
};

const mql = window.matchMedia(`(min-width: 800px)`);

// const navMenuItems = [
//     { path: '/secured/students', title: 'Students' },
//     { path: '/secured/attendance', title: 'Attendance' },
//     { path: '/secured/products', title: 'Products' }
// ]

class MainView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mql: mql,
            docked: false,
            open: false,
            date: `${moment().locale('en').format('YYYY-MM-DD')}`,
            title: ''
        };
        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.onSetOpen = this.onSetOpen.bind(this);
        this.fetchTitle = this.fetchTitle.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.location !== this.props.location) {
            if(this.props.location && this.props.location.pathname) {
                this.setState({title: this.fetchTitle(nextProps.location.pathname)})
            }
        }
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    fetchTitle(pathname) {
        if(pathname === '/secured/changepassword') {
            return 'Change Password'
        }
        if(pathname === '/secured/create/student') {
            return 'Create Student'
        }
        if(pathname === '/secured/studentsmenu') {
            return 'Student Menu'
        }
        if(pathname === '/secured/students') {
            return 'Student List'
        }
        if(pathname === '/secured/crm') {
            return 'CRM'
        }
        var pattern = new UrlPattern('/secured/student(/:id)');
        if(pattern.match(pathname)) {
            return 'Student Detail'
        }
        let title = pathname.match(/([^\/]*)\/*$/)[1];
        return this.capitalizeFirstLetter(title);
    }

    componentDidMount() {
        if(this.props.location && this.props.location.pathname) {
            this.setState({title: this.fetchTitle(this.props.location.pathname)})
        }
    }

    componentWillMount() {
        mql.addListener(this.mediaQueryChanged);
        this.setState({mql: mql, docked: mql.matches});
    }

    componentWillUnmount() {
        this.state.mql.removeListener(this.mediaQueryChanged);
    }

    onSetOpen(open) {
        this.setState({open: open});
    }

    mediaQueryChanged() {
        this.setState({
            mql: mql,
            docked: this.state.mql.matches,
        });
    }

    toggleOpen(ev) {
        this.setState({open: !this.state.open});
        if (ev) {
            ev.preventDefault();
        }
    }

    resetScroller = () => {
        this.rightContainer.scrollTop = 0
    }

    render() {
        const sidebar = <SidebarContent isAdmin={this.props.isAdmin} logout = {() => {this.props.logout()}}
            changeMenu = {(page, title) => {
                this.setState({pageTitle: title, open: false}, () => {
                    this.props.changeMenu(page);
                })
            }} />;

        const contentHeader = (
            <span>
                {!this.state.docked && <a onClick={this.toggleOpen.bind(this)} style={styles.contentHeaderMenuLink, {marginRight: 10}}><FontAwesome.FaBars color={'rgba(255,255,255,.9)'} size={23}/></a>}
                <span>{this.state.title}</span>
            </span>
        );

        const sidebarProps = {
            sidebar: sidebar,
            docked: this.state.docked,
            open: this.state.open,
            onSetOpen: this.onSetOpen,
        };

        return (
            <Sidebar {...sidebarProps} innerRef={(ref) => this.rightContainer = ref} contentClassName="rightContainer">
                <MaterialTitlePanel title={contentHeader}>
                    <div style={styles.content}>
                        <Switch>
                            <Route exact path="/secured/attendance" component={ AttendenceView } />
                            <Route exact path="/secured/attendance/:productId" component={ RecordAttenView } />
                            {this.props.isAdmin && <Route exact path="/secured/studentsmenu" component={ StudentsDashboard } />}
                            {this.props.isAdmin && <Route exact path="/secured/students" component={ StudentsView } />}
                            {this.props.isAdmin && <Route exact path="/secured/student/:studentId" render={props => <StudentEditView resetScroller={this.resetScroller} {...props} />}  />}
                            {this.props.isAdmin && <Route exact path="/secured/products" component={ ProductsView } />}
                            {this.props.isAdmin && <Route exact path="/secured/crm" component={ CRMView } />}
                            <Route exact path="/secured/changepassword" component={ ChangePasswordView } />
                            <Route component={ NoMatchView }/>
                        </Switch>
                    </div>
                </MaterialTitlePanel>
            </Sidebar>
        );
    }
}

// {this.props.isAdmin && <Route exact path="/secured/create/student" render={props => <CreateStudent resetScroller={this.resetScroller} {...props} />} />}

const select = (store, ownProps) => ({
    location: ownProps.location,
    isAdmin: store.service.user.admin
});
const actions = (dispatch) => ({
    changeMenu: (page) => {
        switch (page) {
            case 'students':
                dispatch(push('/secured/students'))
                break;
            case 'attendance':
                dispatch(push('/secured/attendance'))
                break;
            case 'products':
                dispatch(push('/secured/products'))
                break;
            case 'addstudent':
                dispatch(push('/secured/create/student'))
                break;
            case 'crm':
                dispatch(push('/secured/crm'))
                break;
            default:
        }
    }
});
export default connect(select, actions)(MainView);
