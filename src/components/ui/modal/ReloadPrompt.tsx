// src/components/ReloadPrompt.tsx
import { Alert, Button, Snackbar } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  // El hook de vite-plugin-pwa para React
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Mensaje cuando la app está lista para usarse offline */}
      <Snackbar open={offlineReady} autoHideDuration={6000} onClose={close}>
        <Alert severity="success" onClose={close}>
          La aplicación está lista para trabajar sin conexión.
        </Alert>
      </Snackbar>

      {/* Mensaje cuando hay una actualización disponible */}
      <Snackbar 
        open={needRefresh} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled"
          action={
            <>
              <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                ACTUALIZAR
              </Button>
              <Button color="inherit" size="small" onClick={close}>
                LUEGO
              </Button>
            </>
          }
        >
          ¡Nueva versión disponible!
        </Alert>
      </Snackbar>
    </>
  );
}

export default ReloadPrompt;