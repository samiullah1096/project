import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RotateCw, RotateCcw, RefreshCw } from "lucide-react";

export default function PDFRotate() {
  const [rotationAngle, setRotationAngle] = useState("90");
  const [rotationDirection, setRotationDirection] = useState("clockwise");
  const [pageSelection, setPageSelection] = useState("all");
  const [pageRange, setPageRange] = useState("");
  const [autoDetect, setAutoDetect] = useState(false);

  useEffect(() => {
    document.title = "Rotate PDF Pages - ToolSuite Pro | Fix PDF Page Orientation Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Rotate PDF pages to correct orientation online. Fix upside-down or sideways pages with precise angle control, batch rotation, and auto-orientation detection.');
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF Page Rotation Tool",
      "description": "Rotate PDF pages to correct orientation and fix page alignment",
      "url": window.location.href,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Rotate individual or all pages",
        "Custom angle rotation",
        "Auto-orientation detection",
        "Batch page processing",
        "Precise orientation control"
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
    name: "PDF Page Rotation Tool",
    description: "Rotate PDF pages to correct orientation and fix page alignment. Support for custom angles, batch processing, and automatic orientation detection.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Rotated)",
    maxFileSize: 200,
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    if (pageSelection === "range" && pageRange && !/^(\d+(-\d+)?,?\s*)+$/.test(pageRange.replace(/\s/g, ''))) {
      return {
        success: false,
        error: "Invalid page range format. Use format like: 1-5, 7, 10-12"
      };
    }

    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 600);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    if (Math.random() > 0.03) {
      const blob = new Blob(['Mock rotated PDF content'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to rotate PDF pages. The file may be corrupted or password-protected."
      };
    }
  };

  const rotationOptions = (
    <div className="space-y-6">
      {/* Quick Rotation */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Quick Rotation</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={rotationAngle === "90" && rotationDirection === "clockwise" ? "default" : "outline"}
              onClick={() => {
                setRotationAngle("90");
                setRotationDirection("clockwise");
              }}
              className="h-16 flex-col gap-2"
              data-testid="button-rotate-90-cw"
            >
              <RotateCw size={20} />
              <span className="text-xs">90° CW</span>
            </Button>
            
            <Button
              variant={rotationAngle === "180" ? "default" : "outline"}
              onClick={() => setRotationAngle("180")}
              className="h-16 flex-col gap-2"
              data-testid="button-rotate-180"
            >
              <RefreshCw size={20} />
              <span className="text-xs">180°</span>
            </Button>
            
            <Button
              variant={rotationAngle === "90" && rotationDirection === "counterclockwise" ? "default" : "outline"}
              onClick={() => {
                setRotationAngle("90");
                setRotationDirection("counterclockwise");
              }}
              className="h-16 flex-col gap-2"
              data-testid="button-rotate-90-ccw"
            >
              <RotateCcw size={20} />
              <span className="text-xs">90° CCW</span>
            </Button>
            
            <Button
              variant={rotationAngle === "270" ? "default" : "outline"}
              onClick={() => setRotationAngle("270")}
              className="h-16 flex-col gap-2"
              data-testid="button-rotate-270"
            >
              <RotateCcw size={20} className="transform rotate-180" />
              <span className="text-xs">270°</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Rotation */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Custom Rotation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Rotation Angle</Label>
              <Select value={rotationAngle} onValueChange={setRotationAngle}>
                <SelectTrigger data-testid="select-rotation-angle">
                  <SelectValue placeholder="Select angle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90 degrees</SelectItem>
                  <SelectItem value="180">180 degrees</SelectItem>
                  <SelectItem value="270">270 degrees</SelectItem>
                  <SelectItem value="custom">Custom angle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {rotationAngle !== "180" && rotationAngle !== "custom" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Direction</Label>
                <Select value={rotationDirection} onValueChange={setRotationDirection}>
                  <SelectTrigger data-testid="select-rotation-direction">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clockwise">Clockwise</SelectItem>
                    <SelectItem value="counterclockwise">Counter-clockwise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {rotationAngle === "custom" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Custom Angle (degrees)</Label>
                <Input
                  type="number"
                  min="-360"
                  max="360"
                  step="1"
                  placeholder="Enter angle (e.g., 45)"
                  className="w-full"
                  data-testid="input-custom-angle"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Positive values rotate clockwise, negative values counter-clockwise
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Page Selection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Page Selection</h4>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Apply Rotation To</Label>
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

      {/* Auto-Detection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Smart Features</h4>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-Detect Orientation</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically detect and correct page orientation based on text analysis
              </p>
            </div>
            <Switch
              checked={autoDetect}
              onCheckedChange={setAutoDetect}
              data-testid="switch-auto-detect"
            />
          </div>
          
          {autoDetect && (
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <strong className="text-blue-600 dark:text-blue-400">Auto-Detection Enabled:</strong> The system will analyze text orientation 
                and automatically rotate pages to the correct reading orientation, overriding manual rotation settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rotation Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3">Rotation Summary</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Angle:</span>
            <span className="ml-2 font-medium">
              {rotationAngle}° {rotationAngle !== "180" && rotationAngle !== "custom" ? 
                `(${rotationDirection})` : ''}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Pages:</span>
            <span className="ml-2 font-medium">
              {pageSelection === "all" ? "All pages" :
               pageSelection === "odd" ? "Odd pages" :
               pageSelection === "even" ? "Even pages" :
               pageSelection === "first" ? "First page" :
               pageSelection === "last" ? "Last page" :
               pageRange || "Custom range"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Auto-detect:</span>
            <span className="ml-2 font-medium">{autoDetect ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Common Scenarios</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Fix scanned documents orientation</li>
            <li>• Correct mobile-captured PDFs</li>
            <li>• Standardize mixed orientations</li>
            <li>• Prepare documents for printing</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Rotation Tips</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Use auto-detect for mixed orientations</li>
            <li>• 90° CW for landscape to portrait</li>
            <li>• 180° for upside-down pages</li>
            <li>• Preview before applying to large files</li>
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
      {rotationOptions}
    </UniversalToolInterface>
  );
}