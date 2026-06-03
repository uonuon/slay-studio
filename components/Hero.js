"use client";
import { USE_FB } from "@/lib/firebase";

export default function Hero({ subtitle }) {
  return (
    <div className="hero" style={subtitle ? { padding: "26px 4px 6px" } : undefined}>
      <div className="logo" style={subtitle ? { fontSize: 34 } : undefined}>slay studio</div>
      {subtitle ? (
        <div className="loc">{subtitle}</div>
      ) : (
        <>
          <div className="tag">where your hair eats</div>
          <div className="loc">braids · fifth settlement</div>
          <div className={"modepill" + (USE_FB ? "" : " demo")}>
            <span className="dot" />
            {USE_FB ? "live · slay-studio.com" : "demo · this device"}
          </div>
        </>
      )}
    </div>
  );
}
