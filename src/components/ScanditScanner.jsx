import React, { useEffect, useRef, useState } from "react";
import * as Core from "scandit-web-datacapture-core";
import * as Barcode from "scandit-web-datacapture-barcode";

export default function ScanditBarcodeScanner() {
  const scannerRef = useRef(null);

  const [camera, setCamera] = useState(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const [autoScan, setAutoScan] = useState(true);
  const [multiScan, setMultiScan] = useState(false);

  useEffect(() => {
    init();
    return () => cleanup();
  }, []);

  /** ----------------------------
   *  INITIALIZE SCANDIT SDK
   ------------------------------*/
  async function init() {
    try {
      // 1. Configure license
      await Core.configure({
        licenseKey: "YOUR_LICENSE_KEY",
      });

      // 2. Create DataCaptureContext
      const context = await Core.DataCaptureContext.create();

      // 3. Get default camera
      const cam = await Core.CameraAccess.getDefaultCamera();
      if (!cam) {
        console.error("No camera found");
        return;
      }
      setCamera(cam);

      // Check torch capability
      setTorchSupported(cam.settings.availableTorch === true);

      // 4. Apply camera settings
      await cam.applySettings(Core.CameraSettings.create());
      context.setFrameSource(cam);

      // 5. Barcode capture setup
      const barcodeSettings = Barcode.BarcodeCaptureSettings.create();
      barcodeSettings.enableSymbologies([
        Barcode.Symbology.EAN13UPCA,
        Barcode.Symbology.EAN8,
        Barcode.Symbology.CODE128,
        Barcode.Symbology.QR,
      ]);

      const barcodeCapture = await Barcode.BarcodeCapture.create(
        context,
        barcodeSettings
      );

      // When a barcode is scanned
      barcodeCapture.isEnabled = true;

      barcodeCapture.addListener({
        didScan: (_, session) => {
          const codes = session.newlyRecognizedBarcodeIds.map((id) =>
            session.getBarcode(id)
          );

          console.log("Scanned codes:", codes);

          if (autoScan === false) barcodeCapture.isEnabled = false;

          if (multiScan === false) {
            if (codes.length > 0) {
              alert(`Scanned: ${codes[0].data}`);
              barcodeCapture.isEnabled = false;
            }
          }
        },
      });

      // 6. Show camera preview
      const view = await Core.DataCaptureView.create(context);
      view.connectToElement(scannerRef.current);

      // 7. Start camera
      await cam.switchToDesiredState(Core.FrameSourceState.On);
    } catch (e) {
      console.error("INIT ERROR:", e);
    }
  }

  /** ----------------------------
   *  CLEANUP
   ------------------------------*/
  async function cleanup() {
    if (camera) {
      await camera.switchToDesiredState(Core.FrameSourceState.Off);
    }
  }

  /** ----------------------------
   *  TORCH TOGGLE
   ------------------------------*/
  async function toggleTorch() {
    if (!camera) return;

    const settings = camera.settings;
    settings.torchEnabled = !torchEnabled;

    await camera.applySettings(settings);

    setTorchEnabled(settings.torchEnabled);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#000",
      }}
    >
      {/* Camera Preview */}
      <div
        ref={scannerRef}
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
        }}
      />

      {/* Bottom-Center Controls */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Auto Scan Toggle */}
        <button
          onClick={() => setAutoScan((x) => !x)}
          style={toggleStyle}
        >
          Auto: {autoScan ? "ON" : "OFF"}
        </button>

        {/* Multi Scan Toggle */}
        <button
          onClick={() => setMultiScan((x) => !x)}
          style={toggleStyle}
        >
          Multi: {multiScan ? "ON" : "OFF"}
        </button>

        {/* Torch Button */}
        {torchSupported && (
          <button onClick={toggleTorch} style={toggleStyle}>
            {torchEnabled ? "Torch 🔥" : "Torch 💡"}
          </button>
        )}
      </div>
    </div>
  );
}

/** Button Style */
const toggleStyle = {
  padding: "10px 18px",
  fontSize: "14px",
  borderRadius: "30px",
  border: "none",
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(6px)",
  cursor: "pointer",
};
