import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PageSpinner } from './components/common/Spinner';
import CustomerLayout from './layouts/CustomerLayout';
import CartPage from './pages/customer/CartPage';
import LandingPage from './pages/customer/LandingPage';
import MenuPage from './pages/customer/MenuPage';
import OrderStatusPage from './pages/customer/OrderStatusPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin is a separate chunk: a customer scanning a QR code downloads only the ordering app
const AdminApp = lazy(() => import('./AdminApp'));

const router = createBrowserRouter([
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/order/:id', element: <OrderStatusPage /> },
    ],
  },
  {
    path: '/admin/*',
    element: (
      <Suspense fallback={<PageSpinner />}>
        <AdminApp />
      </Suspense>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
