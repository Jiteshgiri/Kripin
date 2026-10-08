import { registerPlugin } from '@capacitor/core';

export interface PdfSaverPlugin {
  savePdf(options: {
    fileName: string;
    base64: string;
  }): Promise<{
    success: boolean;
    uri: string;
    fileName: string;
  }>;
}

export const PdfSaver = registerPlugin<PdfSaverPlugin>('PdfSaver');