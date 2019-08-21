import React from 'react';
import InfiniteGrid from './InfiniteGrid/grid';
import * as FontAwesome from 'react-icons/lib/fa';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import random from 'randomstring';

const Options = (props) => {
    return (
        <div>
            {(props.type === 'P' && props.atten === 1) || (props.type === 'A' && props.atten === 0) ? <FontAwesome.FaCheck color={'#333333'} size={15} style={{paddingBottom: 3}}/> : null}
            <span style={{marginLeft: 3}}>{props.name}</span>
        </div>
    );
}

class AttendenceComponent extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.color = {
            present: '#c3e2b7',
            absent: '#fc7a76',
            none: 'rgba(0, 0, 0, .2)'
        }
        var attenVal, bgColor = this.color.none;
        switch (props.atten) {
            case 'P':
                bgColor = this.color.present;
                attenVal = 1;
                break;
            case 'A':
                bgColor = this.color.absent;
                attenVal = 0;
                break;
                default:
        }
        this.state = {
            attenVal,
            bgColor,
            id: props.id
        }
    }
    onChange(attenVal){
        this.props.onClick(this.props.index, attenVal, this.props.student);
        this.setState({
            attenVal,
            bgColor : (attenVal === 1 ? this.color.present : this.color.absent)
        });
    }
    render() {
        const { name, gender, student, student:{order:{productSku}} } = this.props;
        const iconProps = [];
        iconProps.color = 'rgba(255, 255, 255, .8)';
        iconProps.size = 45;
        iconProps.style = { marginTop: 10 };
        return (
            <div className="attnd-grid" style={{backgroundColor: this.state.bgColor, height: 150, textAlign: 'center', borderRadius: 5, marginBottom: 20}}>
                {<a onClick={() => {this.props.onStudentInfoClicked(student)}} style={{cursor:'pointer'}}><FontAwesome.FaInfoCircle size={18} color={'rgba(0, 0, 0, .6)'} style={{position:'absolute', right: 5, top: 5}}/></a>}
                {gender === 'M' ? <FontAwesome.FaMale {...iconProps}/> : <FontAwesome.FaFemale {...iconProps}/>}
                <div style={{marginTop: 10, fontSize: 13}}><strong>{name}</strong></div>
                <div style={{fontSize: 12}}><small>{productSku}</small></div>
                <ToggleButtonGroup bsSize="small" style={{marginTop: 10}} type="radio" name="options" value={this.state.attenVal} onChange={this.onChange}>
                    <ToggleButton value={1}><Options atten={this.state.attenVal} name={'Present'} type={'P'}/></ToggleButton>
                    <ToggleButton value={0}><Options atten={this.state.attenVal} name={'Absent'} type={'A'}/></ToggleButton>
                </ToggleButtonGroup>
			</div>
        );
    }
}

export default class Attendence extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            enrolments: props.enrolments
        };
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.enrolments !== this.state.enrolments) {
            this.setState({enrolments: []}, () => {
                this.setState({enrolments: nextProps.enrolments})
            })
        }
    }
    render() {
        var items = Object.values(this.state.enrolments).map((student, index) => {
            var atten = (typeof student.attended !== 'undefined' ? (student.attended === true ? 'P' : 'A') : 'N');
            return (
                <AttendenceComponent
                    onStudentInfoClicked={this.props.onStudentInfoClicked}
                    onClick={this.props.onUpdate}
                    name={`${student.firstName} ${student.lastName}`}
                    gender={student.gender ? (student.gender.toLowerCase() === 'male' ? 'M' : 'F') : 'M'}
                    atten={atten}
                    index={index}
                    student={student}
                    key={student.id} />
            )
        });
        if (items.length === 0) return null;
        return (
            <InfiniteGrid wrapperHeight={1000}  height={140} width={140} entries={items} />
        );
    }
}
// var items = Object.values(this.state.enrolments).map(({student, attended}, index) => {
//<InfiniteGrid wrapperHeight={400} entries={this.items} />
