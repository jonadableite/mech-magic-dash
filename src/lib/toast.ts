import { toast } from "sonner";

// Sistema de notificações centralizado (Single Responsibility Principle)
export class ToastService {
  static success(message: string, description?: string) {
    toast.success(message, {
      description,
      duration: 4000,
    });
  }

  static error(message: string, description?: string) {
    toast.error(message, {
      description,
      duration: 6000,
    });
  }

  static info(message: string, description?: string) {
    toast.info(message, {
      description,
      duration: 4000,
    });
  }

  static warning(message: string, description?: string) {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  }

  static loading(message: string) {
    return toast.loading(message);
  }

  static dismiss(id?: string | number) {
    toast.dismiss(id);
  }
}

// Funções auxiliares para operações comuns
export const showSuccess = (message: string, description?: string) => {
  ToastService.success(message, description);
};

export const showError = (message: string, description?: string) => {
  ToastService.error(message, description);
};

export const showInfo = (message: string, description?: string) => {
  ToastService.info(message, description);
};

export const showWarning = (message: string, description?: string) => {
  ToastService.warning(message, description);
};
