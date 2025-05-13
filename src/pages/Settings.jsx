import React from 'react'
import Header from '../components/common/Header'
import Notifications from '../components/common/Settings/Notifications'
import Profile from '../components/common/Settings/Profile'
import Security from '../components/common/Settings/Security'

const Settings = ({user}) => { 

  return (
    <div className="flex-1 overflow-auto relative z-10">
        <Header title="Settings" user={user}/>
        <main className='max-w-4xl mx-auto py-3 px-3 lg:px-2'>
        <Profile user={user}/>
        <Security/>
        <Notifications/>
        </main>
        </div>
  )
}

export default Settings
