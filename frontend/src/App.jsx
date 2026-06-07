import { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:8000";

function ConfidenceBadge({ value }) {
  const color = value >= 60 ? "#10b981" : value >= 40 ? "#f59e0b" : "#ef4444";
  return <span className="conf-badge" style={{ color, borderColor: color }}>{value}%</span>;
}

function EmptyBill() {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="8" width="40" height="48" rx="4" stroke="#d1d5db" strokeWidth="2" fill="none"/>
          <line x1="20" y1="22" x2="44" y2="22" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="30" x2="44" y2="30" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="38" x2="36" y2="38" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="48" cy="48" r="10" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2"/>
          <line x1="48" y1="44" x2="48" y2="52" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <line x1="44" y1="48" x2="52" y2="48" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="empty-title">No bill generated yet</p>
      <p className="empty-sub">Upload one or more grocery images and click scan to detect products and generate a combined bill</p>
    </div>
  );
}

export default function App() {
  const [images, setImages] = useState([]);        // array of {file, preview}
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [confidence, setConfidence] = useState(60);
  const fileRef = useRef();

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (valid.length === 0) { setError("Please upload valid image files."); return; }
    const newImages = valid.map(f => ({ file: f, preview: URL.createObjectURL(f), id: Math.random() }));
    setImages(prev => [...prev, ...newImages]);
    setResult(null);
    setError(null);
  }, []);

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setResult(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleDetect = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: images.length });

    try {
      // Detect items from ALL images
      const allDetections = [];
      let combinedBillItems = {};

      for (let i = 0; i < images.length; i++) {
        setProgress({ current: i + 1, total: images.length });
        const formData = new FormData();
        formData.append("file", images[i].file);
        const res = await axios.post(
          `${API_URL}/detect?confidence=${confidence / 100}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // Collect all detections
        res.data.detected_items.forEach(item => {
          allDetections.push({ ...item, imageIndex: i + 1 });
        });

        // Combine bill items across all images
        res.data.bill.items.forEach(item => {
          if (combinedBillItems[item.name]) {
            combinedBillItems[item.name].quantity += item.quantity;
            combinedBillItems[item.name].amount += item.amount;
          } else {
            combinedBillItems[item.name] = { ...item };
          }
        });
      }

      // Recalculate totals from combined items
      const billItemsArray = Object.values(combinedBillItems);
      const subtotal = billItemsArray.reduce((sum, item) => sum + item.amount, 0);
      const gst = Math.round(subtotal * 0.05 * 100) / 100;
      const total = Math.round((subtotal + gst) * 100) / 100;

      setResult({
        success: true,
        bill_number: `#${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        images_scanned: images.length,
        items_detected: allDetections.length,
        detected_items: allDetections,
        bill: {
          items: billItemsArray,
          subtotal,
          gst,
          gst_rate: "5%",
          total
        }
      });

    } catch (err) {
      setError(err.response?.data?.detail || "Detection failed. Make sure the backend server is running.");
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="brand-name">RetailScan<span>AI</span></h1>
              <p className="brand-tagline">Intelligent Checkout System</p>
            </div>
          </div>
          <nav className="header-nav">
            <span className="nav-tag">YOLOv8</span>
            <span className="nav-tag">1,816 Products</span>
            <span className="nav-tag live"><span className="live-dot"></span>System Online</span>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="page-title">
          <h2>Scan & Checkout</h2>
          <p>Upload one or multiple grocery images — all items will be detected and combined into a single bill</p>
        </div>

        <div className="workspace">
          {/* Left Col */}
          <div className="left-col">

            {/* Upload Card */}
            <div className="card upload-card">
              <div className="card-header">
                <span className="card-label">Image Upload</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {images.length > 0 && (
                    <span className="count-pill">{images.length} image{images.length > 1 ? 's' : ''}</span>
                  )}
                  <span className="step-badge">Step 1</span>
                </div>
              </div>

              {/* Dropzone */}
              <div
                className={`dropzone ${dragOver ? "drag-active" : ""}`}
                onClick={() => fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                <div className="drop-content">
                  <div className="drop-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                      <polyline points="17,8 12,3 7,8" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="drop-title">{images.length > 0 ? "Add more images" : "Drop images here"}</p>
                  <p className="drop-sub">or <span className="drop-link">click to browse</span></p>
                  <p className="drop-formats">JPG · PNG · WEBP · HEIC · BMP · Unlimited images</p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="image-grid">
                  {images.map((img, i) => (
                    <div key={img.id} className="thumb-item">
                      <img src={img.preview} alt={`img-${i}`} className="thumb-img" />
                      <button
                        className="thumb-remove"
                        onClick={() => removeImage(img.id)}
                        title="Remove"
                      >×</button>
                      <span className="thumb-index">{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confidence */}
            <div className="card confidence-card">
              <div className="card-header">
                <span className="card-label">Detection Sensitivity</span>
                <span className="conf-value">{confidence}%</span>
              </div>
              <input
                type="range" min="20" max="80" value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="conf-slider"
              />
              <div className="conf-labels">
                <span>More detections</span>
                <span>Higher accuracy</span>
              </div>
            </div>

            {/* Actions */}
            <div className="actions">
              <button className="btn-scan" onClick={handleDetect} disabled={images.length === 0 || loading}>
                {loading ? (
                  <><span className="spin"></span>
                    Scanning {progress.current}/{progress.total}...</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Scan {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''}` : ''} & Generate Bill</>
                )}
              </button>
              {images.length > 0 && (
                <button className="btn-clear" onClick={handleReset}>Clear All</button>
              )}
            </div>

            {/* Progress Bar */}
            {loading && progress.total > 1 && (
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                <span className="progress-label">Processing image {progress.current} of {progress.total}</span>
              </div>
            )}

            {error && (
              <div className="error-alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Detected Items */}
            {result && result.detected_items?.length > 0 && (
              <div className="card detections-card">
                <div className="card-header">
                  <span className="card-label">All Detected Products</span>
                  <span className="count-pill">{result.items_detected} found</span>
                </div>
                <div className="detection-list">
                  {result.detected_items.slice(0, 10).map((item, i) => (
                    <div key={i} className="detection-row">
                      <div className="detection-index">{i + 1}</div>
                      <span className="detection-name">{item.name}</span>
                      {result.images_scanned > 1 && (
                        <span className="img-tag">img {item.imageIndex}</span>
                      )}
                      <ConfidenceBadge value={item.confidence} />
                    </div>
                  ))}
                  {result.detected_items.length > 10 && (
                    <p className="more-text">+{result.detected_items.length - 10} more items detected</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — Bill */}
          <div className="right-col">
            <div className="card bill-card">
              <div className="card-header">
                <span className="card-label">Generated Bill</span>
                <span className="step-badge">Step 2</span>
              </div>

              {!result ? <EmptyBill /> : (
                <div className="bill" id="printable-bill">
                  <div className="bill-store">
                    <div className="store-logo">🏪</div>
                    <div>
                      <h3 className="store-name">SMART RETAIL STORE</h3>
                      <p className="store-sub">AI-Powered Checkout</p>
                    </div>
                  </div>

                  <div className="bill-meta-row">
                    <div className="meta-item">
                      <span className="meta-label">Bill No.</span>
                      <span className="meta-value">{result.bill_number}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Date & Time</span>
                      <span className="meta-value">{result.date}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Images Scanned</span>
                      <span className="meta-value">{result.images_scanned}</span>
                    </div>
                  </div>

                  <div className="bill-divider" />

                  <div className="bill-table">
                    <div className="table-head">
                      <span>Product</span>
                      <span>Qty</span>
                      <span>Rate</span>
                      <span>Amount</span>
                    </div>
                    {result.bill.items.length === 0 ? (
                      <div className="no-items-row">No items detected. Try lowering the sensitivity slider.</div>
                    ) : (
                      result.bill.items.map((item, i) => (
                        <div key={i} className="table-row">
                          <span className="item-name" title={item.name}>{item.name}</span>
                          <span>{item.quantity}</span>
                          <span>₹{item.unit_price}</span>
                          <span className="item-amount">₹{item.amount}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bill-divider" />

                  <div className="bill-summary">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{result.bill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>GST ({result.bill.gst_rate})</span>
                      <span>₹{result.bill.gst.toFixed(2)}</span>
                    </div>
                    <div className="summary-total">
                      <span>Total Amount</span>
                      <span>₹{result.bill.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bill-footer">
                    <p>Thank you for shopping with us!</p>
                    <p className="powered-by">Powered by RetailScan AI • YOLOv8</p>
                  </div>
                </div>
              )}

              {result && (
                <button className="btn-print no-print" onClick={() => window.print()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2"/>
                    <rect x="6" y="14" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Print Bill
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>RetailScan AI &nbsp;·&nbsp; Built with YOLOv8 + FastAPI + React &nbsp;·&nbsp; 1,816 Product Categories</p>
      </footer>
    </div>
  );
}
