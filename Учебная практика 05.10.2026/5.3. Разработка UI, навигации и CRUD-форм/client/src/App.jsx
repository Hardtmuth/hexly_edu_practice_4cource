import { BrowserRouter, Routes, Route } from 'react-router'
import { MainPage } from './pages/MainPage.jsx'
import { PartnerHistoryPage } from './pages/PartnerHistoryPage.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/partnerHistory/:partnerId" element={<PartnerHistoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App