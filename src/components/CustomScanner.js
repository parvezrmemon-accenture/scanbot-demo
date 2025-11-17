import React, { useEffect, useRef, useState } from "react";
import * as ScanbotSDK from "scanbot-web-sdk";
import { LICENSE_KEY, scanbotConfig } from "../scanbotConfig";

export default function CustomScanner({ onClose }) {
  const containerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [scanMode, setScanMode] = useState("auto"); // auto | multi

  useEffect(() => {
    async function initScanner() {
      const sdk = await ScanbotSDK.initialize({
        licenseKey: LICENSE_KEY,
        // enginePath: process.env.PUBLIC_URL + "/scanbot-sdk",
        enginePath: process.env.PUBLIC_URL + "/wasm",
        // enginePath: "/wasm/",
      });

      const cameraScanner = await sdk.createDocumentScanner({
        container: containerRef.current,
        onDocumentDetected: (result) => {
          console.log("Detected:", result);
          if (scanMode === "auto") {
            cameraScanner.stop();
            onClose(result);
          }
        },
        multiPage: scanMode === "multi",
      });

      setScanner(cameraScanner);
    }

    initScanner();

    return () => {
      if (scanner) scanner.dispose();
    };
  }, [scanMode]);

  return (
    <div style={{ position: "relative" }}>
      {/* Camera Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100vh",
          background: "#000",
        }}
      />

      {/* Custom UI Overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.6)",
          padding: "10px 15px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <label style={{ marginRight: 10 }}>
          <input
            type="radio"
            checked={scanMode === "auto"}
            onChange={() => setScanMode("auto")}
          />{" "}
          Auto
        </label>
        <label>
          <input
            type="radio"
            checked={scanMode === "multi"}
            onChange={() => setScanMode("multi")}
          />{" "}
          Multi
        </label>
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          scanner?.stop();
          onClose(null);
        }}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "red",
          color: "white",
          padding: "10px 12px",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Close
      </button>
    </div>
  );
}
