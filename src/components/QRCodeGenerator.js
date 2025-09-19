import React from 'react';
import QRCode from 'qrcode.react';
import { 
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon 
} from '@heroicons/react/24/outline';

const QRCodeGenerator = ({
  value,
  size = 256,
  level = 'M', // Error correction level: L, M, Q, H
  includeMargin = true,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  title = '',
  subtitle = '',
  showActions = true,
  className = ''
}) => {
  // Generate filename for download
  const generateFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `qr_code_${sanitizedTitle || 'receipt'}_${timestamp}.png`;
  };

  // Download QR code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById(`qr-code-${value.replace(/\W/g, '')}`);
    if (canvas) {
      const link = document.createElement('a');
      link.download = generateFilename();
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Print QR code
  const printQRCode = () => {
    const canvas = document.getElementById(`qr-code-${value.replace(/\W/g, '')}`);
    if (canvas) {
      const printWindow = window.open('', '_blank');
      const img = new Image();
      img.onload = function() {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${title}</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  font-family: Arial, sans-serif;
                }
                .qr-container {
                  text-align: center;
                  border: 2px solid #000;
                  padding: 20px;
                  margin: 20px;
                }
                .title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .subtitle {
                  font-size: 14px;
                  color: #666;
                  margin-bottom: 20px;
                }
                .qr-code {
                  margin: 20px 0;
                }
                .footer {
                  font-size: 12px;
                  color: #999;
                  margin-top: 20px;
                }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                ${title ? `<div class="title">${title}</div>` : ''}
                ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
                <div class="qr-code">
                  <img src="${canvas.toDataURL()}" alt="QR Code" />
                </div>
                <div class="footer">
                  Generated on ${new Date().toLocaleDateString()}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      };
      img.src = canvas.toDataURL();
    }
  };

  // Share QR code (if Web Share API is available)
  const shareQRCode = async () => {
    const canvas = document.getElementById(`qr-code-${value.replace(/\W/g, '')}`);
    if (canvas && navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], generateFilename(), { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: title || 'QR Code',
              text: subtitle || 'QR Code from FreeBooks Sekondi',
              files: [file]
            });
          }
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
        // Fallback to download
        downloadQRCode();
      }
    } else {
      // Fallback to download if sharing is not supported
      downloadQRCode();
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <QRCode
            id={`qr-code-${value.replace(/\W/g, '')}`}
            value={value}
            size={size}
            level={level}
            includeMargin={includeMargin}
            fgColor={fgColor}
            bgColor={bgColor}
            renderAs="canvas"
            aria-label={`QR code containing: ${value}`}
          />
        </div>
      </div>

      {/* QR Code value display */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded border">
          {value}
        </p>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={downloadQRCode}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            title="Download QR Code"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            Download
          </button>
          
          <button
            onClick={printQRCode}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            title="Print QR Code"
          >
            <PrinterIcon className="h-4 w-4 mr-1" />
            Print
          </button>
          
          <button
            onClick={shareQRCode}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            title="Share QR Code"
          >
            <ShareIcon className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>
      )}

      {/* Generation timestamp */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-400">
          Generated on {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default QRCodeGenerator;