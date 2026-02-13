import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Strategy from './pages/Strategy'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/strategy" element={<Strategy />} />
      </Routes>
    </Layout>
  )
}

export default App
