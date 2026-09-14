import { toast, type Id, type ToastOptions, type UpdateOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  closeButton: true,
};

export const appToast = {
  success(message: string, options?: ToastOptions): Id {
    return toast.success(message, { ...defaultOptions, ...options });
  },
  error(message: string, options?: ToastOptions): Id {
    return toast.error(message, { ...defaultOptions, ...options });
  },
  info(message: string, options?: ToastOptions): Id {
    return toast.info(message, { ...defaultOptions, ...options });
  },
  warning(message: string, options?: ToastOptions): Id {
    return toast.warning(message, { ...defaultOptions, ...options });
  },
  loading(message: string, options?: ToastOptions): Id {
    return toast.loading(message, { ...defaultOptions, ...options });
  },
  update(toastId: Id, options: UpdateOptions) {
    toast.update(toastId, options);
  },
  dismiss(toastId?: Id) {
    toast.dismiss(toastId);
  },
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    params: {
      pending?: string;
      success?: string;
      error?: string;
    },
    options?: ToastOptions,
  ) {
    return toast.promise(promise, params, { ...defaultOptions, ...options });
  },
};
