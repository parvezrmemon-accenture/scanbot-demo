import React, { useState } from "react";
import CustomScanner from "./components/CustomScanner";
import ScanditScanner from "./components/ScanditScanner";
import ScanditScannerBeauty from "./components/ScanditScannerBeauty";

export default function App() {
  const [open, setOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      {!open && (
        <>
          <button onClick={() => setOpen(true)}>Open Scanner</button>
          {/* add barcode input */}
          <input type="text" value={scannedResult ?? ""} />
          {scannedResult && <pre>{JSON.stringify(scannedResult, null, 2)}</pre>}
        </>
      )}

      {open && (
        <ScanditScannerBeauty
          onClose={(result) => {
            if (result) setScannedResult(result);
            setOpen(false);
          }}
          setScannedResult={setScannedResult}
        />
      )}
    </div>
  );
}
