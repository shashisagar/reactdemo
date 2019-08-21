import React from 'react';
import PropTypes from 'prop-types';
import * as Ionicons from 'react-icons/lib/io';
import NumberFormat from 'react-number-format';

const getColor = (attend) => {
    if (attend === "Present") {
        return '#c3e2b7';
    }
    if (attend === "Absent") {
        return '#fc7a76';
    }
    return '#F4F4F4';
};

export const HighlightedCell = ({ align, row, column, style }) => {
    style = {
        ...style,
        cursor: 'pointer'
    }
    if(column === 'name') {
        return (
            <td style={{backgroundColor: '#fff', textAlign: align, ...style}}>
                {row[column]}
            </td>
        )
    }
    return (
        <td style={{backgroundColor: getColor(row[column]), textAlign: align, ...style}}>
            {row[column] === 'N/A' ? '' : row[column]}
        </td>
    )
};

const boldString = (str, find) => {
    var re = new RegExp(find, 'i');
    return str.replace(re, '<b>'+find+'</b>');
    // return `<span className='testing-style'>${d}</span>`;
};

export const HighlightedCellStudentsTable = ({ align, row, studentName, style, column, parentName, studentId}) => {
    style = {
        ...style,
        cursor: 'pointer'
    }
    if(column === 'name') {
        return (<td className='student-name-table' style={{backgroundColor:'#fff9eb', textAlign: align, ...style}} dangerouslySetInnerHTML={{__html: boldString(row.name, studentName)}} />)
    }
    if(column === 'age' || column === 'gender') {
        return (
            <td style={{backgroundColor:'#fff9eb', textAlign: align, ...style}}>
                {row[column]}
            </td>
        )
    }
    if(column === 'parentName') {
        return (<td style={{backgroundColor:'#fff', textAlign: align, ...style}} dangerouslySetInnerHTML={{__html: boldString(row.parentName, parentName)}} />)
    }
    // <a href={`mailto:${row[column]}`}>{row[column]}</a>
    if(column === 'parentEmail') {
        return (
            <td style={{backgroundColor:'#fff', textAlign: align, ...style}}>
                {row[column]}
            </td>
        )
    }
    // <a href={`tel:${row[column]}`}>{row[column]}</a>
    if(column === 'parentPhone') {
        return (
            <td style={{backgroundColor:'#fff', textAlign: align, ...style}}>
                {row[column]}
            </td>
        )
    }

    if(column === 'reactions') {
        return (
            <td style={{backgroundColor:(row[column] ? '#fc7a76': '#fff9eb'), textAlign: align, ...style}}>
                {row[column] ? <span style={{color: '#800400'}}>Yes</span> : 'No'}
            </td>
        )
    }

    if(column === 'liability') {
        return (
            <td style={{backgroundColor:(row[column] ? '#fff9eb': '#fc7a76'), textAlign: align, ...style}}>
                {row[column] ? 'Yes' : <span style={{color: '#800400'}}>No</span>}
            </td>
        )
    }

    if(column === 'photographyConsent' || column === 'medicalConsent') {
        return (
            <td style={{backgroundColor:'#fff9eb', textAlign: align, ...style}}>
                {row[column] ? <span>Accept <Ionicons.IoAndroidDone color={'#333333'} size={14} style={{paddingBottom: 1}}/></span> : <span style={{color: '#FF534D'}}>Decline <Ionicons.IoAndroidClose color={'#FF534D'} size={14} style={{paddingBottom: 1}}/></span>}
            </td>
        )
    }
};

export const HighlightedProductTableCell = ({ align, row, column, style }) => (
    <td style={{backgroundColor: '#fff9eb', textAlign: align, ...style}}>
        {row[column]}
    </td>
);

// <Ionicons.IoAndroidDone color={'#333333'} size={20} style={{paddingBottom: 3}}/>
// <Ionicons.IoAndroidClose color={'#333333'} size={20} style={{paddingBottom: 3}}/>

// HighlightedCell.propTypes = {
//     value: PropTypes.number.isRequired,
//     align: PropTypes.string,
//     style: PropTypes.object,
// };
// HighlightedCell.defaultProps = {
//     style: {},
//     align: 'left',
// };
