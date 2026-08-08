// src/pages/EMISchedular.jsx
import React from "react";

function EMISchedular() {
  return (
    <div style={{ width: "100%", height: "100vh", backgroundColor: "#0f172a" }}>
      <iframe
        src="/emi/index.html"
        title="EMI Scheduler"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          overflow: "hidden"
        }}
      />
    </div>
  );
}

export default EMISchedular;
