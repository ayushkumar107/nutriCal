import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { scoreFood } from '../utils/foodScore';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Webcam from 'react-webcam';
import { Camera, ScanBarcode, Image as ImageIcon, Loader2, CheckCircle, RefreshCcw, BarChart3, Flame, Beef, Wheat, Droplet, AlertTriangle, XCircle } from 'lucide-react';

const Scanner = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('barcode'); // 'barcode' or 'image'
  const [barcode, setBarcode] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [imageCameraActive, setImageCameraActive] = useState(false);
  
  const scannerRef = useRef(null);
  const webcamRef = useRef(null);

  const handleSaveToLog = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await axios.post('meals/log', {
        productName: result.productName,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        aiEstimate: result.aiEstimate || false,
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save meal to daily log.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Clean up scanner on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startCameraScanner = () => {
    setCameraActive(true);
    setError('');
    // Initialize scanner after state update gives time for the div to mount
    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: {width: 300, height: 150},
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE
          ]
        },
        /* verbose= */ false
      );
      scannerRef.current.render(
        (decodedText) => {
          // Success callback
          setBarcode(decodedText);
          setCameraActive(false);
          scannerRef.current.clear();
          fetchBarcodeData(decodedText);
        },
        (errorMessage) => {
          // Continuous scanning failure (ignore to avoid spamming console)
        }
      );
    }, 100);
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setCameraActive(false);
  };

  const fetchBarcodeData = async (code) => {
    if (!code || code.trim() === '') {
      setError('Error: Barcode is missing or not detected. Please try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.get(`food/barcode/${code}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch food details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    fetchBarcodeData(barcode);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please provide an image.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    
    try {
      let base64Data = imageFile.data; // if captured from react-webcam

      // if uploaded from file picker
      if (!base64Data) {
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const res = await axios.post('food/analyze-image', { imageBase64: base64Data });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze image with AI');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;



  return (
    <div className="main-content">
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Food Scanner</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <button 
          className="btn" 
          onClick={() => {
            setActiveTab('barcode');
            setImageCameraActive(false);
            stopCameraScanner();
          }} 
          style={{ background: activeTab === 'barcode' ? 'var(--accent-primary)' : 'var(--bg-card)', color: activeTab === 'barcode' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ScanBarcode size={16} /> Barcode Scanner
        </button>
        <button 
          className="btn" 
          onClick={() => {
            setActiveTab('image');
            stopCameraScanner();
          }}
          style={{ background: activeTab === 'image' ? 'var(--accent-primary)' : 'var(--bg-card)', color: activeTab === 'image' ? 'white' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ImageIcon size={16} /> Image AI
        </button>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
        
        {activeTab === 'barcode' ? (
          <div>
            {!cameraActive ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <button onClick={startCameraScanner} className="btn" style={{ background: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Camera size={16} /> Scan Barcode via Camera
                </button>
                
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', lineHeight: '0.1em', margin: '10px 0 20px' }}>
                   <span style={{ background: 'var(--bg-card)', padding: '0 10px' }}>OR</span>
                </div>

                <form onSubmit={handleBarcodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label htmlFor="barcode" style={{ color: 'var(--text-secondary)' }}>Enter Barcode Manually</label>
                  <input 
                    type="text" 
                    id="barcode" 
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                    placeholder="e.g. 737628064502"
                  />
                  <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search Barcode'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div id="reader" style={{ width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#fff' }}></div>
                <button onClick={stopCameraScanner} className="btn" style={{ background: 'var(--accent-danger)' }}>
                  Cancel Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!imageCameraActive ? (
              <form onSubmit={handleImageUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ color: 'var(--text-secondary)' }}>Upload Food Image or Use Camera</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div 
                    onClick={() => { setImageCameraActive(true); setImageFile(null); setError(''); }}
                    style={{ position: 'relative', flex: 1, border: '2px dashed var(--border-color)', padding: '1rem', textAlign: 'center', borderRadius: '1rem', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <span style={{ marginBottom: '0.5rem' }}><Camera size={32} color="var(--text-secondary)" /></span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Live Camera</span>
                  </div>
                  <div style={{ position: 'relative', flex: 1, border: '2px dashed var(--border-color)', padding: '1rem', textAlign: 'center', borderRadius: '1rem', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        setImageFile(e.target.files[0]);
                        setError('');
                      }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{ marginBottom: '0.5rem' }}><ImageIcon size={32} color="var(--text-secondary)" /></span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>From Gallery</span>
                  </div>
                </div>
                {imageFile && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Selected: {imageFile.name || 'Captured Photo'}</p>}
                <button type="submit" className="btn" disabled={isLoading}>
                  {isLoading ? 'Analyzing AI...' : 'Analyze Image'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#000', position: 'relative' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn" 
                    onClick={() => {
                      const imageSrc = webcamRef.current.getScreenshot();
                      if(imageSrc) {
                        setImageFile({ name: 'Captured_Photo.jpg', data: imageSrc });
                        setImageCameraActive(false);
                      }
                    }} 
                    style={{ flex: 1, background: 'var(--accent-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Camera size={16} /> Snap Photo
                  </button>
                  <button onClick={() => setImageCameraActive(false)} className="btn" style={{ flex: 1, background: 'var(--accent-danger)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1.5rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem' }}>
            {result.image && <img src={result.image} alt={result.productName} style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }} />}
            <h3 style={{ color: 'var(--text-accent)' }}>{result.productName}</h3>
            {result.aiEstimate && <span style={{ fontSize: '0.75rem', background: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>AI Estimate</span>}

            {/* Food Score Badge */}
            {(() => {
              const score = scoreFood(result.calories, result.protein, user.goal);
              return (
                <div className="food-score-badge" style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: score.bg,
                  border: `2px solid ${score.border}`,
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    filter: `drop-shadow(0 0 8px ${score.color})`,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                  }}>
                    {score.grade === 'GOOD' ? <CheckCircle size={40} color={score.color} /> : 
                     score.grade === 'MODERATE' ? <AlertTriangle size={40} color={score.color} /> : 
                     <XCircle size={40} color={score.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.15rem', color: score.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {score.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {score.reason}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: score.color,
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '2rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}>
                    {user.goal}
                  </div>
                </div>
              );
            })()}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
              <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calories</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Flame size={20} /> {result.calories}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>kcal</div>
              </div>
              <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protein</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Beef size={20} /> {result.protein}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>grams</div>
              </div>
              <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carbs</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Wheat size={20} /> {result.carbs}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>grams</div>
              </div>
              <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fats</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Droplet size={20} /> {result.fats}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>grams</div>
              </div>
            </div>

            {/* Save to Daily Log */}
            {!saved ? (
              <button
                onClick={handleSaveToLog}
                className="btn"
                disabled={saving}
                style={{
                  marginTop: '1.5rem',
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {saving ? <><Loader2 size={16} /> Saving...</> : <><CheckCircle size={16} /> Save to Daily Log</>}
              </button>
            ) : (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.15)', 
                  border: '1px solid var(--accent-success)', 
                  color: '#86efac', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle size={16} /> Meal saved to your daily log!
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to="/dashboard" className="btn" style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <BarChart3 size={16} /> View Dashboard
                  </Link>
                  <button
                    onClick={() => { setResult(null); setSaved(false); setError(''); setBarcode(''); setImageFile(null); }}
                    className="btn"
                    style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RefreshCcw size={16} /> Scan Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Scanner;
