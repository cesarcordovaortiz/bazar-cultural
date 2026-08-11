import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCart } from '../cart/CartContext';
import { saveOrder } from '../../lib/orderStore';
import { useCurrency } from '../currency/CurrencyContext';
import { ensureDefaultPaymentMethod, getPaymentMethodExample } from '../../lib/paymentMethods';
import { createDigitalDelivery } from '../../lib/digitalDelivery';
import { createPhysicalDelivery } from '../../lib/physicalDelivery';
import type { Address, PaymentMethod } from '../../types';
import { useAuth } from '../auth/useAuth';

interface CheckoutForm {
  line1: string;
  line2: string;
  city: string;
  department: string;
  postalCode: string;
  paymentMethodId: string;
}

export function CheckoutPage() {
  const { items, total, subtotal, discount, clear } = useCart();
  const { currency, convertAmount, exchangeRate, formatAmount } = useCurrency();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const paymentMethods: PaymentMethod[] = user?.paymentMethods?.length
    ? ensureDefaultPaymentMethod(user.paymentMethods)
    : [{ id: 'cash', type: 'cash', label: 'Pago contra entrega' }];

  const { register, handleSubmit, watch } = useForm<CheckoutForm>({
    values: {
      line1: user?.defaultAddress?.line1 ?? '',
      line2: user?.defaultAddress?.line2 ?? '',
      city: user?.defaultAddress?.city ?? '',
      department: user?.defaultAddress?.department ?? '',
      postalCode: user?.defaultAddress?.postalCode ?? '',
      paymentMethodId: paymentMethods.find((method) => method.isDefault)?.id ?? paymentMethods[0]?.id ?? 'cash',
    },
  });
  const selectedPaymentMethodId = watch('paymentMethodId');
  const selectedPaymentMethod = paymentMethods.find((method) => method.id === selectedPaymentMethodId) ?? paymentMethods[0];

  const orderTotal = useMemo(() => total, [total]);
  const digitalItemCount = useMemo(() => items.filter((item) => item.product.fulfillmentType === 'digital').reduce((count, item) => count + item.quantity, 0), [items]);

  const onSubmit = (values: CheckoutForm) => {
    if (items.length === 0) return;
    const paymentMethod = paymentMethods.find((method) => method.id === values.paymentMethodId) ?? paymentMethods[0];
    const address: Address = {
      line1: values.line1,
      line2: values.line2 || undefined,
      city: values.city,
      department: values.department,
      postalCode: values.postalCode,
    };
    const settlementSubtotal = convertAmount(subtotal, 'USD', currency);
    const settlementDiscount = convertAmount(discount, 'USD', currency);
    const settlementTotal = convertAmount(orderTotal, 'USD', currency);

    const orderId = `order-${Date.now()}`;
    saveOrder({
      id: orderId,
      userId: user?.id ?? 'guest-user',
      status: 'PENDIENTE',
      createdAt: Date.now(),
      subtotal: settlementSubtotal,
      discount: settlementDiscount,
      total: settlementTotal,
      currency,
      sourceCurrency: 'USD',
      exchangeRateToBob: currency === 'BOB' ? exchangeRate.rate : undefined,
      items,
      address,
      paymentMethod,
      digitalDelivery: createDigitalDelivery(orderId, items),
      physicalDelivery: createPhysicalDelivery(orderId, items, address),
    });

    clear();
    setIsSubmitted(true);
    navigate('/orders');
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      {items.length === 0 ? (
        <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-semibold text-slate-950">Tu carrito está vacío</h1>
          <p className="mt-3 text-slate-600">Añade al menos un producto antes de iniciar el checkout.</p>
          <Link to="/" className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Volver al catálogo</Link>
        </section>
      ) : (
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-semibold text-slate-950">Checkout</h1>
          <p className="mt-3 text-slate-600">Confirma tu dirección y completa la compra.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Dirección
                <input
                  {...register('line1', { required: true })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Piso / Dep.
                <input
                  {...register('line2')}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm text-slate-700">
                Ciudad
                <input
                  {...register('city', { required: true })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Departamento
                <input
                  {...register('department', { required: true })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="block text-sm text-slate-700">
                Código Postal
                <input
                  {...register('postalCode', { required: true })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>
            <fieldset className="rounded-3xl border border-slate-200 p-4">
              <legend className="px-2 text-sm font-semibold text-slate-700">Pago</legend>
              <label className="block text-sm text-slate-700">
                Método de pago
                <select
                  {...register('paymentMethodId', { required: true })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.label}</option>)}
                </select>
              </label>
              <p className="mt-3 text-sm text-slate-600">Pago simulado: no se solicita ni almacena información financiera real.</p>
              {selectedPaymentMethod && <div className="mt-3 rounded-2xl bg-orange-50 p-3 text-sm text-orange-950"><p className="font-semibold">{selectedPaymentMethod.label}</p><p className="mt-1">{getPaymentMethodExample(selectedPaymentMethod.type)}</p></div>}
            </fieldset>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Confirmar pedido
            </button>
          </form>
        </section>

        <aside className="rounded-3xl bg-slate-950 p-8 text-white shadow-sm">
          <h2 className="text-xl font-semibold">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-300">Subtotal</dt><dd className="font-semibold">{formatAmount(subtotal)}</dd></div>{discount > 0 && <div className="flex justify-between gap-4 text-orange-200"><dt>Descuento de campañas</dt><dd className="font-semibold">−{formatAmount(discount)}</dd></div>}<div className="border-t border-white/20 pt-3"><dt className="text-slate-300">Total del carrito</dt><dd className="mt-1 text-4xl font-semibold">{formatAmount(orderTotal)}</dd></div></dl>
          {currency === 'BOB' && <p className="mt-3 text-xs leading-5 text-orange-100">Conversión referencial del BCB: 1 USD = {formatAmount(exchangeRate.rate, 'BOB')}.</p>}
          <p className="mt-4 text-sm text-slate-400">{items.length} artículos listos para envío</p>
          {digitalItemCount > 0 && <p className="mt-3 rounded-2xl bg-sky-500/10 px-3 py-2 text-sm text-sky-100">Incluye {digitalItemCount} contenido{digitalItemCount === 1 ? '' : 's'} digital{digitalItemCount === 1 ? '' : 'es'} con seguimiento y avisos en Mensajes.</p>}
          {isSubmitted && <p className="mt-4 rounded-3xl bg-green-500/10 px-4 py-3 text-sm text-green-100">Pedido creado correctamente.</p>}
        </aside>
      </div>
      )}
    </main>
  );
}
