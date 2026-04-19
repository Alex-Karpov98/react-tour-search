import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom'

import { TourSearchPage } from './pages/TourSearchPage/TourSearchPage'
import { TourPage } from './pages/TourPage/TourPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TourSearchPage />} />
        <Route path="/tour" element={<TourPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
