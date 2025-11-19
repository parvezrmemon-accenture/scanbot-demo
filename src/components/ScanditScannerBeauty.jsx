import React, { useEffect, useRef, useState } from "react";
import * as SDCCore from "scandit-web-datacapture-core";
import * as SDCBarcode from "scandit-web-datacapture-barcode";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import { SCANDIT_API } from "../scanbotConfig";

const SCAN_TYPE = {
  AUTO: "AUTO",
  MULTI: "MULTI",
};

export default function ScanditScannerBeauty({ onClose }) {
  const [scanType, setScanType] = useState(SCAN_TYPE.AUTO);
  const [scanResults, setScanResults] = useState([]);
  const [torchOn, setTorchOn] = useState(false);

  const contextRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let view, camera, barcodeTracking;

    const init = async () => {
      try {
        await SDCCore.configure({
          licenseKey: SCANDIT_API,
          libraryLocation:
            "https://cdn.jsdelivr.net/npm/scandit-web-datacapture-barcode@6.28.1/build/engine/",
          moduleLoaders: [SDCBarcode.barcodeCaptureLoader()],
        });

        const context = await SDCCore.DataCaptureContext.create();
        contextRef.current = context;

        camera = SDCCore.Camera.default;
        cameraRef.current = camera;

        const viewEl = document.getElementById("scan-view-box");
        view = new SDCCore.DataCaptureView();
        await view.connectToElement(viewEl);
        await view.setContext(context);

        await camera.applySettings(
          SDCBarcode.BarcodeTracking.recommendedCameraSettings
        );
        await context.setFrameSource(camera);

        // Enable symbologies
        const settings = new SDCBarcode.BarcodeTrackingSettings();
        settings.enableSymbologies([
          SDCBarcode.Symbology.Code128,
          SDCBarcode.Symbology.Code39,
          SDCBarcode.Symbology.QR,
          SDCBarcode.Symbology.EAN8,
          SDCBarcode.Symbology.UPCE,
          SDCBarcode.Symbology.EAN13UPCA,
        ]);

        barcodeTracking = await SDCBarcode.BarcodeTracking.forContext(
          context,
          settings
        );
        barcodeTracking.setEnabled(true);

        // Green overlay for all
        const overlay =
          SDCBarcode.BarcodeTrackingBasicOverlay.withBarcodeTrackingForView(
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

        // Listen for scans
        barcodeTracking.addListener({
          didUpdateSession: (mode, session) => {
            const items = session.addedTrackedBarcodes.map(
              (b) => b.barcode.data
            );

            if (items.length === 0) return;

            if (scanType === SCAN_TYPE.AUTO) {
              console.log("items", items);
              setScanResults(items);
              return;
            }

            setScanResults((prev) => [...new Set([...prev, ...items])]);
          },
        });

        await camera.switchToDesiredState(SDCCore.FrameSourceState.On);
      } catch (err) {
        console.error("Scanner init error:", err);
      }
    };

    init();
    return () => contextRef.current?.dispose();
  }, [scanType, onClose]);

  const toggleTorch = async () => {
    if (!cameraRef.current) return;
    await cameraRef.current.setDesiredTorchState(
      torchOn ? SDCCore.TorchState.Off : SDCCore.TorchState.On
    );
    setTorchOn(!torchOn);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(3px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
      }}
    >
      {/* Top Title */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          color: "white",
          position: "relative",
          marginBottom: "10px",
        }}
      >
        <h2 style={{ margin: 0 }}>Scan Barcode</h2>
        <p style={{ margin: 0, marginTop: "5px", opacity: 0.8 }}>
          Adjust phone-object distance for better focus
        </p>

        {/* Close */}
        <button
          onClick={() => {
            onClose();
          }}
          style={{
            position: "absolute",
            right: "20px",
            top: "0px",
            background: "transparent",
            border: "none",
            fontSize: "26px",
            color: "white",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Scanner Box */}
      <div
        style={{
          height: "380px",
          width: "85%",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          border: "3px solid rgba(255,255,255,0.3)",
        }}
      >
        <div
          id="scan-view-box"
          style={{ height: "100%", width: "100%", position: "absolute" }}
        />
      </div>

      {/* Bottom UI */}
      <div
        style={{
          display: "flex",
          width: "80%",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        {/* Zoom (placeholder) */}
        <Button variant="contained">1x</Button>

        {/* Mode Switch */}
        <div
          style={{
            background: "white",
            padding: "6px 20px",
            borderRadius: "30px",
            display: "flex",
            gap: "20px",
            fontWeight: 600,
          }}
        >
          <span
            onClick={() => setScanType(SCAN_TYPE.AUTO)}
            style={{
              cursor: "pointer",
              color: scanType === SCAN_TYPE.AUTO ? "#1976d2" : "#555",
            }}
          >
            Auto
          </span>
          <span
            onClick={() => setScanType(SCAN_TYPE.MULTI)}
            style={{
              cursor: "pointer",
              color: scanType === SCAN_TYPE.MULTI ? "#1976d2" : "#555",
            }}
          >
            Multi
          </span>
        </div>

        {/* Torch */}
        <Button
          variant="contained"
          onClick={toggleTorch}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: torchOn ? "#FFD54F" : "white",
          }}
        >
          🔦
        </Button>
      </div>

      {/* Bottom Sheet for MULTI */}
      {scanResults.length > 0 && (
        <Paper
          elevation={4}
          style={{
            width: "100%",
            position: "absolute",
            bottom: 0,
            left: 0,
            padding: "20px",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            maxHeight: "40vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Scanned Barcodes</h3>
            <span
              style={{ color: "#1976d2", cursor: "pointer" }}
              onClick={() => setScanResults([])}
            >
              Reset
            </span>
          </div>

          <List>
            {scanResults.map((code, idx) => (
              <ListItem button key={idx} onClick={() => onClose(code)}>
                <ListItemText primary={code} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
