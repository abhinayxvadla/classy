import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

export const runtime = "edge";
export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#312E81",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #4338CA 0%, #312E81 50%, #1E1B4B 100%)",
          color: "#F7F6F2",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 100,
            height: 100,
            borderRadius: 28,
            backgroundColor: "#4F46E5",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 32,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}
        >
          C
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {APP_NAME}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#C7D2FE",
            maxWidth: 800,
            textAlign: "center",
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Run your classes from your AI. The AI-native classroom for modern tutors & students.
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            fontSize: 18,
            fontWeight: 600,
            color: "#E0E7FF",
          }}
        >
          <div
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            Claude · ChatGPT · Perplexity · Gemini
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
