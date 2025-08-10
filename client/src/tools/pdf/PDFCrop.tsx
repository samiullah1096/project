import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Crop, Maximize2, Square } from "lucide-react";

export default function PDFCrop() {
  const [cropPreset, setCropPreset] = useState("custom");
  const [marginTop, setMarginTop] = useState([10]);
  const [marginBottom, setMarginBottom] = useState([10]);
  const [marginLeft, setMarginLeft] = useState([10]);
  const [marginRight, setMarginRight] = useState([10]);
  const [pageSelection, setPageSelection] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [autoDetectMargins, setAutoDetectMargins] = useState(false);
  const [units, setUnits] = useState("mm");

  useEffect(() => {
    document.title = "Crop PDF Pages - ToolSuite Pro | Remove PDF Page Margins Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Crop PDF pages to remove unwanted margins and whitespace. Precise margin control, auto-detection, and batch processing for professional PDF formatting.');
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF Page Cropping Tool",
      "description": "Crop PDF pages to remove margins and unwanted whitespace",
      "url": window.location.href,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Precise margin control",
        "Auto-margin detection",
        "Batch page processing",
        "Multiple measurement units",
        "Custom crop presets"
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
    name: "PDF Page Cropping Tool",
    description: "Crop PDF pages to remove unwanted margins, whitespace, and borders with precise control over crop areas and automatic margin detection.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Cropped)",
    maxFileSize: 200,
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    if (pageSelection === "range" && pageRange && !/^(\d+(-\d+)?,?\s*)+$/.test(pageRange.replace(/\s/g, ''))) {
      return {
        success: false,
        error: "Invalid page range format. Use format like: 1-5, 7, 10-12"
      };
    }

    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 1000);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    if (Math.random() > 0.04) {
      const blob = new Blob(['Mock cropped PDF content'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to crop PDF pages. The file may be corrupted or password-protected."
      };
    }
  };

  const presets = [
    { value: "custom", label: "Custom Margins" },
    { value: "minimal", label: "Minimal Crop (5mm)" },
    { value: "standard", label: "Standard Crop (10mm)" },
    { value: "aggressive", label: "Aggressive Crop (20mm)" },
    { value: "remove-all", label: "Remove All Margins" },
  ];

  const handlePresetChange = (preset: string) => {
    setCropPreset(preset);
    switch (preset) {
      case "minimal":
        setMarginTop([5]); setMarginBottom([5]); setMarginLeft([5]); setMarginRight([5]);
        break;
      case "standard":
        setMarginTop([10]); setMarginBottom([10]); setMarginLeft([10]); setMarginRight([10]);
        break;
      case "aggressive":
        setMarginTop([20]); setMarginBottom([20]); setMarginLeft([20]); setMarginRight([20]);
        break;
      case "remove-all":
        setMarginTop([0]); setMarginBottom([0]); setMarginLeft([0]); setMarginRight([0]);
        break;
    }
  };

  const cropOptions = (
    <div className="space-y-6">
      {/* Crop Presets */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Crop Presets</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant={cropPreset === preset.value ? "default" : "outline"}
                onClick={() => handlePresetChange(preset.value)}
                className="h-12 text-xs"
                data-testid={`button-preset-${preset.value}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Margins */}
      {cropPreset === "custom" && (
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Custom Margins</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Label className="text-sm font-medium">Units:</Label>
                <Select value={units} onValueChange={setUnits}>
                  <SelectTrigger className="w-32" data-testid="select-units">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mm">Millimeters</SelectItem>
                    <SelectItem value="in">Inches</SelectItem>
                    <SelectItem value="pt">Points</SelectItem>
                    <SelectItem value="px">Pixels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Top Margin: {marginTop[0]}{units}
                  </Label>
                  <Slider
                    value={marginTop}
                    onValueChange={setMarginTop}
                    max={50}
                    min={0}
                    step={1}
                    data-testid="slider-margin-top"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Bottom Margin: {marginBottom[0]}{units}
                  </Label>
                  <Slider
                    value={marginBottom}
                    onValueChange={setMarginBottom}
                    max={50}
                    min={0}
                    step={1}
                    data-testid="slider-margin-bottom"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Left Margin: {marginLeft[0]}{units}
                  </Label>
                  <Slider
                    value={marginLeft}
                    onValueChange={setMarginLeft}
                    max={50}
                    min={0}
                    step={1}
                    data-testid="slider-margin-left"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Right Margin: {marginRight[0]}{units}
                  </Label>
                  <Slider
                    value={marginRight}
                    onValueChange={setMarginRight}
                    max={50}
                    min={0}
                    step={1}
                    data-testid="slider-margin-right"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Detection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Smart Cropping</h4>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-Detect Margins</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically detect and remove excess whitespace around content
              </p>
            </div>
            <Switch
              checked={autoDetectMargins}
              onCheckedChange={setAutoDetectMargins}
              data-testid="switch-auto-detect"
            />
          </div>
          
          {autoDetectMargins && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-blue-600 dark:text-blue-400">Auto-Detection Enabled:</strong> The system will analyze each page 
                to find the optimal crop area, preserving all content while removing excess whitespace.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Selection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Page Selection</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Apply Cropping To</Label>
              <Select value={pageSelection} onValueChange={setPageSelection}>
                <SelectTrigger data-testid="select-page-selection">
                  <SelectValue placeholder="Select pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="odd">Odd Pages Only</SelectItem>
                  <SelectItem value="even">Even Pages Only</SelectItem>
                  <SelectItem value="first">First Page Only</SelectItem>
                  <SelectItem value="last">Last Page Only</SelectItem>
                  <SelectItem value="range">Custom Page Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {pageSelection === "range" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Range</Label>
                <Input
                  type="text"
                  placeholder="e.g., 1-5, 7, 10-12"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="w-full"
                  data-testid="input-page-range"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use commas to separate ranges: 1-5, 7, 10-12
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Crop Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3 flex items-center">
          <Crop className="mr-2" size={16} />
          Crop Preview
        </h5>
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 relative">
          {/* Visual representation of crop area */}
          <div 
            className="border-2 border-primary bg-primary/10 relative"
            style={{
              marginTop: `${marginTop[0] * 2}px`,
              marginBottom: `${marginBottom[0] * 2}px`,
              marginLeft: `${marginLeft[0] * 2}px`,
              marginRight: `${marginRight[0] * 2}px`,
              minHeight: '80px'
            }}
          >
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Content Area (After Crop)
            </div>
            {/* Margin indicators */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-xs text-primary font-medium">
              {marginTop[0]}{units}
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-primary font-medium">
              {marginBottom[0]}{units}
            </div>
            <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 text-xs text-primary font-medium rotate-90">
              {marginLeft[0]}{units}
            </div>
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 text-xs text-primary font-medium rotate-90">
              {marginRight[0]}{units}
            </div>
          </div>
        </div>
      </div>

      {/* Crop Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3">Crop Summary</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Preset:</span>
            <span className="ml-2 font-medium">{presets.find(p => p.value === cropPreset)?.label}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pages:</span>
            <span className="ml-2 font-medium">
              {pageSelection === "all" ? "All pages" :
               pageSelection === "range" ? (pageRange || "Custom range") :
               pageSelection.charAt(0).toUpperCase() + pageSelection.slice(1) + " pages"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Auto-detect:</span>
            <span className="ml-2 font-medium">{autoDetectMargins ? "Enabled" : "Disabled"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Margins:</span>
            <span className="ml-2 font-medium">
              {marginTop[0] + marginBottom[0] + marginLeft[0] + marginRight[0]}{units}
            </span>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Common Use Cases</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Remove scanning margins</li>
            <li>• Fit more content per page</li>
            <li>• Standardize document sizes</li>
            <li>• Remove watermark areas</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Cropping Tips</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Use auto-detect for consistent results</li>
            <li>• Preview before cropping large files</li>
            <li>• Keep some margin for readability</li>
            <li>• Test on a single page first</li>
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
      {cropOptions}
    </UniversalToolInterface>
  );
}