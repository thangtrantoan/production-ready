import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  pauseOnHover: true,
  closeOnClick: true,
};

/**
 * App-wide toast wrapper. Components call `notify.*` instead of importing
 * react-toastify directly, so swapping the toast library later means
 * changing only this file.
 */
export const notify = {
  success(message: string, options?: ToastOptions) {
    toast.success(message, { ...defaultOptions, ...options });
  },
  error(message: string, options?: ToastOptions) {
    toast.error(message, { ...defaultOptions, ...options });
  },
  info(message: string, options?: ToastOptions) {
    toast.info(message, { ...defaultOptions, ...options });
  },
  warning(message: string, options?: ToastOptions) {
    toast.warning(message, { ...defaultOptions, ...options });
  },
  promise<T>(
    promise: Promise<T>,
    messages: { pending: string; success: string; error: string },
    options?: ToastOptions,
  ) {
    return toast.promise(promise, messages, { ...defaultOptions, ...options });
  },
  dismissAll() {
    toast.dismiss();
  },
};
