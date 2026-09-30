'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog, { ConfirmDialogOptions } from '@/components/ui/ConfirmDialog';

interface ConfirmDialogContextType {
  confirm: (options: ConfirmDialogOptions | string) => Promise<boolean>;
  alert: (options: ConfirmDialogOptions | string) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType>({
  confirm: async () => false,
  alert: async () => {},
});

export const useConfirmDialog = () => useContext(ConfirmDialogContext);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions;
    resolve: ((val: any) => void) | null;
  }>({
    isOpen: false,
    options: { message: '' },
    resolve: null,
  });

  const confirm = useCallback((opts: ConfirmDialogOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const options: ConfirmDialogOptions =
        typeof opts === 'string'
          ? { message: opts, title: 'ยืนยันการดำเนินการ', variant: 'danger' }
          : { ...opts, isAlert: false };

      setDialogState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((opts: ConfirmDialogOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      const options: ConfirmDialogOptions =
        typeof opts === 'string'
          ? { message: opts, title: 'แจ้งเตือน', variant: 'info', isAlert: true }
          : { ...opts, isAlert: true };

      setDialogState({
        isOpen: true,
        options,
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        options={dialogState.options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}
