package com.kripin.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

@CapacitorPlugin(name = "PdfSaver")
public class PdfSaverPlugin extends Plugin {

    private static final String TAG = "PdfSaverPlugin";
    private static final String CALLBACK_SAVE_PDF = "savePdfPicker";

    private static final String PREFS_NAME = "pdf_saver";
    private static final String PATH_PREFIX = "path_";
    private static final String NAME_PREFIX = "name_";

    @PluginMethod
    public void savePdf(PluginCall call) {
        String fileName = call.getString("fileName");
        String base64 = call.getString("base64");

        if (fileName == null || fileName.trim().isEmpty()) {
            call.reject("PDF file name is missing.");
            return;
        }

        if (base64 == null || base64.trim().isEmpty()) {
            call.reject("PDF data is missing.");
            return;
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            call.reject("Android 10 or newer is required.");
            return;
        }

        File tempFile = null;

        try {
            /*
             * Decode the PDF received from React.
             */
            byte[] pdfBytes = Base64.decode(base64, Base64.DEFAULT);

            if (pdfBytes.length == 0) {
                throw new Exception("Decoded PDF data is empty.");
            }

            Log.d(
                TAG,
                "PDF decoded successfully. bytes=" + pdfBytes.length
            );

            /*
             * Create an app-private temporary PDF.
             *
             * The Android picker will receive only the file name.
             * The large Base64 payload will NOT be carried into the
             * Activity state.
             */
            String tempName =
                "kripin_pdf_" +
                UUID.randomUUID().toString() +
                ".pdf";

            tempFile = new File(
                getContext().getCacheDir(),
                tempName
            );

            try (FileOutputStream outputStream =
                     new FileOutputStream(tempFile)) {

                outputStream.write(pdfBytes);
                outputStream.flush();
            }

            if (!tempFile.exists() ||
                tempFile.length() != pdfBytes.length) {

                throw new Exception(
                    "Could not prepare the PDF file."
                );
            }

            Log.d(
                TAG,
                "Temporary PDF ready. bytes=" +
                tempFile.length()
            );

            /*
             * Store only the tiny temporary-file path and original
             * filename. These survive Activity recreation without
             * putting the PDF bytes into Android's Bundle.
             */
            String callbackId = call.getCallbackId();

            SharedPreferences prefs =
                getContext().getSharedPreferences(
                    PREFS_NAME,
                    0
                );

            prefs.edit()
                .putString(
                    PATH_PREFIX + callbackId,
                    tempFile.getAbsolutePath()
                )
                .putString(
                    NAME_PREFIX + callbackId,
                    fileName
                )
                .apply();

            /*
             * CRITICAL:
             *
             * The original PluginCall contains the complete Base64 PDF.
             * Capacitor may save PluginCall state when the Activity
             * launches the system picker.
             *
             * Remove the large Base64 value BEFORE launching the picker.
             * This prevents TransactionTooLargeException.
             */
            call.getData().remove("base64");

            /*
             * Android's official system "Save as" document picker.
             *
             * User can select Downloads, Documents, Drive, etc.
             */
            Intent intent =
                new Intent(Intent.ACTION_CREATE_DOCUMENT);

            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("application/pdf");
            intent.putExtra(
                Intent.EXTRA_TITLE,
                fileName
            );

            startActivityForResult(
                call,
                intent,
                CALLBACK_SAVE_PDF
            );

        } catch (Exception error) {

            if (tempFile != null) {
                try {
                    tempFile.delete();
                } catch (Exception ignored) {
                }
            }

            Log.e(
                TAG,
                "Could not start PDF save.",
                error
            );

            call.reject(
                "PDF save failed: " +
                error.getClass().getSimpleName() +
                ": " +
                String.valueOf(error.getMessage())
            );
        }
    }

    @ActivityCallback
    private void savePdfPicker(
        PluginCall call,
        ActivityResult result
    ) {
        if (call == null) {
            Log.e(
                TAG,
                "PDF picker callback received null PluginCall."
            );
            return;
        }

        String callbackId = call.getCallbackId();

        SharedPreferences prefs =
            getContext().getSharedPreferences(
                PREFS_NAME,
                0
            );

        String tempPath =
            prefs.getString(
                PATH_PREFIX + callbackId,
                null
            );

        String fileName =
            prefs.getString(
                NAME_PREFIX + callbackId,
                "Kripin.pdf"
            );

        prefs.edit()
            .remove(PATH_PREFIX + callbackId)
            .remove(NAME_PREFIX + callbackId)
            .apply();

        if (result.getResultCode() != Activity.RESULT_OK ||
            result.getData() == null ||
            result.getData().getData() == null) {

            deleteTempFile(tempPath);

            call.reject("PDF save was cancelled.");
            return;
        }

        Uri destinationUri =
            result.getData().getData();

        if (tempPath == null ||
            tempPath.trim().isEmpty()) {

            call.reject(
                "Temporary PDF file could not be found."
            );
            return;
        }

        File tempFile = new File(tempPath);

        try {
            if (!tempFile.exists()) {
                throw new Exception(
                    "Temporary PDF file no longer exists."
                );
            }

            long expectedBytes = tempFile.length();

            if (expectedBytes <= 0) {
                throw new Exception(
                    "Temporary PDF file is empty."
                );
            }

            ContentResolver resolver =
                getContext().getContentResolver();

            long copiedBytes = 0;

            try (
                InputStream inputStream =
                    new FileInputStream(tempFile);

                OutputStream outputStream =
                    resolver.openOutputStream(
                        destinationUri,
                        "w"
                    )
            ) {
                if (outputStream == null) {
                    throw new Exception(
                        "Android could not open the selected save location."
                    );
                }

                byte[] buffer = new byte[8192];
                int bytesRead;

                while ((bytesRead =
                        inputStream.read(buffer)) != -1) {

                    outputStream.write(
                        buffer,
                        0,
                        bytesRead
                    );

                    copiedBytes += bytesRead;
                }

                outputStream.flush();
            }

            /*
             * Never report success for an incomplete/0-byte file.
             */
            if (copiedBytes <= 0 ||
                copiedBytes != expectedBytes) {

                try {
                    resolver.delete(
                        destinationUri,
                        null,
                        null
                    );
                } catch (Exception ignored) {
                }

                throw new Exception(
                    "PDF verification failed. Expected " +
                    expectedBytes +
                    " bytes but wrote " +
                    copiedBytes +
                    " bytes."
                );
            }

            JSObject resultData = new JSObject();

            resultData.put(
                "success",
                true
            );

            resultData.put(
                "uri",
                destinationUri.toString()
            );

            resultData.put(
                "fileName",
                fileName
            );

            resultData.put(
                "bytes",
                copiedBytes
            );

            resultData.put(
                "location",
                "Selected location"
            );

            Log.d(
                TAG,
                "PDF saved successfully. bytes=" +
                copiedBytes
            );

            call.resolve(resultData);

        } catch (Exception error) {

            Log.e(
                TAG,
                "PDF save failed after picker.",
                error
            );

            try {
                getContext()
                    .getContentResolver()
                    .delete(
                        destinationUri,
                        null,
                        null
                    );
            } catch (Exception ignored) {
            }

            call.reject(
                "PDF save failed: " +
                error.getClass().getSimpleName() +
                ": " +
                String.valueOf(error.getMessage())
            );

        } finally {
            deleteTempFile(tempPath);
        }
    }

    private void deleteTempFile(String path) {
        if (path == null || path.trim().isEmpty()) {
            return;
        }

        try {
            File file = new File(path);

            if (file.exists()) {
                file.delete();
            }
        } catch (Exception ignored) {
        }
    }
}
