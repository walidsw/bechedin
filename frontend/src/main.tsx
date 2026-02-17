import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth-context'
import './index.css'
import App from './App'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProductDetail from './pages/ProductDetail'
import EscrowDashboard from './pages/EscrowDashboard'
import PostAdPage from './pages/PostAdPage'
import EditListingPage from './pages/EditListingPage'
import AdminPanel from './pages/AdminPanel'
import MyListings from './pages/MyListings'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/escrow/:id" element={<EscrowDashboard />} />
            <Route path="/post-ad" element={<PostAdPage />} />
            <Route path="/edit/:id" element={<EditListingPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/my-listings" element={<MyListings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
