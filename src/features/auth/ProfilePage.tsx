import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { UserProfile } from '../../types';
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
  paymentType: 'card' | 'transfer' | 'cash' | 'wallet';
  paymentLabel: string;
  lat: string;
  lng: string;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, updateProfile, user: profile } = useAuth();
  const [locationStatus, setLocationStatus] = useState('');
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
      paymentType: profile?.paymentMethods?.[0]?.type ?? 'cash',
      paymentLabel: profile?.paymentMethods?.[0]?.label ?? '',
      lat: profile?.defaultAddress?.lat?.toString() ?? '',
      lng: profile?.defaultAddress?.lng?.toString() ?? '',
    },
  });

  if (!profile) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const onSubmit = (values: ProfileFormValues): void => {
    const updated: UserProfile = {
      id: profile.id,
      name: values.name,
      email: values.email,
      roles: profile.roles,
      phone: values.phone || undefined,
      whatsapp: values.whatsapp || undefined,
      telegram: values.telegram || undefined,
      paymentMethods: values.paymentLabel
        ? [{ id: 'profile-payment', type: values.paymentType, label: values.paymentLabel }]
        : profile.paymentMethods,
      defaultAddress: values.line1 && values.city && values.department
        ? { line1: values.line1, city: values.city, department: values.department, postalCode: values.postalCode, lat: Number(values.lat) || undefined, lng: Number(values.lng) || undefined }
        : undefined,
    };
    updateProfile(updated);
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
        <p className="mb-6 text-slate-600">Actualiza tus datos de contacto y la dirección predeterminada para el checkout.</p>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">Nombre
              <input {...register('name', { required: true })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
            </label>
            <label className="block text-sm text-slate-700">Email
              <input {...register('email', { required: true })} type="email" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm text-slate-700">Teléfono
              <input {...register('phone')} type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
            </label>
            <label className="block text-sm text-slate-700">WhatsApp
              <input {...register('whatsapp')} type="tel" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
            </label>
            <label className="block text-sm text-slate-700">Telegram
              <input {...register('telegram')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
            </label>
          </div>
          <fieldset className="rounded-2xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">Dirección predeterminada</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">Dirección
                <input {...register('line1')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
              </label>
              <label className="block text-sm text-slate-700">Ciudad
                <input {...register('city')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
              </label>
              <label className="block text-sm text-slate-700">Departamento
                <input {...register('department')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
              </label>
              <label className="block text-sm text-slate-700">Código postal
                <input {...register('postalCode')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
              </label>
              <label className="block text-sm text-slate-700">Latitud
                <input {...register('lat')} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900" />
              </label>
              <label className="block text-sm text-slate-700">Longitud
                <input {...register('lng')} readOnly className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900" />
              </label>
            </div>
            <button type="button" onClick={captureLocation} className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Usar mi ubicación</button>
            {locationStatus && <p role="status" className="mt-2 text-sm text-slate-600">{locationStatus}</p>}
          </fieldset>
          <fieldset className="rounded-2xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-700">Método de pago mock</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">Tipo
                <select {...register('paymentType')} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                  <option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="wallet">Billetera digital</option><option value="card">Tarjeta</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700">Etiqueta
                <input {...register('paymentLabel')} placeholder="Ej. Pago contra entrega" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-600">No ingreses datos de tarjeta; este es un medio de pago simulado.</p>
          </fieldset>
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={!isDirty} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Guardar cambios</button>
            {isSubmitSuccessful && <p role="status" className="text-sm font-medium text-emerald-700">Perfil actualizado.</p>}
          </div>
        </form>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
