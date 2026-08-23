import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  QrCode,
  ScanLine,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import type { EventItem } from '../../services/events';
import { verifyAndCheckInTicket, type StudioAttendee } from '../../services/studio';

interface QRScannerModalProps {
  activeEvent?: EventItem | null;
  onClose: () => void;
  onCheckInSuccess?: (attendee: StudioAttendee) => void;
}

export function QRScannerModal({
  activeEvent,
  onClose,
  onCheckInSuccess,
}: QRScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    attendee?: StudioAttendee;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError('Camera access is not supported on this browser.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (active) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          setCameraActive(true);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err: any) {
        if (active) {
          setCameraError(
            err.message?.includes('Permission')
              ? 'Camera permission was denied. You can still enter the Ticket ID manually.'
              : 'Unable to access camera. Please enter Ticket ID manually.'
          );
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleVerify = async (code: string) => {
    if (!code.trim() || verifying) return;
    setVerifying(true);
    setResult(null);

    const res = await verifyAndCheckInTicket(code, activeEvent?.id);
    setVerifying(false);
    setResult(res);

    if (res.success && res.attendee) {
      if (onCheckInSuccess) {
        onCheckInSuccess(res.attendee);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(manualCode);
  };

  const handleQuickDemoScan = (demoId: number) => {
    setManualCode(`DH-TKT-${demoId}`);
    handleVerify(`DH-TKT-${demoId}`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="qr-scanner-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="scanner-modal-head">
          <div>
            <span className="section-kicker">Front Desk Pass Verification</span>
            <h2>QR Ticket Scanner</h2>
            {activeEvent && (
              <p className="scanner-event-tag">
                Verifying for: <strong>{activeEvent.title}</strong> ({activeEvent.time})
              </p>
            )}
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>
        </div>

        <div className="scanner-body">
          {/* Camera Viewfinder */}
          <div className="scanner-viewfinder-container">
            {cameraActive ? (
              <div className="viewfinder-feed">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="camera-video-stream"
                />
                <div className="viewfinder-overlay">
                  <div className="viewfinder-corners" />
                  <div className="laser-line" />
                  <span className="viewfinder-hint">
                    Align attendee QR ticket in frame
                  </span>
                </div>
              </div>
            ) : (
              <div className="viewfinder-placeholder">
                <Camera size={44} />
                <strong>
                  {cameraError ? 'Camera Offline' : 'Initializing Camera...'}
                </strong>
                <p>
                  {cameraError ||
                    'Please grant camera permissions to scan paper & mobile QR passes.'}
                </p>
              </div>
            )}
          </div>

          {/* Verification Result Banner */}
          {result && (
            <div
              className={`scan-result-card ${
                result.success ? 'success' : 'error'
              }`}
            >
              <div className="result-icon">
                {result.success ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <XCircle size={24} />
                )}
              </div>
              <div className="result-copy">
                <strong>
                  {result.success ? 'Pass Verified!' : 'Invalid Ticket'}
                </strong>
                <p>{result.message}</p>
                {result.attendee && (
                  <div className="result-attendee-meta">
                    <span>
                      Dancer: <strong>{result.attendee.userName}</strong>
                    </span>
                    <span>
                      Ticket: <code>{result.attendee.qrCode || `DH-TKT-${result.attendee.bookingId}`}</code>
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="result-dismiss"
                onClick={() => setResult(null)}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Manual Entry Fallback */}
          <div className="manual-entry-section">
            <span className="manual-entry-label">
              <QrCode size={14} /> Or Enter Ticket ID Manually
            </span>
            <form onSubmit={handleManualSubmit} className="manual-entry-form">
              <input
                type="text"
                placeholder="e.g. DH-TKT-101 or booking number..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={verifying}
              />
              <button
                type="submit"
                className="primary-btn verify-btn"
                disabled={verifying || !manualCode.trim()}
              >
                {verifying ? 'Checking...' : 'Verify Ticket'}
              </button>
            </form>

            <div className="quick-test-passes">
              <span>Quick Test Passes:</span>
              <button
                type="button"
                className="quick-pass-chip"
                onClick={() => handleQuickDemoScan(101)}
              >
                Pass #101
              </button>
              <button
                type="button"
                className="quick-pass-chip"
                onClick={() => handleQuickDemoScan(102)}
              >
                Pass #102
              </button>
              <button
                type="button"
                className="quick-pass-chip"
                onClick={() => handleQuickDemoScan(9999)}
              >
                Pass #9999
              </button>
            </div>
          </div>
        </div>

        <div className="scanner-footer">
          <span>
            ⚡ Fast Front-Desk Mode: Checked-in status updates immediately in the live attendance roster.
          </span>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
}
