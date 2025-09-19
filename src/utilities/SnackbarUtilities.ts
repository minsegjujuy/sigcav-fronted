import { useSnackbar, type VariantType } from "notistack"

let useSnackbarRef: ReturnType<typeof useSnackbar>;

export const SnackbarUtilitiesConfigurator = () => {
    useSnackbarRef = useSnackbar();
    return null;
};

export const SnackbarUtilities = {
    toast(msg: string, variant: VariantType = "default") {
        useSnackbarRef.enqueueSnackbar(msg, { variant });
    },
    success(message: string) {
        useSnackbarRef.enqueueSnackbar(message, { variant: 'success' });
    },
    error(message: string) {
        useSnackbarRef.enqueueSnackbar(message, { variant: 'error' });
    },
    info(message: string) {
        useSnackbarRef.enqueueSnackbar(message, { variant: 'info' });
    },
    warning(message: string) {
        useSnackbarRef.enqueueSnackbar(message, { variant: 'warning' });
    }
};