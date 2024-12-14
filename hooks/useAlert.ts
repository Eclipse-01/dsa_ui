import { useState } from 'react';

export function useAlert() {
  const [alert, setAlert] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const showAlert = (title: string, description: string) => {
    setAlert({ title, description });
    // 3秒后自动关闭
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  return {
    alert,
    showAlert,
  };
}
