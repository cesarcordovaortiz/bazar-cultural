import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from './useAuth';

interface FormValues {
  email: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit } = useForm<FormValues>({ defaultValues: { email: '' } });

  const startSession = (email: string, destination: string): void => {
    const isAdmin = email.trim().toLocaleLowerCase().startsWith('admin@');
    login({
      id: 'user-1',
      name: isAdmin ? 'Administración Bazar' : 'Cliente Bazar',
      email,
      roles: [isAdmin ? 'admin' : 'customer'],
      paymentMethods: [
        { id: 'cash', type: 'cash', label: 'Pago contra entrega' },
        { id: 'transfer', type: 'transfer', label: 'Transferencia bancaria' },
      ],
    });
    navigate(destination);
  };

  const onSubmit = (data: FormValues): void => {
    startSession(data.email, '/');
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-4 text-3xl font-semibold text-slate-950">Iniciar sesión</h1>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block space-y-2 text-sm text-slate-700">
            <span>Email</span>
            <input
              {...register('email', { required: true })}
              type="email"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            Entrar
          </button>
        </form>
        <div className="mt-8 border-t border-orange-200 pt-6">
          <p className="text-sm font-semibold text-stone-800">Accesos de demostración</p>
          <p className="mt-1 text-sm text-stone-600">Explora las interfaces sin configurar un backend.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => startSession('cliente@bazar.demo', '/')} className="rounded-2xl border border-orange-300 px-4 py-3 text-sm font-semibold text-orange-800 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ver como cliente</button>
            <button type="button" onClick={() => startSession('admin@bazar.demo', '/admin/campaigns')} className="rounded-2xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ver administración</button>
          </div>
        </div>
      </div>
    </main>
  );
}
