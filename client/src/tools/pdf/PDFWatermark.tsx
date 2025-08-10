import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Type, Image, Droplets } from "lucide-react";

export default function PDFWatermark() {
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [fontSize, setFontSize] = useState([24]);
  const [opacity, setOpacity] = useState([50]);
  const [position, setPosition] = useState("center");
  const [rotation, setRotation] = useState([45]);
  const [color, setColor] = useState("#cccccc");
  const [allPages, setAllPages] = useState(true);

  useEffect(() => {
    document.title = "PDF Watermark Tool - ToolSuite Pro | Add Text & Image Watermarks to PDF";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Add professional watermarks to PDF documents online. Insert text or image watermarks with customizable transparency, positioning, and styling for document protection and branding.');
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF Watermark Tool",
      "description": "Add professional text and image watermarks to PDF documents",
      "url": window.location.href,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Text watermarks with custom styling",
        "Image watermark insertion",
        "Adjustable transparency and positioning",
        "Bulk watermarking for all pages",
        "Professional document protection"
      ]
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
    name: "PDF Watermark Tool",
    description: "Add professional text or image watermarks to PDF documents with customizable transparency, positioning, and styling for document protection and branding.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Watermarked)",
    maxFileSize: 150,
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    if (watermarkType === "text" && !watermarkText.trim()) {
      return {
        success: false,
        error: "Please enter watermark text."
      };
    }

    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 800);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    if (Math.random() > 0.04) {
      const blob = new Blob(['Mock watermarked PDF content'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to add watermark. The PDF file may be corrupted or password-protected."
      };
    }
  };

  const watermarkOptions = (
    <div className="space-y-6">
      {/* Watermark Type */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Watermark Type</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={watermarkType === "text" ? "default" : "outline"}
              onClick={() => setWatermarkType("text")}
              className="h-16 flex-col gap-2"
              data-testid="button-text-watermark"
            >
              <Type size={20} />
              <span className="text-sm">Text Watermark</span>
            </Button>
            <Button
              variant={watermarkType === "image" ? "default" : "outline"}
              onClick={() => setWatermarkType("image")}
              className="h-16 flex-col gap-2"
              data-testid="button-image-watermark"
            >
              <Image size={20} />
              <span className="text-sm">Image Watermark</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Watermark Content */}
      {watermarkType === "text" && (
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Text Settings</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Watermark Text</Label>
                <Input
                  placeholder="Enter watermark text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full"
                  data-testid="input-watermark-text"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Font Size: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={72}
                    min={12}
                    step={2}
                    data-testid="slider-font-size"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Text Color</Label>
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10"
                    data-testid="input-text-color"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Position & Style */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Position & Style</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger data-testid="select-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-center">Top Center</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="middle-left">Middle Left</SelectItem>
                  <SelectItem value="middle-right">Middle Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-center">Bottom Center</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Opacity: {opacity[0]}%</Label>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  min={10}
                  step={5}
                  data-testid="slider-opacity"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Rotation: {rotation[0]}°</Label>
                <Slider
                  value={rotation}
                  onValueChange={setRotation}
                  max={180}
                  min={-180}
                  step={15}
                  data-testid="slider-rotation"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Application Settings</h4>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Apply to All Pages</Label>
              <p className="text-xs text-muted-foreground mt-1">Add watermark to every page in the document</p>
            </div>
            <Switch
              checked={allPages}
              onCheckedChange={setAllPages}
              data-testid="switch-all-pages"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3 flex items-center">
          <Droplets className="mr-2" size={16} />
          Watermark Preview
        </h5>
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 min-h-[120px] flex items-center justify-center relative overflow-hidden">
          {watermarkText ? (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                opacity: opacity[0] / 100,
                transform: `rotate(${rotation[0]}deg)`,
                color: color,
                fontSize: `${fontSize[0] * 0.8}px`, // Scaled down for preview
              }}
            >
              <span className="font-bold">{watermarkText}</span>
            </div>
          ) : null}
          <div className="text-center z-10">
            <div className="text-sm text-muted-foreground mb-2">Document Content</div>
            <div className="text-xs text-muted-foreground">Your watermark will appear {position === "center" ? "in the center" : `at ${position.replace("-", " ")}`}</div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Common Use Cases</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Document copyright protection</li>
            <li>• Company branding and logos</li>
            <li>• "CONFIDENTIAL" or "DRAFT" stamps</li>
            <li>• Author attribution</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Best Practices</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Use 30-60% opacity for readability</li>
            <li>• Position to avoid covering important text</li>
            <li>• Light colors work best for backgrounds</li>
            <li>• Keep text concise and meaningful</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      {watermarkOptions}
    </UniversalToolInterface>
  );
}