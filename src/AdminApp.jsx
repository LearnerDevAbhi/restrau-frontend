import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PageSpinner } from './components/common/Spinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/admin/LoginPage';

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const MenuPage = lazy(() => import('./pages/admin/MenuPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const TablesPage = lazy(() => import('./pages/admin/TablesPage'));
const StorePage = lazy(() => import('./pages/admin/StorePage'));

function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <PageSpinner />;
  if (status !== 'signedIn') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Everything under /admin. Loaded as its own chunk, so customers never download admin code. */
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageSpinner />}>
                <DashboardPage />
              </Suspense>
            }
          />
          {[
            ['orders', OrdersPage],
            ['menu', MenuPage],
            ['categories', CategoriesPage],
            ['tables', TablesPage],
            ['store', StorePage],
          ].map(([path, Page]) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<PageSpinner />}>
                  <Page />
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
