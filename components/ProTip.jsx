'use client';

export default function ProTip({ text }) {
  if (!text) return null;

  return (
    <div className="protip-box" key={text}>
      {text}
    </div>
  );
}
