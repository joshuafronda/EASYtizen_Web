import React from 'react'
import Header from '../components/common/Header'
import BlotterTable from '../components/common/Blotter/BlotterTable'

const BlotterRecord = ({user}) => {
  return (
    <div className="flex-1">
    <Header title="Blotter Record" user={user}/>
    <BlotterTable user={user} />
    </div>
  )
}

export default BlotterRecord
