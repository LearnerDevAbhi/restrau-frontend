import { Outlet } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';
import { TableSessionProvider } from '../context/TableSessionContext';

export default function CustomerLayout() {
  return (
    <TableSessionProvider>
      <CartProvider>
        <div className="mx-auto min-h-dvh max-w-3xl bg-cream">
          <Outlet />
        </div>
      </CartProvider>
    </TableSessionProvider>
  );
}
