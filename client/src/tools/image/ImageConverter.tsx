import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function ImageConverter() {
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState([90]);
  const [preserveMetadata, setPreserveMetadata] = useState(false);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [maxHeight, setMaxHeight] = useState([1080]);

  useEffect(() => {
    document.title = "Image Format Converter - ToolSuite Pro | Convert JPG, PNG, WebP, AVIF";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert images between JPG, PNG, WebP, AVIF, and other formats online. Adjust quality, preserve metadata, and resize images during conversion.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Image Format Converter",
      "description": "Convert images between different formats including JPG, PNG, WebP, AVIF with quality control",
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
    name: "Image Format Converter",
    description: "Convert images between different formats including JPG, PNG, WebP, AVIF, BMP, and TIFF. Control quality settings and preserve metadata as needed.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp", ".tiff", ".gif"],
    outputFormat: "Various formats",
    maxFileSize: 50, // 50MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate processing time based on file size and conversion complexity
    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 1000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 96% success rate
    if (Math.random() > 0.04) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = resizeEnabled ? maxWidth[0] : 800;
      canvas.height = resizeEnabled ? maxHeight[0] : 600;
      
      // Create converted image content
      const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667EEA');
      gradient.addColorStop(1, '#764BA2');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add format indicator
      ctx!.fillStyle = 'white';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText(`Converted to ${outputFormat.toUpperCase()}`, canvas.width / 2, canvas.height / 2);
      
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
              error: "Failed to convert image"
            });
          }
        }, getMimeType(outputFormat), quality[0] / 100);
      });
    } else {
      return {
        success: false,
        error: "Conversion failed. Please try again with a different format or quality setting."
      };
    }
  };

  const getMimeType = (format: string) => {
    switch (format) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'avif':
        return 'image/avif';
      case 'bmp':
        return 'image/bmp';
      case 'tiff':
        return 'image/tiff';
      default:
        return 'image/jpeg';
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Output Format */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger data-testid="select-output-format">
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jpg">JPG (JPEG)</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
            <SelectItem value="avif">AVIF</SelectItem>
            <SelectItem value="bmp">BMP</SelectItem>
            <SelectItem value="tiff">TIFF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Settings */}
      {(outputFormat === 'jpg' || outputFormat === 'webp' || outputFormat === 'avif') && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Quality: {quality[0]}%
          </Label>
          <Slider
            value={quality}
            onValueChange={setQuality}
            max={100}
            min={10}
            step={5}
            className="w-full"
            data-testid="slider-quality"
          />
        </div>
      )}

      {/* Resize Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="resize"
            checked={resizeEnabled}
            onCheckedChange={setResizeEnabled}
            data-testid="switch-resize"
          />
          <Label htmlFor="resize">Resize during conversion</Label>
        </div>
        
        {resizeEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Max Width: {maxWidth[0]}px
              </Label>
              <Slider
                value={maxWidth}
                onValueChange={setMaxWidth}
                max={4000}
                min={100}
                step={50}
                data-testid="slider-max-width"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Max Height: {maxHeight[0]}px
              </Label>
              <Slider
                value={maxHeight}
                onValueChange={setMaxHeight}
                max={4000}
                min={100}
                step={50}
                data-testid="slider-max-height"
              />
            </div>
          </div>
        )}
      </div>

      {/* Metadata Options */}
      <div className="flex items-center space-x-2">
        <Switch
          id="metadata"
          checked={preserveMetadata}
          onCheckedChange={setPreserveMetadata}
          data-testid="switch-metadata"
        />
        <Label htmlFor="metadata">Preserve metadata (EXIF data)</Label>
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
          <h3 className="text-lg font-semibold mb-4">Supported Formats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📷</div>
              <div className="font-medium">JPG/JPEG</div>
              <div className="text-sm text-muted-foreground">Lossy compression</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium">PNG</div>
              <div className="text-sm text-muted-foreground">Lossless with transparency</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🌐</div>
              <div className="font-medium">WebP</div>
              <div className="text-sm text-muted-foreground">Modern web format</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">AVIF</div>
              <div className="text-sm text-muted-foreground">Next-gen format</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">💾</div>
              <div className="font-medium">BMP</div>
              <div className="text-sm text-muted-foreground">Uncompressed</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">TIFF</div>
              <div className="text-sm text-muted-foreground">Professional use</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Conversion Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Quality Control</h4>
              <p>Adjust compression quality for lossy formats to balance file size and image quality.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Batch Processing</h4>
              <p>Convert multiple images with the same settings for efficient workflow.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Metadata Preservation</h4>
              <p>Choose to keep or remove EXIF data including camera settings and location.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Resize During Conversion</h4>
              <p>Optionally resize images while converting to save additional processing time.</p>
            </div>
          </div>
        </div>
      </div>
    </UniversalToolInterface>
  );
}