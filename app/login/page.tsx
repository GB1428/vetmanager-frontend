'use client';

import { useState } from 'react';
import {
  GoogleLogin,
  GoogleOAuthProvider,
} from '@react-oauth/google';

function LoginContent() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [usuario, setUsuario] = useState<{
    nombre: string;
    email: string;
    negocioId: number;
  } | null>(null);

  async function iniciarSesion(credential: string) {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ credential }),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message || 'No se pudo iniciar sesión.',
        );
      }

      // Almacenamiento temporal para probar el flujo.
      // Para producción, es preferible una cookie HttpOnly segura.
      sessionStorage.setItem('accessToken', datos.accessToken);

      setUsuario(datos.usuario);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error de conexión con el servidor.',
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-teal-700">
            VetManager
          </h1>

          <p className="mt-2 text-slate-600">
            Gestión inteligente para tu clínica veterinaria
          </p>
        </div>

        {usuario ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold text-slate-800">
              ¡Bienvenido, {usuario.nombre}!
            </h2>

            <p className="text-sm text-slate-600">
              Sesión iniciada con {usuario.email}
            </p>

            <p className="text-sm text-slate-600">
              Clínica asignada: {usuario.negocioId}
            </p>

            <p className="text-sm text-green-700">
              Inicio de sesión completado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Iniciar sesión
            </h2>

            <p className="text-center text-sm text-slate-600">
              Accede con la cuenta de Google autorizada
              para tu clínica.
            </p>

            <GoogleLogin
              onSuccess={(respuesta) => {
                if (respuesta.credential) {
                  void iniciarSesion(respuesta.credential);
                } else {
                  setError(
                    'Google no devolvió una credencial válida.',
                  );
                }
              }}
              onError={() => {
                setError('No se pudo iniciar sesión con Google.');
              }}
              text="continue_with"
              shape="rectangular"
              theme="outline"
              width="280"
            />

            {cargando && (
              <p className="text-sm text-slate-600">
                Verificando tu cuenta...
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="text-center text-sm text-red-600"
              >
                {error}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <LoginContent />
    </GoogleOAuthProvider>
  );
}