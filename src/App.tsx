import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { CartProvider } from './features/cart/CartContext';
import { AuthGuard } from './shared/ui/AuthGuard';
import { TopNav } from './shared/ui/TopNav';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';
import { AdminGuard } from './shared/ui/AdminGuard';

const ShopPage = lazy(() => import('./features/shop/ShopPage').then((module) => ({ default: module.ShopPage })));
const ProductDetailPage = lazy(() => import('./features/catalog/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const CartPage = lazy(() => import('./features/cart/CartPage').then((module) => ({ default: module.CartPage })));
const ProfilePage = lazy(() => import('./features/auth/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const OrderHistoryPage = lazy(() => import('./features/orders/user/OrderHistoryPage').then((module) => ({ default: module.OrderHistoryPage })));
const OrderDetailPage = lazy(() => import('./features/orders/user/OrderDetailPage').then((module) => ({ default: module.OrderDetailPage })));
const AdminOrdersPage = lazy(() => import('./features/orders/admin/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })));
const CampaignsPage = lazy(() => import('./features/campaigns/CampaignsPage').then((module) => ({ default: module.CampaignsPage })));
const MessagesPage = lazy(() => import('./features/messaging/MessagesPage').then((module) => ({ default: module.MessagesPage })));

function RouteFallback() {
  return <main className="mx-auto max-w-6xl px-4 py-12" aria-busy="true"><h1 className="sr-only">Cargando Bazar Cultural</h1><div aria-hidden="true" className="h-12 w-56 animate-pulse rounded-2xl bg-slate-200" /><div aria-hidden="true" className="mt-6 grid gap-4 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-3xl bg-slate-200" />)}</div></main>;
}

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-orange-50 text-stone-900">
        <TopNav />
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<ShopPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />
          <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
          <Route path="/orders" element={<AuthGuard><OrderHistoryPage /></AuthGuard>} />
          <Route path="/orders/:orderId" element={<AuthGuard><OrderDetailPage /></AuthGuard>} />
          <Route path="/messages" element={<AuthGuard><MessagesPage /></AuthGuard>} />
          <Route path="/admin/orders" element={<AdminGuard><AdminOrdersPage /></AdminGuard>} />
          <Route path="/admin/campaigns" element={<AdminGuard><CampaignsPage /></AdminGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </CartProvider>
  );
}
