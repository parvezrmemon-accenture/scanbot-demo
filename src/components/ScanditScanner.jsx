import React, { useEffect, useRef, useState } from "react";

import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";
import { SCANDIT_API } from "../scanbotConfig";

const SCAN_TYPE = {
  NONE: "NONE",
  AUTO_DETECT: "AUTO_DETECT",
  MULTI: "MULTI", // NEW
};

const SCANDIT_API_STRING = SCANDIT_API;

export const doesMatchNTDFormat = (value) => {
  const ntdPattern = /^(ALCL[a-fA-F0-9]{8}|SCOM[a-zA-Z0-9]{8})$/;
  return new RegExp(ntdPattern).test(value);
};

const ScanditScanner = () => {
  const [scanType, setScanType] = useState(SCAN_TYPE.AUTO_DETECT);
  const [scanResults, setScanResults] = useState([]);
  const [torchOn, setTorchOn] = useState(false);

  const contextRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let view, camera, barcodeTracking;

    const initScanner = async () => {
      try {
        view = new SDCCore.DataCaptureView();
        view.connectToElement(document.getElementById("data-capture-view"));
        view.showProgressBar();

        const apiKey = SCANDIT_API_STRING;

        await SDCCore.configure({
          licenseKey: apiKey,
          libraryLocation:
            "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@6.28.1/build/engine/",
          moduleLoaders: [SDCBarcode.barcodeCaptureLoader()],
        });

        const context = await SDCCore.DataCaptureContext.create();
        contextRef.current = context;

        await view.setContext(context);
        view.setProgressBarMessage("Accessing Camera...");

        camera = SDCCore.Camera.default;
        cameraRef.current = camera;

        const cameraSettings = SDCBarcode.BarcodeTracking.recommendedCameraSettings;
        await camera.applySettings(cameraSettings);
        await context.setFrameSource(camera);

        const settings = new SDCBarcode.BarcodeCaptureSettings();
        settings.enableSymbologies([
          SDCBarcode.Symbology.Code128,
          SDCBarcode.Symbology.Code39,
          SDCBarcode.Symbology.QR,
          SDCBarcode.Symbology.EAN8,
          SDCBarcode.Symbology.UPCE,
          SDCBarcode.Symbology.EAN13UPCA,
        ]);

        settings.settingsForSymbology(
          SDCBarcode.Symbology.Code39
        ).activeSymbolCounts = Array.from({ length: 14 }, (_, i) => i + 7);

        barcodeTracking = await SDCBarcode.BarcodeTracking.forContext(
          context,
          settings
        );
        await barcodeTracking.setEnabled(true);

        barcodeTracking.addListener({
          didUpdateSession: (_, session) => {
            if (scanType !== SCAN_TYPE.AUTO_DETECT && scanType !== SCAN_TYPE.MULTI)
              return;

            const detected = session.addedTrackedBarcodes.map(
              (b) => b.barcode.data
            );

            if (detected.length === 0) return;

            setScanResults((prev) => [...new Set([...prev, ...detected])]);
          },
        });

        view.addControl(new SDCCore.CameraSwitchControl());

        view.hideProgressBar();
        await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    initScanner();

    return () => {
      contextRef.current?.dispose();
    };
  }, [scanType]);

  // 🔦 Toggle Torch
  const toggleTorch = async () => {
    if (!cameraRef.current) return;
    const desired = torchOn
      ? SDCCore.TorchState.Off
      : SDCCore.TorchState.On;

    await cameraRef.current.setDesiredTorchState(desired);
    setTorchOn((p) => !p);
  };

  return (
    <>
      <div
        id="data-capture-view"
        style={{
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      />

      {/* Bottom UI Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {/* Auto / Multi Toggle */}
        <button
          onClick={() =>
            setScanType((prev) =>
              prev === SCAN_TYPE.AUTO_DETECT
                ? SCAN_TYPE.MULTI
                : SCAN_TYPE.AUTO_DETECT
            )
          }
          style={{
            pointerEvents: "auto",
            background: "white",
            padding: "18px 28px",
            borderRadius: "50px",
            fontSize: "18px",
            fontWeight: "600",
            border: "none",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
          }}
        >
          {scanType === SCAN_TYPE.AUTO_DETECT ? "Auto" : "Multi"}
        </button>
      </div>

      {/* Torch Icon (bottom-right) */}
      <button
        onClick={toggleTorch}
        style={{
          position: "absolute",
          bottom: "40px",
          right: "20px",
          background: torchOn ? "#ffd54f" : "white",
          borderRadius: "50%",
          width: "55px",
          height: "55px",
          border: "none",
          fontSize: "20px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
        }}
      >
        🔦
      </button>
    </>
  );
};

export default ScanditScanner;
