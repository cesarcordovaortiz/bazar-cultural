import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { buildPaymentMethodLabel, ensureDefaultPaymentMethod, getPaymentMethodExample, PAYMENT_METHOD_OPTIONS } from '../../lib/paymentMethods';
import type { PaymentMethod, PaymentMethodType, UserProfile } from '../../types';
import { useAuth } from './useAuth';

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  line1: string;
  city: string;
  department: string;
  postalCode: string;
  lat: string;
  lng: string;
}

interface PaymentMethodFormValues {
  paymentType: PaymentMethodType;
  paymentHolderName: string;
  paymentCardBrand: string;
  paymentLast4: string;
  paymentBankName: string;
  paymentWalletProvider: string;
  paymentWalletPhone: string;
  isDefault: boolean;
}

const EMPTY_PAYMENT_METHOD: PaymentMethodFormValues = {
  paymentType: 'cash',
  paymentHolderName: '',
  paymentCardBrand: 'Visa',
  paymentLast4: '',
  paymentBankName: '',
  paymentWalletProvider: 'Tigo Money',
  paymentWalletPhone: '',
  isDefault: false,
};

function paymentMethodFromValues(values: PaymentMethodFormValues, isDefault: boolean): PaymentMethod {
  const method = {
    id: `payment-${Date.now()}`,
    type: values.paymentType,
    holderName: values.paymentHolderName.trim() || undefined,
    cardBrand: values.paymentType === 'card' ? values.paymentCardBrand : undefined,
    bankName: values.paymentType === 'transfer' ? values.paymentBankName.trim() || undefined : undefined,
    walletProvider: values.paymentType === 'wallet' ? values.paymentWalletProvider.trim() || undefined : undefined,
    walletPhone: values.paymentType === 'wallet' ? values.paymentWalletPhone.trim() || undefined : undefined,
    last4: values.paymentType === 'cash' ? undefined : values.paymentLast4 || undefined,
    isDefault,
  } satisfies Omit<PaymentMethod, 'label'>;
  return { ...method, label: buildPaymentMethodLabel(method) };
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, updateProfile, user: profile } = useAuth();
  const [locationStatus, setLocationStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const paymentMethods = ensureDefaultPaymentMethod(profile?.paymentMethods ?? []);
  const { register, handleSubmit, setValue, formState: { isDirty, isSubmitSuccessful } } = useForm<ProfileFormValues>({
    values: {
      name: profile?.name ?? '',
      email: profile?.email ?? '',
      phone: profile?.phone ?? '',
      whatsapp: profile?.whatsapp ?? '',
      telegram: profile?.telegram ?? '',
      line1: profile?.defaultAddress?.line1 ?? '',
      city: profile?.defaultAddress?.city ?? '',
      department: profile?.defaultAddress?.department ?? '',
      postalCode: profile?.defaultAddress?.postalCode ?? '',
      lat: profile?.defaultAddress?.lat?.toString() ?? '',
      lng: profile?.defaultAddress?.lng?.toString() ?? '',
    },
  });
  const { register: registerPayment, handleSubmit: handlePaymentSubmit, watch: watchPayment, reset: resetPaymentForm, formState: { errors: paymentErrors } } = useForm<PaymentMethodFormValues>({ defaultValues: EMPTY_PAYMENT_METHOD });
  const paymentType = watchPayment('paymentType');

  if (!profile) return null;

  const persistPaymentMethods = (methods: PaymentMethod[]): void => {
    updateProfile({ ...profile, paymentMethods: ensureDefaultPaymentMethod(methods) });
  };

  const onProfileSubmit = (values: ProfileFormValues): void => {
    const updated: UserProfile = {
      id: profile.id,
      name: values.name,
      email: values.email,
      roles: profile.roles,
      phone: values.phone || undefined,
      whatsapp: values.whatsapp || undefined,
      telegram: values.telegram || undefined,
      paymentMethods,
      defaultAddress: values.line1 && values.city && values.department
        ? { line1: values.line1, city: values.city, department: values.department, postalCode: values.postalCode, lat: Number(values.lat) || undefined, lng: Number(values.lng) || undefined }
        : undefined,
    };
    updateProfile(updated);
  };

  const addPaymentMethod = (values: PaymentMethodFormValues): void => {
    const shouldBeDefault = values.isDefault || paymentMethods.length === 0;
    const next = shouldBeDefault
      ? [...paymentMethods.map((method) => ({ ...method, isDefault: false })), paymentMethodFromValues(values, true)]
      : [...paymentMethods, paymentMethodFromValues(values, false)];
    persistPaymentMethods(next);
    resetPaymentForm(EMPTY_PAYMENT_METHOD);
    setPaymentStatus('Método de pago agregado.');
  };

  const setDefaultPaymentMethod = (id: string): void => {
    persistPaymentMethods(paymentMethods.map((method) => ({ ...method, isDefault: method.id === id })));
    setPaymentStatus('Método predeterminado actualizado.');
  };

  const removePaymentMethod = (id: string): void => {
    persistPaymentMethods(paymentMethods.filter((method) => method.id !== id));
    setPaymentStatus('Método de pago eliminado.');
  };

  const captureLocation = (): void => {
    if (!navigator.geolocation) {
      setLocationStatus('Este navegador no permite geolocalización.');
      return;
    }
    setLocationStatus('Solicitando ubicación…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('lat', position.coords.latitude.toFixed(6), { shouldDirty: true });
        setValue('lng', position.coords.longitude.toFixed(6), { shouldDirty: true });
        setLocationStatus('Ubicación registrada.');
      },
      () => setLocationStatus('No se pudo obtener la ubicación. Puedes completar la dirección manualmente.'),
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-4 text-3xl font-semibold text-slate-950">Perfil</h1>
        <p className="mb-6 text-slate-600">Actualiza tus datos de contacto, dirección y preferencias de pago para el checkout.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onProfileSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">Nombre<input {...register('name', { required: true })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
            <label className="block text-sm text-slate-700">Email<input {...register('email', { required: true })} type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm text-slate-700">Teléfono<input {...register('phone')} type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
            <label className="block text-sm text-slate-700">WhatsApp<input {...register('whatsapp')} type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
            <label className="block text-sm text-slate-700">Telegram<input {...register('telegram')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
          </div>
          <fieldset className="rounded-2xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">Dirección predeterminada</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">Dirección<input {...register('line1')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Ciudad<input {...register('city')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Departamento<input {...register('department')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Código postal<input {...register('postalCode')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Latitud<input {...register('lat')} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900" /></label>
              <label className="block text-sm text-slate-700">Longitud<input {...register('lng')} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900" /></label>
            </div>
            <button type="button" onClick={captureLocation} className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Usar mi ubicación</button>
            {locationStatus && <p role="status" className="mt-2 text-sm text-slate-600">{locationStatus}</p>}
          </fieldset>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={!isDirty} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Guardar datos del perfil</button>
            {isSubmitSuccessful && <p role="status" className="text-sm font-medium text-emerald-700">Perfil actualizado.</p>}
          </div>
        </form>

        <section className="mt-8 rounded-2xl border border-orange-200 p-4" aria-labelledby="payment-methods-heading">
          <h2 id="payment-methods-heading" className="text-base font-semibold text-slate-800">Métodos de pago</h2>
          <p className="mt-1 text-sm text-slate-600">Agrega las referencias que deseas ver en checkout y marca una como predeterminada.</p>
          {paymentMethods.length > 0 ? (
            <ul aria-label="Métodos de pago guardados" className="mt-4 space-y-3">
              {paymentMethods.map((method) => (
                <li key={method.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <div><p className="font-semibold text-slate-900">{method.label}</p>{method.isDefault && <p className="mt-1 text-xs font-medium text-orange-700">Predeterminado</p>}</div>
                  <div className="flex gap-2"><button type="button" disabled={method.isDefault} onClick={() => setDefaultPaymentMethod(method.id)} className="rounded-lg border border-orange-300 px-3 py-1.5 font-semibold text-orange-800 disabled:cursor-not-allowed disabled:opacity-50">Usar por defecto</button><button type="button" onClick={() => removePaymentMethod(method.id)} aria-label={`Eliminar ${method.label}`} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:border-rose-300 hover:text-rose-700">Eliminar</button></div>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No tienes métodos guardados. El checkout ofrecerá efectivo contra entrega como alternativa.</p>}
          <div className="mt-5 border-t border-orange-100 pt-5">
            <h3 className="text-sm font-semibold text-slate-800">Agregar un método</h3>
            <label className="mt-3 block text-sm text-slate-700">Modalidad<select {...registerPayment('paymentType')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">{PAYMENT_METHOD_OPTIONS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label>
            <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">{getPaymentMethodExample(paymentType)}</p>
            {paymentType === 'cash' && <p className="mt-3 text-sm text-slate-600">No se almacenan datos adicionales. Confirma con el equipo si este medio está disponible para tu tipo de pedido.</p>}
            {paymentType === 'card' && <div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="block text-sm text-slate-700">Titular<input {...registerPayment('paymentHolderName', { required: 'Indica el titular de la tarjeta' })} autoComplete="cc-name" placeholder="Ej. Ana Pérez" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label><label className="block text-sm text-slate-700">Marca<select {...registerPayment('paymentCardBrand')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"><option>Visa</option><option>Mastercard</option><option>American Express</option><option>Otra</option></select></label><label className="block text-sm text-slate-700">Últimos 4 dígitos<input {...registerPayment('paymentLast4', { required: 'Ingresa solo los últimos cuatro dígitos', pattern: { value: /^\d{4}$/, message: 'Los últimos cuatro dígitos deben tener exactamente cuatro números' } })} inputMode="numeric" autoComplete="cc-number" maxLength={4} placeholder="4242" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label></div>}
            {paymentType === 'transfer' && <div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="block text-sm text-slate-700">Titular de cuenta<input {...registerPayment('paymentHolderName', { required: 'Indica el titular de la cuenta' })} placeholder="Ej. Ana Pérez" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label><label className="block text-sm text-slate-700">Entidad bancaria<input {...registerPayment('paymentBankName', { required: 'Indica la entidad bancaria' })} placeholder="Ej. Banco Unión" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label><label className="block text-sm text-slate-700">Últimos 4 dígitos<input {...registerPayment('paymentLast4', { required: 'Ingresa solo los últimos cuatro dígitos', pattern: { value: /^\d{4}$/, message: 'Los últimos cuatro dígitos deben tener exactamente cuatro números' } })} inputMode="numeric" maxLength={4} placeholder="1234" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label></div>}
            {paymentType === 'wallet' && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm text-slate-700">Proveedor<input {...registerPayment('paymentWalletProvider', { required: 'Indica el proveedor de billetera' })} placeholder="Ej. Tigo Money" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label><label className="block text-sm text-slate-700">Número registrado<input {...registerPayment('paymentWalletPhone', { required: 'Indica el número registrado' })} type="tel" inputMode="tel" placeholder="7XX XXX XX" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label></div>}
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-700"><input {...registerPayment('isDefault')} type="checkbox" className="size-4 accent-orange-600" />Establecer como predeterminado</label>
            {(paymentErrors.paymentHolderName || paymentErrors.paymentLast4 || paymentErrors.paymentBankName || paymentErrors.paymentWalletProvider || paymentErrors.paymentWalletPhone) && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{paymentErrors.paymentHolderName?.message ?? paymentErrors.paymentLast4?.message ?? paymentErrors.paymentBankName?.message ?? paymentErrors.paymentWalletProvider?.message ?? paymentErrors.paymentWalletPhone?.message}</p>}
            <button type="button" onClick={handlePaymentSubmit(addPaymentMethod)} className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Añadir método</button>
            {paymentStatus && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{paymentStatus}</p>}
            <p className="mt-3 text-sm text-slate-600">Configuración simulada: no ingreses ni se almacena número completo de tarjeta, cuenta, CVV, PIN o contraseña.</p>
          </div>
        </section>
        <button type="button" onClick={() => { logout(); navigate('/login'); }} className="mt-8 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Cerrar sesión</button>
      </div>
    </main>
  );
}
