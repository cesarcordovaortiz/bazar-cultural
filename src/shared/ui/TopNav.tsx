import { NavLink } from 'react-router-dom';
import { useCart } from '../../features/cart/CartContext';
import { useAuth } from '../../features/auth/useAuth';
import { cn } from '../lib/cn';

const baseLink = 'rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600';

export function TopNav() {
  const { items } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.roles.includes('admin') ?? false;
  const count = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b border-orange-200 bg-orange-50/95 backdrop-blur">
      <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="group inline-flex items-center gap-3 text-lg font-semibold text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-orange-700 text-sm font-bold text-white shadow-sm transition group-hover:rotate-3">B</span><span><span className="block leading-5">Bazar Cultural</span><span className="block text-xs font-medium tracking-wide text-orange-800">Economía naranja</span></span></NavLink>
        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Catálogo</NavLink>
          <NavLink to="/orders" className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Pedidos</NavLink>
          <NavLink to="/messages" className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Mensajes</NavLink>
          <NavLink to="/cart" className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Carrito ({count})</NavLink>
          <NavLink to={isAdmin ? '/admin/campaigns' : '/login'} title={isAdmin ? 'Gestionar campañas' : 'Accede como administrador para gestionar campañas'} className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Campañas</NavLink>
          {isAuthenticated ? (
            <NavLink to="/profile" className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>{user?.name ?? 'Perfil'}</NavLink>
          ) : (
            <NavLink to="/login" className={({ isActive }) => cn(baseLink, isActive ? 'bg-orange-700 text-white shadow-sm' : 'text-stone-700 hover:bg-orange-100')}>Ingresar</NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
