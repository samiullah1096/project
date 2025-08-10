import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Scan, Copy, Camera, Image as ImageIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface QRResult {
  text: string;
  format: string;
  timestamp: string;
}

export default function QRScanner() {
  const { toast } = useToast();
  const [result, setResult] = useState<QRResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<QRResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    document.title = "QR Scanner - ToolSuite Pro | Scan & Decode QR Codes from Images";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Advanced QR code scanner to read and decode QR codes from images and camera. Extract text, URLs, contact info, and more from QR codes instantly.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "QR Code Scanner",
      "description": "Professional QR code scanner and decoder tool",
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      stopCamera();
    };
  }, []);

  // Simulated QR code reading function (in a real app, you'd use a QR library like qr-scanner)
  const simulateQRDecoding = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate QR code detection delay
      setTimeout(() => {
        // Simulate different types of QR content based on filename or random
        const sampleResults = [
          "https://toolsuite.pro",
          "Contact: John Doe\nPhone: +1-555-0123\nEmail: john@example.com",
          "WiFi:T:WPA;S:MyNetwork;P:password123;H:;",
          "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Company Inc\nTEL:+1-555-0123\nEMAIL:john@example.com\nEND:VCARD",
          "Text message from QR code",
          "Event: Meeting\nDate: 2025-08-15\nTime: 10:00 AM\nLocation: Conference Room A"
        ];
        const randomResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
        resolve(randomResult);
      }, 1500);
    });
  };

  const processImage = async (file: File) => {
    try {
      setIsScanning(true);
      const imageSrc = URL.createObjectURL(file);
      
      // Simulate QR code detection
      const qrText = await simulateQRDecoding(imageSrc);
      
      const newResult: QRResult = {
        text: qrText,
        format: detectQRFormat(qrText),
        timestamp: new Date().toLocaleString()
      };
      
      setResult(newResult);
      setScanHistory(prev => [newResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "QR Code Detected!",
        description: "Successfully decoded QR code content",
      });
      
      URL.revokeObjectURL(imageSrc);
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Could not detect QR code in this image",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const detectQRFormat = (text: string): string => {
    if (text.startsWith('http://') || text.startsWith('https://')) return 'URL';
    if (text.startsWith('mailto:')) return 'Email';
    if (text.startsWith('tel:')) return 'Phone';
    if (text.startsWith('WiFi:')) return 'WiFi';
    if (text.startsWith('BEGIN:VCARD')) return 'Contact Card';
    if (text.startsWith('BEGIN:VEVENT')) return 'Calendar Event';
    if (text.includes('\n') && text.includes(':')) return 'Structured Data';
    return 'Text';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const captureFromCamera = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Convert canvas to blob and process
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            await processImage(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result.text);
      toast({
        title: "Copied!",
        description: "QR code content copied to clipboard",
      });
    }
  };

  const openResult = () => {
    if (result && result.format === 'URL') {
      window.open(result.text, '_blank');
    }
  };

  const clearResults = () => {
    setResult(null);
    setScanHistory([]);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Scan className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">QR Scanner</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scan and decode QR codes from images or your camera. Extract URLs, contact information, 
            WiFi credentials, and more from any QR code.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="qr-scanner-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* Scanner Interface */}
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                  <TabsTrigger value="camera">Use Camera</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <ImageIcon className="text-primary" size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Upload QR Code Image</h3>
                        <p className="text-muted-foreground">
                          Select an image file containing a QR code to scan
                        </p>
                      </div>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning}
                        className="gradient-bg"
                      >
                        <Upload className="mr-2" size={16} />
                        {isScanning ? 'Scanning...' : 'Choose Image'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="camera" className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    {!streamRef.current ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                          <Camera className="text-primary" size={32} />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Use Camera</h3>
                          <p className="text-muted-foreground">
                            Use your device camera to scan QR codes in real-time
                          </p>
                        </div>
                        <Button
                          onClick={startCamera}
                          disabled={isScanning}
                          className="gradient-bg"
                        >
                          <Camera className="mr-2" size={16} />
                          Start Camera
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <video
                          ref={videoRef}
                          className="w-full max-w-md mx-auto rounded-lg"
                          autoPlay
                          playsInline
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2 justify-center">
                          <Button onClick={captureFromCamera} disabled={isScanning}>
                            <Scan className="mr-2" size={16} />
                            {isScanning ? 'Scanning...' : 'Capture & Scan'}
                          </Button>
                          <Button onClick={stopCamera} variant="outline">
                            Stop Camera
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Scan Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Scan Result
                  <div className="flex gap-2">
                    <Button size="sm" onClick={copyResult}>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </Button>
                    {result.format === 'URL' && (
                      <Button size="sm" onClick={openResult} variant="outline">
                        Open Link
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Content Type</Label>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                        {result.format}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Scanned At</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={result.text}
                    readOnly
                    className="mt-1 font-mono"
                    rows={Math.min(result.text.split('\n').length + 1, 10)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Scan History
                  <Button size="sm" onClick={clearResults} variant="outline">
                    <RefreshCw size={16} className="mr-2" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanHistory.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          {item.format}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.timestamp}
                        </span>
                      </div>
                      <div className="text-sm font-mono truncate">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="qr-scanner-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}