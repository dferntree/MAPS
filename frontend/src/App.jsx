import './App.css'
import LoginPage from "./components/LoginPage.jsx"
import NavBar from './components/NavBar.jsx'
import Home from './components/Home/Home.jsx'
import Progress from './components/Progress/Progress.jsx'
import { useState, useEffect } from 'react'
import SearchResults from './components/SearchResults/SearchResults.jsx'
import { subscribeToAuthChanges, logoutUser } from './firebase'
import { getUserData } from './api/api'
import CoursePickerPage from './components/CoursePicker/CoursePickerPage.jsx'
import ScheduleBuilder from './components/Calendar/ScheduleBuilder.jsx'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfessor, setSelectedProfessor] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if(!user) return
    
    const loadUserData = async () => {
      try{
        const userData = await getUserData(user.uid)
        console.log('User data loaded:', userData)
      } catch (err) {
      console.error('Failed to load user data:', err)
      }
    }

    loadUserData()
  },[user])

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div> // loading screen so auth isn't caught on reset
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  const handleAuthSuccess = () => {
    // Auth listener will trigger and update user state automatically
  }

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    setCurrentPage('home')
  }

  const handleProfessorSelect = (professorName) => {
    setSelectedProfessor(professorName)
    setCurrentPage('search-results')
  }

  if (!user) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <>
      <NavBar onNavigate={handleNavigate} onLogout={handleLogout}/>

      <div style={{ display: currentPage === 'home' ? 'block' : 'none' }}><Home onProfessorSelect={handleProfessorSelect}/></div>
      <div style={{ display: currentPage === 'progress' ? 'block' : 'none' }}><Progress user={user}/></div>
      <div style={{ display: currentPage === 'search-results' ? 'block' : 'none' }}><SearchResults searchedProfessor={selectedProfessor} user={user} /></div>
      <div style={{ display: currentPage === 'coursepicker' ? 'block' : 'none'}}><CoursePickerPage /> </div>
      <div style={{ display: currentPage === 'schedule' ? 'block' : 'none'}}>
        <ScheduleBuilder user={user} />
      </div>

    </>
  )
}
 
export default App
