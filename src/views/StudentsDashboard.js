import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push, goBack } from 'react-router-redux'
import StudentsView from './StudentsView'
import InfiniteGrid from '../components/InfiniteGrid/grid'
import { Glyphicon, Button } from 'react-bootstrap'

class StudentsDashboard extends React.Component {
    state = {
    }
    onClickStudentList = () => this.props.navStudentList()
    onClickAddStudent = () => this.props.navAddStudent()
    render() {
        let items = [
            <Button bsSize="large" onClick={this.onClickStudentList}>
                <Glyphicon glyph="user" size='50'/> Student List
            </Button>,
            <Button bsSize="large" onClick={this.onClickAddStudent}>
                <Glyphicon glyph="plus" size='50'/> Create Student
            </Button>
        ]
        return (
            <div>
                <InfiniteGrid wrapperHeight={1000}  height={140} width={140} entries={items} />
            </div>
        )
    }
}

const select = store => ({
})

const actions = dispatch => bindActionCreators({
    navStudentList: () => push(`/secured/students`),
    navAddStudent: () => push(`/secured/create/student`)
}, dispatch)

export default connect(select, actions)(StudentsDashboard)
