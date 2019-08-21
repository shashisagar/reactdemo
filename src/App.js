import React from 'react';
import { Route, Switch } from 'react-router-dom';
import MainView from './views/MainView';
import NoMatchView from './views/NoMatchView';
import OverlayLoader from 'react-loading-indicator-overlay/lib/OverlayLoader';
import { BarLoader, ClimbingBoxLoader } from 'react-spinners';
import Divider from './components/Divider';
import './styles/App.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchCurrentUser } from './modules/main';
import { withRouter } from 'react-router'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            success: false
        }
    }
    componentDidMount() {
        this.props.fetchCurrentUser().then(() => {
            this.setState({
                loading: false,
                success: true
            });
        }).catch(() => {
            this.setState({
                loading: false,
                success: false
            });
        })
    }
    renderLoadingContent() {
        return (
            <div className="jumbotron vertical-center">
                <div className="container">
                    <center><BarLoader color={'#000'} loading={true} /></center>
                    <center><span style={{marginTop: 15, fontSize: 10}}>{'Loading. Please Wait..'}</span></center>
                </div>
            </div>
        )
    }
    renderErrorPage() {
        return (
            <div className="jumbotron vertical-center">
                <div className="container">
                    <center><ClimbingBoxLoader color={'#FF3554'} loading={true} /></center>
                    <center><span style={{marginTop: 15, fontSize: 10, color: '#FF3554'}}>{'Something went wrong. Please contact admin..'}</span></center>
                </div>
            </div>
        )
    }
    render() {
        if(this.state.loading) {
            return this.renderLoadingContent();
        }
        if(!this.state.success) {
            return this.renderErrorPage();
        }
        return (
            <div>
                <Switch>
                    <Route path="/secured" component={ MainView }/>
                    <Route component={ NoMatchView }/>
                </Switch>
            </div>
        )
    }
}

const select = store => ({

});
const actions = dispatch => bindActionCreators({
    fetchCurrentUser: () => fetchCurrentUser()
}, dispatch)
export default withRouter(connect(select, actions)(App));
