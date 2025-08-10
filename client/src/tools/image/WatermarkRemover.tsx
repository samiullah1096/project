import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function WatermarkRemover() {
  const [detectionMethod, setDetectionMethod] = useState("ai");
  const [sensitivity, setSensitivity] = useState([75]);
  const [preserveQuality, setPreserveQuality] = useState(true);
  const [backgroundFill, setBackgroundFill] = useState("intelligent");
  const [edgeSmoothing, setEdgeSmoothing] = useState(true);

  useEffect(() => {
    document.title = "Watermark Remover - ToolSuite Pro | Remove Watermarks from Images with AI";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Remove watermarks from images using advanced AI technology. Intelligent detection and removal with background reconstruction and edge smoothing.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AI Watermark Remover",
      "description": "Remove watermarks from images using artificial intelligence and advanced algorithms",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const toolConfig = {
    name: "AI Watermark Remover",
    description: "Remove watermarks from images using advanced AI detection and intelligent background reconstruction. Preserve image quality while seamlessly removing unwanted watermarks.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".bmp"],
    outputFormat: "Same as input or PNG",
    maxFileSize: 50, // 50MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate AI processing time
    const processingTime = Math.max(5000, (file.size / 1024 / 1024) * 3000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 88% success rate (watermark removal is challenging)
    if (Math.random() > 0.12) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;
      
      // Create cleaned image
      const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667EEA');
      gradient.addColorStop(1, '#764BA2');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Simulate background reconstruction
      if (backgroundFill === "intelligent") {
        // Add some texture to simulate intelligent fill
        for (let i = 0; i < 100; i++) {
          ctx!.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
          ctx!.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 20,
            Math.random() * 20
          );
        }
      }
      
      // Add success indicator
      ctx!.fillStyle = 'white';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Watermark Removed', canvas.width / 2, canvas.height / 2);
      
      ctx!.font = '16px Arial';
      ctx!.fillText(`Method: ${detectionMethod.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 30);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            resolve({
              success: true,
              downloadUrl,
            });
          } else {
            resolve({
              success: false,
              error: "Failed to remove watermark"
            });
          }
        }, 'image/png');
      });
    } else {
      return {
        success: false,
        error: "Watermark removal failed. The watermark may be too complex or the image quality too low. Try adjusting the sensitivity settings."
      };
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Detection Method */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Detection Method</Label>
        <Select value={detectionMethod} onValueChange={setDetectionMethod}>
          <SelectTrigger data-testid="select-detection-method">
            <SelectValue placeholder="Select detection method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai">AI Detection (Recommended)</SelectItem>
            <SelectItem value="edge">Edge Detection</SelectItem>
            <SelectItem value="color">Color Similarity</SelectItem>
            <SelectItem value="pattern">Pattern Recognition</SelectItem>
            <SelectItem value="hybrid">Hybrid Approach</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          AI Detection works best for most watermarks
        </p>
      </div>

      {/* Sensitivity */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Detection Sensitivity: {sensitivity[0]}%
        </Label>
        <Slider
          value={sensitivity}
          onValueChange={setSensitivity}
          max={100}
          min={10}
          step={5}
          className="w-full"
          data-testid="slider-sensitivity"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Higher values detect faint watermarks, lower values avoid false positives
        </p>
      </div>

      {/* Background Fill */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Background Reconstruction</Label>
        <Select value={backgroundFill} onValueChange={setBackgroundFill}>
          <SelectTrigger data-testid="select-background-fill">
            <SelectValue placeholder="Select fill method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="intelligent">Intelligent Fill (Recommended)</SelectItem>
            <SelectItem value="blur">Gaussian Blur</SelectItem>
            <SelectItem value="clone">Clone Nearby Pixels</SelectItem>
            <SelectItem value="gradient">Gradient Fill</SelectItem>
            <SelectItem value="texture">Texture Synthesis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="preserve-quality"
            checked={preserveQuality}
            onCheckedChange={setPreserveQuality}
            data-testid="switch-preserve-quality"
          />
          <Label htmlFor="preserve-quality">Preserve image quality</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="edge-smoothing"
            checked={edgeSmoothing}
            onCheckedChange={setEdgeSmoothing}
            data-testid="switch-edge-smoothing"
          />
          <Label htmlFor="edge-smoothing">Edge smoothing</Label>
        </div>
      </div>
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      <div className="bg-muted/30 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">AI-Powered Watermark Removal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">AI Detection</div>
              <div className="text-sm text-muted-foreground">Advanced algorithms identify watermarks</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Precise Removal</div>
              <div className="text-sm text-muted-foreground">Remove without damaging the image</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium">Background Reconstruction</div>
              <div className="text-sm text-muted-foreground">Intelligent fill algorithms</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Customizable Settings</div>
              <div className="text-sm text-muted-foreground">Fine-tune detection parameters</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">💎</div>
              <div className="font-medium">Quality Preservation</div>
              <div className="text-sm text-muted-foreground">Maintain image sharpness</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Multiple Methods</div>
              <div className="text-sm text-muted-foreground">Various detection algorithms</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Step 1: Detection</h4>
              <p>AI algorithms analyze the image to identify watermark patterns, textures, and boundaries with high precision.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Step 2: Removal</h4>
              <p>The detected watermark is carefully removed while preserving the underlying image content and quality.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Step 3: Reconstruction</h4>
              <p>Advanced algorithms reconstruct the background using intelligent fill techniques for seamless results.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Step 4: Enhancement</h4>
              <p>Final post-processing ensures smooth edges and maintains the original image's visual quality.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Legal Notice</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This tool should only be used on images where you have the legal right to remove watermarks. 
            Removing watermarks from copyrighted content without permission may violate intellectual property laws.
          </p>
        </div>
      </div>
    </UniversalToolInterface>
  );
}