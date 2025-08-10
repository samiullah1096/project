import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function PDFToImage() {
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [quality, setQuality] = useState([90]);
  const [resolution, setResolution] = useState("300");
  const [extractAllPages, setExtractAllPages] = useState(true);
  const [pageRange, setPageRange] = useState("");

  useEffect(() => {
    document.title = "PDF to Image Converter - ToolSuite Pro | Convert PDF to JPG, PNG, TIFF";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert PDF pages to high-quality images in JPG, PNG, TIFF formats. Extract all pages or specific ranges with customizable resolution and quality settings for professional results.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication", 
      "name": "PDF to Image Converter",
      "description": "Convert PDF pages to high-quality images in multiple formats",
      "url": window.location.href,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Convert PDF to JPG, PNG, TIFF",
        "High-resolution image output",
        "Batch processing all pages",
        "Custom page range extraction",
        "Quality and resolution control"
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
    name: "PDF to Image Converter",
    description: "Convert PDF pages to high-quality images in multiple formats. Extract all pages or specific ranges with customizable resolution and quality settings.",
    acceptedFormats: [".pdf"],
    outputFormat: outputFormat.toUpperCase(),
    maxFileSize: 100, // 100MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Validate page range if specified
    if (!extractAllPages && pageRange && !/^(\d+(-\d+)?,?\s*)+$/.test(pageRange.replace(/\s/g, ''))) {
      return {
        success: false,
        error: "Invalid page range format. Use format like: 1-5, 7, 10-12"
      };
    }

    // Simulate processing time based on file size and settings
    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 1000 * (quality[0] / 50)); // Quality affects processing time
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 96% success rate
    if (Math.random() > 0.04) {
      // Create a mock zip file with extracted images
      const blob = new Blob(['Mock ZIP file with PDF pages as images'], { type: 'application/zip' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to convert PDF to images. The file may be corrupted, password-protected, or contain unsupported elements."
      };
    }
  };

  const conversionOptions = (
    <div className="space-y-6">
      {/* Output Settings */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Output Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger data-testid="select-output-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG - Smaller file size</SelectItem>
                  <SelectItem value="png">PNG - Transparency support</SelectItem>
                  <SelectItem value="tiff">TIFF - Highest quality</SelectItem>
                  <SelectItem value="webp">WebP - Modern format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Resolution (DPI)</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger data-testid="select-resolution">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72">72 DPI - Web quality</SelectItem>
                  <SelectItem value="150">150 DPI - Standard quality</SelectItem>
                  <SelectItem value="300">300 DPI - Print quality</SelectItem>
                  <SelectItem value="600">600 DPI - High resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {outputFormat === "jpg" && (
            <div className="mt-4">
              <Label className="text-sm font-medium mb-2 block">
                Image Quality: {quality[0]}%
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
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Smaller Size</span>
                <span>Best Quality</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Selection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Page Selection</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Extract All Pages</Label>
                <p className="text-xs text-muted-foreground mt-1">Convert every page to individual images</p>
              </div>
              <Switch
                checked={extractAllPages}
                onCheckedChange={setExtractAllPages}
                data-testid="switch-all-pages"
              />
            </div>
            
            {!extractAllPages && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Range</Label>
                <input
                  type="text"
                  placeholder="e.g., 1-5, 7, 10-12"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  data-testid="input-page-range"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Specify pages to convert. Use commas to separate ranges.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Settings */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-2">Conversion Preview</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Format:</span>
            <span className="ml-2 font-medium">{outputFormat.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Resolution:</span>
            <span className="ml-2 font-medium">{resolution} DPI</span>
          </div>
          {outputFormat === "jpg" && (
            <div>
              <span className="text-muted-foreground">Quality:</span>
              <span className="ml-2 font-medium">{quality[0]}%</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Pages:</span>
            <span className="ml-2 font-medium">{extractAllPages ? "All" : pageRange || "Custom"}</span>
          </div>
        </div>
      </div>

      {/* Format Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Best Use Cases</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• <strong>JPG:</strong> Photos, web images, email</li>
            <li>• <strong>PNG:</strong> Screenshots, logos, transparency</li>
            <li>• <strong>TIFF:</strong> Professional printing</li>
            <li>• <strong>WebP:</strong> Modern web applications</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Quality Guidelines</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• <strong>72 DPI:</strong> Web display, social media</li>
            <li>• <strong>150 DPI:</strong> Standard documents</li>
            <li>• <strong>300 DPI:</strong> Professional printing</li>
            <li>• <strong>600 DPI:</strong> Archive quality</li>
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
      {conversionOptions}
    </UniversalToolInterface>
  );
}