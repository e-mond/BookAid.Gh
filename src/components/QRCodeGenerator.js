import React from 'react';
import QRCode from 'qrcode.react';

/**
 * QRCodeGenerator component for generating QR codes for book collection receipts
 * Uses qrcode.react library for QR code generation
 */
const QRCodeGenerator = ({ 
  data, 
  size = 200,
  className = "",
  includeText = true,
  text = "Book Collection Receipt"
}) => {
  // Generate QR code data
  const qrData = JSON.stringify({
    type: 'book_collection',
    timestamp: new Date().toISOString(),
    data: data,
    receiptId: `REC-${Date.now()}`
  });

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode
          value={qrData}
          size={size}
          level="M"
          includeMargin={true}
          renderAs="svg"
          aria-label="QR code for book collection receipt"
        />
      </div>
      
      {/* QR Code Text */}
      {includeText && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {text}
          </p>
          <p className="text-xs text-gray-500">
            Scan to verify collection
          </p>
        </div>
      )}
      
      {/* Collection Details */}
      {data && (
        <div className="bg-gray-50 rounded-lg p-4 w-full max-w-sm">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Collection Details
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            {data.studentName && (
              <p><span className="font-medium">Student:</span> {data.studentName}</p>
            )}
            {data.books && (
              <p><span className="font-medium">Books:</span> {data.books}</p>
            )}
            {data.collectedAt && (
              <p><span className="font-medium">Date:</span> {new Date(data.collectedAt).toLocaleDateString()}</p>
            )}
            {data.collectedBy && (
              <p><span className="font-medium">Staff:</span> {data.collectedBy}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;