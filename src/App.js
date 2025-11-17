import React, { useState } from "react";
import CustomScanner from "./components/CustomScanner";

export default function App() {
  const [open, setOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      {!open && (
        <>
          <button onClick={() => setOpen(true)}>Open Scanner</button>
          {scannedResult && <pre>{JSON.stringify(scannedResult, null, 2)}</pre>}
        </>
      )}

      {open && (
        <CustomScanner
          onClose={(result) => {
            if (result) setScannedResult(result);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
