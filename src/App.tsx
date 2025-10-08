import { BrowserRouter, Routes, Route } from 'react-router'
import OrderPage from './pages/OrderPage/OrderPage'
import ThankYou from './pages/ThankYou/ThankYou'

export default function App() {
  return (
    <BrowserRouter>
      <div className='app-container'>
        <header>
          <h1>FAPI - Testovací úloha - Objednávkový systém</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<OrderPage />} />
            <Route path="/thankyou" element={<ThankYou />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
