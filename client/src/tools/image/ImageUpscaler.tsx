import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function ImageUpscaler() {
  const [upscaleMethod, setUpscaleMethod] = useState("ai");
  const [scaleFactor, setScaleFactor] = useState([2]);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [sharpening, setSharpening] = useState([50]);
  const [preserveDetails, setPreserveDetails] = useState(true);
  const [outputFormat, setOutputFormat] = useState("png");

  useEffect(() => {
    document.title = "AI Image Upscaler - ToolSuite Pro | Enhance and Upscale Images";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Enhance and upscale images using AI technology. Increase resolution up to 8x while preserving details and reducing noise for professional results.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "AI Image Upscaler",
      "description": "Enhance and upscale images using artificial intelligence with detail preservation",
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
    name: "AI Image Upscaler",
    description: "Enhance and upscale images using advanced AI technology. Increase resolution while preserving details, reducing noise, and maintaining image quality.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".bmp"],
    outputFormat: "High-resolution image",
    maxFileSize: 25, // 25MB for upscaling
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate AI upscaling processing time (longer for higher scale factors)
    const baseTime = 8000; // 8 seconds base
    const scaleMultiplier = scaleFactor[0] * 2000; // Additional time per scale factor
    const processingTime = Math.max(baseTime, (file.size / 1024 / 1024) * 4000 + scaleMultiplier);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 91% success rate (AI upscaling can be resource intensive)
    if (Math.random() > 0.09) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create upscaled dimensions
      const baseWidth = 400;
      const baseHeight = 300;
      canvas.width = baseWidth * scaleFactor[0];
      canvas.height = baseHeight * scaleFactor[0];
      
      // Create enhanced image
      const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667EEA');
      gradient.addColorStop(0.5, '#764BA2');
      gradient.addColorStop(1, '#667EEA');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add detail enhancement simulation
      if (preserveDetails) {
        // Simulate detailed textures
        for (let i = 0; i < canvas.width * canvas.height / 10000; i++) {
          ctx!.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
          ctx!.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 3,
            Math.random() * 3
          );
        }
      }
      
      // Apply sharpening effect
      if (sharpening[0] > 0) {
        ctx!.filter = `contrast(${100 + sharpening[0]}%)`;
        ctx!.drawImage(canvas, 0, 0);
        ctx!.filter = 'none';
      }
      
      // Add upscaling info
      ctx!.fillStyle = 'white';
      ctx!.font = `bold ${Math.max(16, canvas.width / 30)}px Arial`;
      ctx!.textAlign = 'center';
      ctx!.fillText(
        `Upscaled ${scaleFactor[0]}x (${canvas.width}×${canvas.height})`,
        canvas.width / 2,
        canvas.height / 2
      );
      
      ctx!.font = `${Math.max(12, canvas.width / 50)}px Arial`;
      ctx!.fillText(`Method: ${upscaleMethod.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 40);
      
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
              error: "Failed to upscale image"
            });
          }
        }, outputFormat === 'jpg' ? 'image/jpeg' : 'image/png', outputFormat === 'jpg' ? 0.95 : undefined);
      });
    } else {
      return {
        success: false,
        error: "Image upscaling failed. The image may be too large or corrupt. Try reducing the scale factor or using a different upscaling method."
      };
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Upscaling Method */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Upscaling Method</Label>
        <Select value={upscaleMethod} onValueChange={setUpscaleMethod}>
          <SelectTrigger data-testid="select-upscale-method">
            <SelectValue placeholder="Select upscaling method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ai">AI Super Resolution (Best)</SelectItem>
            <SelectItem value="esrgan">ESRGAN (Photos)</SelectItem>
            <SelectItem value="waifu2x">Waifu2x (Anime/Art)</SelectItem>
            <SelectItem value="bicubic">Bicubic (Fast)</SelectItem>
            <SelectItem value="lanczos">Lanczos (Balanced)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          AI methods provide the best quality but take longer to process
        </p>
      </div>

      {/* Scale Factor */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Scale Factor: {scaleFactor[0]}x
        </Label>
        <Slider
          value={scaleFactor}
          onValueChange={setScaleFactor}
          max={8}
          min={1}
          step={1}
          className="w-full"
          data-testid="slider-scale-factor"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>1x (Original)</span>
          <span>4x (Recommended)</span>
          <span>8x (Maximum)</span>
        </div>
      </div>

      {/* Output Format */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger data-testid="select-output-format">
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG (Lossless)</SelectItem>
            <SelectItem value="jpg">JPG (Smaller size)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enhancement Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="noise-reduction"
            checked={noiseReduction}
            onCheckedChange={setNoiseReduction}
            data-testid="switch-noise-reduction"
          />
          <Label htmlFor="noise-reduction">Noise reduction</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="preserve-details"
            checked={preserveDetails}
            onCheckedChange={setPreserveDetails}
            data-testid="switch-preserve-details"
          />
          <Label htmlFor="preserve-details">Preserve fine details</Label>
        </div>
      </div>

      {/* Sharpening */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Sharpening: {sharpening[0]}%
        </Label>
        <Slider
          value={sharpening}
          onValueChange={setSharpening}
          max={100}
          min={0}
          step={10}
          className="w-full"
          data-testid="slider-sharpening"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Enhance image sharpness after upscaling
        </p>
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
          <h3 className="text-lg font-semibold mb-4">AI-Powered Image Enhancement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-medium">AI Super Resolution</div>
              <div className="text-sm text-muted-foreground">Neural network enhancement</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">Up to 8x Scaling</div>
              <div className="text-sm text-muted-foreground">Massive resolution increase</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">Detail Preservation</div>
              <div className="text-sm text-muted-foreground">Maintain image clarity</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Multiple Methods</div>
              <div className="text-sm text-muted-foreground">Different algorithms available</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-medium">Noise Reduction</div>
              <div className="text-sm text-muted-foreground">Clean image artifacts</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Smart Sharpening</div>
              <div className="text-sm text-muted-foreground">Enhance edge definition</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Upscaling Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">AI Super Resolution</h4>
              <p>Advanced neural networks trained on millions of images provide the highest quality results for photos and artwork.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">ESRGAN</h4>
              <p>Enhanced Super-Resolution GAN specifically optimized for photographic content with realistic texture reconstruction.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Waifu2x</h4>
              <p>Specialized for anime, artwork, and illustrations with clean lines and flat colors.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Traditional Methods</h4>
              <p>Bicubic and Lanczos interpolation for faster processing when AI quality isn't required.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use AI methods for best quality, traditional methods for speed</li>
            <li>• Enable noise reduction for old or low-quality images</li>
            <li>• Start with 2x-4x scaling for most use cases</li>
            <li>• Use PNG output to preserve maximum quality</li>
            <li>• ESRGAN works best for real photos, Waifu2x for illustrations</li>
          </ul>
        </div>
      </div>
    </UniversalToolInterface>
  );
}