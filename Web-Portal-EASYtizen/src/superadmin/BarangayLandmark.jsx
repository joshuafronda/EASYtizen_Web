import React from 'react'
import Header from '../components/common/Header'
import BarangayTable from '../components/Officials/BarangayTable'
import BarangayPages from './BarangayPages'

const BarangayLandmark = ({user}) => {
  return (
    <div className="flex-1 overflow-auto relative z-10">
    <BarangayPages user={user}/>
    </div>
  )
}

export default BarangayLandmark