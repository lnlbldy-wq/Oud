import React, { useState, useEffect, useRef } from 'react';
import { Experience } from './components/Experience';
import { Wind, Info, Camera, CameraOff, AlertCircle, Play } from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [arMode, setArMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // AR Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isActive = true;

    const startCamera = async () => {
      if (arMode && hasStarted) {
        setCameraError(null);
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
             throw new Error("Browser API not supported");
          }

          // Try environment (rear) camera first
          let newStream;
          try {
            newStream = await navigator.mediaDevices.getUserMedia({
              video: { 
                facingMode: 'environment',
                // Relaxed constraints for better compatibility
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });
          } catch (e) {
            console.warn("Rear camera failed, trying fallback...", e);
            newStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });
          }
          
          if (isActive && videoRef.current) {
            stream = newStream;
            videoRef.current.srcObject = stream;
            // Play immediately
            videoRef.current.play().catch(e => console.error("Video play error:", e));
          } else {
             if (newStream) {
                newStream.getTracks().forEach(track => track.stop());
             }
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          if (isActive) {
             setCameraError("تعذر الوصول للكاميرا. يرجى التحقق من الصلاحيات.");
             setArMode(false); 
          }
        }
      }
    };

    if (arMode && hasStarted) {
      startCamera();
    } else {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (stream) {
         (stream as MediaStream).getTracks().forEach(t => t.stop());
      }
    }

    return () => {
      isActive = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [arMode, hasStarted]);

  const handleStart = () => {
      setHasStarted(true);
      setArMode(true);
  };

  // Landing Screen
  if (!hasStarted) {
      return (
          <div className="relative w-full h-[100dvh] bg-gray-900 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542456387-54876b50ba23?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
              <div className="relative z-10 max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-amber-500/30 shadow-2xl">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-400/50">
                      <Wind className="w-10 h-10 text-amber-400" />
                  </div>
                  <h1 className="text-4xl font-bold text-amber-400 mb-2 font-poetic">عبق العود</h1>
                  <p className="text-gray-200 mb-8 text-lg font-light">تجربة واقع معزز تفاعلية للمبخرة السعودية</p>
                  
                  <button 
                    onClick={handleStart}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 group"
                  >
                      <Play className="w-5 h-5 fill-current" />
                      <span>ابدأ التجربة</span>
                  </button>
                  <p className="text-gray-400 text-xs mt-4">يرجى السماح باستخدام الكاميرا لتعيش التجربة</p>
              </div>
          </div>
      );
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden text-right bg-gray-900" dir="rtl">
      
      {/* AR Camera Background (Layer 0) */}
      {arMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Overlay Tint (Layer 10) */}
      <div className={`absolute top-0 left-0 w-full h-full z-10 transition-colors duration-500 pointer-events-none ${arMode ? 'bg-black/5' : 'bg-gradient-to-b from-gray-900 to-black'}`} />

      {/* 3D Scene (Layer 20 - Handled in Experience component) */}
      <Experience />

      {/* UI Layer (Layer 30) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between h-[100dvh]">
        
        {/* Header */}
        <div className="w-full p-4 pt-8 md:p-6 flex justify-between items-start pointer-events-auto bg-gradient-to-b from-black/60 to-transparent">
          <div>
             <h1 className="text-2xl md:text-4xl font-bold text-amber-400 drop-shadow-md font-poetic">
               شريفة القحطاني
             </h1>
          </div>
          <div className="flex gap-2">
              <button 
              onClick={() => setArMode(!arMode)}
              className={`p-3 rounded-full backdrop-blur-md transition-colors border border-white/20 ${arMode ? 'bg-amber-500/80 text-white' : 'bg-white/10 text-gray-300'}`}
              title={arMode ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
              >
              {arMode ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </button>
              <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors border border-white/20"
              >
              <Info className="w-6 h-6 text-white" />
              </button>
          </div>
        </div>

        {/* Camera Error Message */}
        {cameraError && (
            <div className="w-full flex justify-center pointer-events-none mt-2">
                <div className="bg-red-500/80 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">{cameraError}</span>
                </div>
            </div>
        )}

        {/* Footer */}
        {/* Empty footer currently, but kept for layout spacing if needed later or just removed padding bottom if totally empty */}
        <div className="w-full p-6 md:p-12 flex flex-col items-center pointer-events-none">
            {/* Poetry section removed */}
        </div>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-amber-500/30 p-6 rounded-2xl max-w-md w-full relative shadow-2xl pointer-events-auto">
            <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
                ✕
            </button>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">عن التجربة</h2>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm">
              قم بتوجيه الكاميرا نحو سطح مستوٍ لترى المبخرة. يمكنك تدوير المبخرة بالسحب يميناً ويساراً.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;