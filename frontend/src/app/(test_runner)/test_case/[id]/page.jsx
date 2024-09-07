import React from 'react'

const TestCaseByID = ({params}) => {
    console.log("Props received in test case by ID : ", params)
    return (
        <div>TestCaseByID {params.id}</div>
    )
}

export default TestCaseByID