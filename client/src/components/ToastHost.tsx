import { useEffect, useState } from 'react';

type Toast = { id: number; message: string };

export function showErrorToast(message: string): void {
  window.dispatchEvent(new CustomEvent('aida:error-toast', { detail: message }));
}

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message }]);
      window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 6000);
    };
    window.addEventListener('aida:error-toast', onToast);
    return () => window.removeEventListener('aida:error-toast', onToast);
  }, []);

  return (
    <div className="toast-stack" aria-live="assertive" aria-atomic="true">
      {toasts.map((toast) => (
        <div className="toast toast-error" role="alert" key={toast.id}>
          <strong>Errore</strong>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}