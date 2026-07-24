export interface ZebraDevice {
  uid: string;
  name: string;
  connection: string;
  deviceType: string;
  provider: string;
  send: (
    data: string,
    successCallback?: (response: string) => void,
    errorCallback?: (error: unknown) => void
  ) => void;
}

function getBrowserPrint() {
  if (!window.BrowserPrint) {
    throw new Error(
      "Browser Print no está disponible. Verifica que esté instalado y ejecutándose."
    );
  }
  return window.BrowserPrint;
}

export function getDefaultPrinter(): Promise<ZebraDevice> {
  return new Promise((resolve, reject) => {
    const BrowserPrint = getBrowserPrint();

    BrowserPrint.getDefaultDevice(
      "printer",
      (device: ZebraDevice | undefined) => {
        if (!device) {
          reject(new Error("No hay impresora Zebra predeterminada configurada."));
          return;
        }
        resolve(device);
      },
      (error: unknown) => reject(error)
    );
  });
}

export function getLocalPrinters(): Promise<ZebraDevice[]> {
  return new Promise((resolve, reject) => {
    const BrowserPrint = getBrowserPrint();

    BrowserPrint.getLocalDevices(
      (devices: ZebraDevice[]) => resolve(devices ?? []),
      (error: unknown) => reject(error),
      "printer"
    );
  });
}

export async function sendZpl(zpl: string): Promise<void> {
  const device = await getDefaultPrinter();

  return new Promise((resolve, reject) => {
    device.send(
      zpl,
      () => resolve(),
      (error: unknown) => reject(error)
    );
  });
}