"use client";
// components/tickets/TicketQRCode.tsx
// Drop this component into your ticket display page.
// Install: npm install qrcode.react
//
// Usage:
//   <TicketQRCode ticketToken="tk_abc123..." eventTitle="Monaco GP" />

import { QRCodeSVG } from "qrcode.react";
import { useState }  from "react";
import { Download, ZoomIn, X } from "lucide-react";

interface Props {
  ticketToken: string;
  eventTitle:  string;
  bookingRef?: string;
}

export default function TicketQRCode({ ticketToken, eventTitle, bookingRef }: Props) {
  const [enlarged, setEnlarged] = useState(false);

  // The QR encodes a verify URL — scannable by any QR reader
  const verifyUrl = `https://nenetickets.co.ke/verify/${ticketToken}`;

  return (
    <>
      {/* Compact QR card */}
      <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 w-full max-w-[200px] mx-auto">
        <QRCodeSVG
          value={verifyUrl}
          size={150}
          bgColor="#ffffff"
          fgColor="#0a0a0a"
          level="H"          // High error correction — works even if partly obscured
          includeMargin={false}
          imageSettings={{
            src: "/icons/icon-32x32.png",
            height: 24,
            width:  24,
            excavate: true,
          }}
        />
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-800 leading-tight">{eventTitle}</p>
          {bookingRef && (
            <p className="text-[9px] text-gray-400 font-mono mt-0.5">{bookingRef}</p>
          )}
        </div>
        <button
          onClick={() => setEnlarged(true)}
          className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-600 font-medium"
        >
          <ZoomIn className="w-3 h-3" />
          Enlarge
        </button>
      </div>

      {/* Fullscreen modal for easy scanning */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setEnlarged(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 flex flex-col items-center gap-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Scan to verify</p>
              <button
                onClick={() => setEnlarged(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <QRCodeSVG
              value={verifyUrl}
              size={260}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/icons/icon-32x32.png",
                height: 32,
                width:  32,
                excavate: true,
              }}
            />

            <div className="text-center space-y-0.5">
              <p className="text-sm font-bold text-gray-800">{eventTitle}</p>
              {bookingRef && (
                <p className="text-xs text-gray-400 font-mono">{bookingRef}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Show this to the organiser at the entrance
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
