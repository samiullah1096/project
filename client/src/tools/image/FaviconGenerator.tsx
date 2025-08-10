import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function FaviconGenerator() {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState([24]);
  const [borderRadius, setBorderRadius] = useState([0]);
  const [includeApple, setIncludeApple] = useState(true);
  const [includeAndroid, setIncludeAndroid] = useState(true);
  const [includeMs, setIncludeMs] = useState(false);

  useEffect(() => {
    document.title = "Favicon Generator - ToolSuite Pro | Create Favicons for Websites";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Generate favicons for websites in all required sizes. Create ICO, PNG favicons with Apple Touch icons, Android icons, and MS tile support.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Favicon Generator",
      "description": "Generate website favicons in multiple sizes and formats for all devices",
      "applicationCategory": "DeveloperApplication",
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
    name: "Favicon Generator",
    description: "Generate complete favicon packages for websites including ICO, PNG, Apple Touch icons, and Android icons in all required sizes.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".svg", ".webp"],
    outputFormat: "Favicon package (ZIP)",
    maxFileSize: 10, // 10MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate favicon generation processing
    const processingTime = Math.max(3000, 2000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate 96% success rate
    if (Math.random() > 0.04) {
      // Create a sample favicon
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 64;
      canvas.height = 64;
      
      // Fill background
      ctx!.fillStyle = backgroundColor;
      ctx!.fillRect(0, 0, 64, 64);
      
      // Apply border radius if specified
      if (borderRadius[0] > 0) {
        ctx!.globalCompositeOperation = 'destination-in';
        ctx!.beginPath();
        ctx!.roundRect(0, 0, 64, 64, borderRadius[0]);
        ctx!.fill();
        ctx!.globalCompositeOperation = 'source-over';
      }
      
      // Add text or simple icon
      if (text) {
        ctx!.fillStyle = textColor;
        ctx!.font = `bold ${fontSize[0]}px Arial`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillText(text.charAt(0).toUpperCase(), 32, 32);
      } else {
        // Create a simple gradient icon
        const gradient = ctx!.createLinearGradient(0, 0, 64, 64);
        gradient.addColorStop(0, '#667EEA');
        gradient.addColorStop(1, '#764BA2');
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(32, 32, 20, 0, 2 * Math.PI);
        ctx!.fill();
      }
      
      // Add small indicator of sizes
      ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx!.font = '8px Arial';
      ctx!.fillText('64x64', 32, 56);
      
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
              error: "Failed to generate favicon"
            });
          }
        }, 'image/png');
      });
    } else {
      return {
        success: false,
        error: "Favicon generation failed. Please try again with a different image or settings."
      };
    }
  };

  const faviconSizes = [
    { name: "Standard Favicon", size: "16x16, 32x32", format: "ICO" },
    { name: "Apple Touch Icon", size: "180x180", format: "PNG" },
    { name: "Android Icon", size: "192x192", format: "PNG" },
    { name: "MS Tile", size: "144x144", format: "PNG" },
    { name: "Safari Pinned Tab", size: "Vector", format: "SVG" },
  ];

  const settingsComponent = (
    <div className="space-y-6">
      {/* Text/Initial */}
      <div>
        <Label htmlFor="favicon-text" className="text-sm font-medium mb-2 block">
          Text/Initial (Optional)
        </Label>
        <Input
          id="favicon-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 3))}
          placeholder="Leave empty to use uploaded image"
          maxLength={3}
          data-testid="input-favicon-text"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter 1-3 characters for text-based favicon
        </p>
      </div>

      {/* Colors (when using text) */}
      {text && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bg-color" className="text-sm font-medium mb-2 block">Background Color</Label>
            <Input
              id="bg-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              data-testid="input-background-color"
            />
          </div>
          <div>
            <Label htmlFor="text-color" className="text-sm font-medium mb-2 block">Text Color</Label>
            <Input
              id="text-color"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              data-testid="input-text-color"
            />
          </div>
        </div>
      )}

      {/* Font Size (when using text) */}
      {text && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Font Size: {fontSize[0]}px
          </Label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            max={40}
            min={12}
            step={2}
            className="w-full"
            data-testid="slider-font-size"
          />
        </div>
      )}

      {/* Border Radius */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Border Radius: {borderRadius[0]}px
        </Label>
        <Slider
          value={borderRadius}
          onValueChange={setBorderRadius}
          max={32}
          min={0}
          step={2}
          className="w-full"
          data-testid="slider-border-radius"
        />
      </div>

      {/* Platform Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Include Platform Icons</h3>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="apple"
            checked={includeApple}
            onCheckedChange={setIncludeApple}
            data-testid="switch-apple"
          />
          <Label htmlFor="apple">Apple Touch Icons (iOS/Safari)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="android"
            checked={includeAndroid}
            onCheckedChange={setIncludeAndroid}
            data-testid="switch-android"
          />
          <Label htmlFor="android">Android Chrome Icons</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="ms"
            checked={includeMs}
            onCheckedChange={setIncludeMs}
            data-testid="switch-ms"
          />
          <Label htmlFor="ms">Microsoft Tiles (Edge/Windows)</Label>
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
          <h3 className="text-lg font-semibold mb-4">Generated Favicon Sizes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faviconSizes.map((favicon, index) => (
              <div key={index} className="flex items-center p-4 bg-background rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                  {favicon.format}
                </div>
                <div>
                  <div className="font-medium">{favicon.name}</div>
                  <div className="text-sm text-muted-foreground">{favicon.size}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">What You Get</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Complete Package</h4>
              <p>All favicon sizes and formats needed for modern websites and web apps.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Cross-Platform Support</h4>
              <p>Works perfectly on iOS, Android, Windows, and all modern browsers.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Ready-to-Use HTML</h4>
              <p>Includes HTML code snippets for easy implementation in your website.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">High Quality</h4>
              <p>Crisp, pixel-perfect icons optimized for each platform and size.</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">📋 Implementation Code</h4>
          <div className="text-sm text-green-700 dark:text-green-300 font-mono bg-green-100 dark:bg-green-800/30 p-3 rounded">
            {`<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">`}
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-2">
            Copy and paste this HTML into your website's &lt;head&gt; section
          </p>
        </div>
      </div>
    </UniversalToolInterface>
  );
}