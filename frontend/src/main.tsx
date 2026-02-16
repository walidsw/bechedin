import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { HomePage } from './pages/HomePage';
import { ProductDetail } from './pages/ProductDetail';
import { EscrowDashboard } from './pages/EscrowDashboard';
import { AuthPage } from './pages/AuthPage';
import { PostAdPage } from './pages/PostAdPage';
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "escrow/:id", element: <EscrowDashboard /> },
      { path: "auth", element: <AuthPage /> },
      { path: "post-ad", element: <PostAdPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
