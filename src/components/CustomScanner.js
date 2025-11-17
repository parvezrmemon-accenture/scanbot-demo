import React, { useEffect, useRef, useState } from "react";
import ScanbotSDK from "scanbot-web-sdk";

export default function CustomScanner({ onClose }) {
  const containerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [scanMode, setScanMode] = useState("auto"); // auto | multi
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const sdk = await ScanbotSDK.initialize({
          licenseKey: "<PUT-YOUR-LICENSE-HERE>",
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
      } catch (err) {
        console.error("Scanbot Init Error:", err);
      }
    }

    init();

    return () => {
      scanner?.dispose();
    };
  }, [scanMode]);

  /** Toggle Torch */
  const toggleTorch = async () => {
    if (!scanner) return;

    try {
      torchOn ? await scanner.disableTorch() : await scanner.enableTorch();
      setTorchOn(!torchOn);
    } catch (err) {
      console.warn("Torch not supported on this device", err);
    }
  };

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

      {/* 🔦 Torch button (top-right) */}
      <button
        onClick={toggleTorch}
        style={{
          position: "absolute",
          top: 20,
          right: 70,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {torchOn ? "Torch Off" : "Torch On"}
      </button>

      {/* ❌ Close button */}
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
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      {/* ⬇️ Bottom Center Auto / Multi controls */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "20px",
          zIndex: 99,
        }}
      >
        {/* Auto Button */}
        <button
          onClick={() => setScanMode("auto")}
          style={{
            padding: "12px 25px",
            borderRadius: "30px",
            border: "none",
            background:
              scanMode === "auto" ? "#00e676" : "rgba(255,255,255,0.4)",
            color: "#000",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          AUTO
        </button>

        {/* Multi Button */}
        <button
          onClick={() => setScanMode("multi")}
          style={{
            padding: "12px 25px",
            borderRadius: "30px",
            border: "none",
            background:
              scanMode === "multi" ? "#00e5ff" : "rgba(255,255,255,0.4)",
            color: "#000",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            backdropFilter: "blur(4px)",
          }}
        >
          MULTI
        </button>
      </div>
    </div>
  );
}
