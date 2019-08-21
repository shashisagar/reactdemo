import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { push, goBack } from 'react-router-redux'
import { Glyphicon, Button, Row, Col, Table, FormGroup, Form, ControlLabel, FormControl, Checkbox} from 'react-bootstrap'
import DatePicker from '../components/DatePicker'
import FileSaver from 'file-saver'
import axios from 'axios'
import { baseURL } from '../modules/service'
import Divider from '../components/Divider'
import { BeatLoader } from 'react-spinners'

class CRMView extends React.Component {
    state = {
        loading: false,
        fromDate: new Date().getTime(),
        toDate: new Date().getTime()
    }
    handleDownloadClick = e => {
        e.preventDefault()
        this.downloadFiles()
    }
    handleDateChange = field => value => this.setState({[field]: new Date(value).getTime()})
    downloadFiles = format => {
        const { fromDate, toDate } = this.state
        if(this.state.loading) return
        this.setState({loading: true})

        return axios.post(`${baseURL}/crm`, {fromDate, toDate}, {headers:{'Accept':'*/*'}, responseType: 'blob'})
        .then(resp => resp.data)
        .then(blob => {
            FileSaver.saveAs(blob, `CRM.csv`)
            this.setState({loading: false})
        })
    }
    renderLoadingContent = () => (<div><Divider /><center><BeatLoader color={'#000'} loading={true} /></center><Divider /></div>)

    render() {
        const { loading, fromDate, toDate } = this.state
        return (
            <div>
                <Row className="show-grid">
                    <Col xs={12} md={6} sm={12}>
                        {this.state.loading && this.renderLoadingContent()}
                        <div style={{marginBottom: 8}}>
                           <strong style={{lineHeight: 3.3, color: '#9B9B9B'}}>{'Download CRM Data'}</strong>
                       </div>
                       <Form horizontal onSubmit={this.handleDownloadClick}>
                           <FormGroup controlId="formHorizontalEmail">
                               <Col style={{textAlign: 'left'}} componentClass={ControlLabel} sm={3}>{'Start Date'}</Col>
                               <Col sm={9}>
                                   <DatePicker disabled={loading} dateFormat="YYYY-MM-DD" onChange={this.handleDateChange('fromDate')} value={`${moment(fromDate).locale('en').format('YYYY-MM-DD')}`} />
                               </Col>
                           </FormGroup>

                           <FormGroup controlId="formHorizontalPassword">
                               <Col style={{textAlign: 'left'}} componentClass={ControlLabel} sm={3}>{'End Date'}</Col>
                               <Col sm={9}>
                                   <DatePicker disabled={loading} dateFormat="YYYY-MM-DD" onChange={this.handleDateChange('toDate')} value={`${moment(toDate).locale('en').format('YYYY-MM-DD')}`} />
                               </Col>
                           </FormGroup>
                           <FormGroup>
                               <Col style={{textAlign: 'right'}} smOffset={3} sm={9}>
                                   <Button disabled={loading} bsStyle="primary" type='submit'>
                                       <Glyphicon  glyph="download" />{' Download'}
                                   </Button>
                               </Col>
                           </FormGroup>
                       </Form>
                    </Col>
                </Row>
            </div>
        )
    }
}
const select = store => ({
})

const actions = dispatch => bindActionCreators({
}, dispatch)

export default connect(select, actions)(CRMView)
