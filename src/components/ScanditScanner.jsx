import React, { useEffect, useRef, useState } from "react";
import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";

import { Paper, List, ListItem, ListItemText, Button, Typography } from "@mui/material";
import { SCANDIT_API } from "../scanbotConfig";

const SCAN_TYPE = {
  AUTO_DETECT: "AUTO_DETECT",
  MULTI: "MULTI",
};

export const doesMatchNTDFormat = (value) => {
  const ntdPattern = /^(ALCL[a-fA-F0-9]{8}|SCOM[a-zA-Z0-9]{8})$/;
  return new RegExp(ntdPattern).test(value);
};

const ScanditScanner = () => {
  const [scanType, setScanType] = useState(SCAN_TYPE.AUTO_DETECT);
  const [scanResults, setScanResults] = useState([]);
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1); // ← ADD ZOOM STATE

  const contextRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let view, camera, barcodeTracking;

    const initScanner = async () => {
      try {
        view = new SDCCore.DataCaptureView();
        view.connectToElement(document.getElementById("data-capture-view"));
        view.showProgressBar();

        await SDCCore.configure({
          licenseKey: SCANDIT_API,
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
        await camera.applySettings(SDCBarcode.BarcodeTracking.recommendedCameraSettings);
        await context.setFrameSource(camera);

        // Enable tracking
        const settings = new SDCBarcode.BarcodeTrackingSettings();
        settings.enableSymbologies([
          SDCBarcode.Symbology.Code128,
          SDCBarcode.Symbology.Code39,
          SDCBarcode.Symbology.QR,
          SDCBarcode.Symbology.EAN8,
          SDCBarcode.Symbology.UPCE,
          SDCBarcode.Symbology.EAN13UPCA,
        ]);
        settings.settingsForSymbology(SDCBarcode.Symbology.Code39).activeSymbolCounts =
          Array.from({ length: 14 }, (_, i) => i + 7);

        barcodeTracking = await SDCBarcode.BarcodeTracking.forContext(context, settings);
        await barcodeTracking.setEnabled(true);

        // Green overlay for all
        const overlay = SDCBarcode.BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(
          barcodeTracking,
          view
        );
        overlay.listener = {
          brushForTrackedBarcode: () =>
            new SDCCore.Brush(
              SDCCore.Color.fromHex("#00FF00"),
              SDCCore.Color.fromHex("#00FF00"),
              2
            ),
        };

        barcodeTracking.addListener({
          didUpdateSession: (_, session) => {
            if (scanType === SCAN_TYPE.AUTO_DETECT || scanType === SCAN_TYPE.MULTI) {
              const detected = session.addedTrackedBarcodes.map((b) => b.barcode.data);
              if (detected.length === 0) return;
              setScanResults((prev) => [...new Set([...prev, ...detected])]);
            }
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
  }, []);

  // Toggle torch
  const toggleTorch = async () => {
    if (!cameraRef.current) return;
    const desired = torchOn ? SDCCore.TorchState.Off : SDCCore.TorchState.On;
    await cameraRef.current.setDesiredTorchState(desired);
    setTorchOn((p) => !p);
  };

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <>
      {/* Scanner container (ZOOM APPLIED HERE) */}
      <div
        style={{
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div
          id="data-capture-view"
          style={{ height: "100vh", width: "100%", position: "relative" }}
        />
      </div>

      {/* ❌ Close Button */}
      <button
        onClick={() => {
          contextRef.current?.dispose();
          window.location.reload();
        }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 9999,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          border: "none",
          fontSize: "20px",
          pointerEvents: "auto",
        }}
      >
        ✕
      </button>

      {/* ZOOM BUTTONS */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Button variant="contained" onClick={zoomIn}>
          +
        </Button>
        <Button variant="contained" onClick={resetZoom}>
          1x
        </Button>
        <Button variant="contained" onClick={zoomOut}>
          −
        </Button>
      </div>

      {/* MULTI SCAN LIST */}
      {scanType === SCAN_TYPE.MULTI && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            maxHeight: "200px",
            width: "90%",
            overflowY: "auto",
            padding: "8px",
            zIndex: 5000,
          }}
        >
          <Typography variant="subtitle1">Scanned Barcodes</Typography>
          <List dense>
            {scanResults.map((code, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={code} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* AUTO/MULTI BUTTON */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Button
          variant="contained"
          onClick={() =>
            setScanType((prev) =>
              prev === SCAN_TYPE.AUTO_DETECT ? SCAN_TYPE.MULTI : SCAN_TYPE.AUTO_DETECT
            )
          }
          sx={{
            pointerEvents: "auto",
            borderRadius: "50px",
            fontSize: "18px",
            fontWeight: 600,
            padding: "12px 24px",
          }}
        >
          {scanType === SCAN_TYPE.AUTO_DETECT ? "Auto" : "Multi"}
        </Button>
      </div>

      {/* TORCH */}
      <Button
        variant="contained"
        onClick={toggleTorch}
        sx={{
          position: "absolute",
          bottom: "40px",
          right: "20px",
          borderRadius: "50%",
          width: "55px",
          height: "55px",
          fontSize: "20px",
          minWidth: "0px",
          backgroundColor: torchOn ? "#ffd54f" : "white",
        }}
      >
        🔦
      </Button>
    </>
  );
};

export default ScanditScanner;
