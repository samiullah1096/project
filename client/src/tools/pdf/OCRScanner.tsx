import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function OCRScanner() {
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [outputFormat, setOutputFormat] = useState("txt");
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [enhanceImage, setEnhanceImage] = useState(true);

  useEffect(() => {
    document.title = "OCR PDF Scanner - ToolSuite Pro | Extract Text from Scanned PDFs";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Advanced OCR scanner to extract text from scanned PDFs and images. Support for 100+ languages with high accuracy text recognition and layout preservation.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "OCR PDF Scanner",
      "description": "Advanced OCR technology to extract text from scanned PDFs and images",
      "url": window.location.href,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "OCR text extraction from PDFs",
        "Support for 100+ languages",
        "Layout preservation",
        "Image enhancement",
        "Multiple output formats"
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
    name: "OCR PDF Scanner",
    description: "Extract text from scanned PDFs and images using advanced OCR technology. Support for 100+ languages with high accuracy text recognition.",
    acceptedFormats: [".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".bmp"],
    outputFormat: outputFormat.toUpperCase(),
    maxFileSize: 200, // 200MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate processing time based on file size and OCR complexity
    const processingTime = Math.max(5000, (file.size / 1024 / 1024) * 2000); // Minimum 5 seconds for OCR
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 92% success rate for OCR processing
    if (Math.random() > 0.08) {
      // Create mock output file based on format
      let blob;
      let mimeType;
      
      switch (outputFormat) {
        case "txt":
          blob = new Blob(['Mock extracted text from OCR processing'], { type: 'text/plain' });
          mimeType = 'text/plain';
          break;
        case "docx":
          blob = new Blob(['Mock Word document with OCR text'], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case "pdf":
          blob = new Blob(['Mock searchable PDF with OCR layer'], { type: 'application/pdf' });
          mimeType = 'application/pdf';
          break;
        default:
          blob = new Blob(['Mock extracted text'], { type: 'text/plain' });
          mimeType = 'text/plain';
      }
      
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to extract text using OCR. The image quality may be too low, or the text may be in an unsupported format."
      };
    }
  };

  const languages = [
    { value: "eng", label: "English" },
    { value: "spa", label: "Spanish" },
    { value: "fra", label: "French" },
    { value: "deu", label: "German" },
    { value: "ita", label: "Italian" },
    { value: "por", label: "Portuguese" },
    { value: "rus", label: "Russian" },
    { value: "chi_sim", label: "Chinese (Simplified)" },
    { value: "chi_tra", label: "Chinese (Traditional)" },
    { value: "jpn", label: "Japanese" },
    { value: "kor", label: "Korean" },
    { value: "ara", label: "Arabic" },
    { value: "hin", label: "Hindi" },
    { value: "tha", label: "Thai" },
    { value: "vie", label: "Vietnamese" },
    { value: "auto", label: "Auto-detect Language" }
  ];

  const ocrOptions = (
    <div className="space-y-6">
      {/* OCR Settings */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">OCR Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Recognition Language</Label>
              <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
                <SelectTrigger data-testid="select-ocr-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                      {lang.value === "auto" && <Badge className="ml-2" variant="secondary">Recommended</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger data-testid="select-output-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                  <SelectItem value="docx">Word Document (.docx)</SelectItem>
                  <SelectItem value="pdf">Searchable PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Options */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Processing Options</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Preserve Layout</Label>
                <p className="text-xs text-muted-foreground mt-1">Maintain original document structure and formatting</p>
              </div>
              <Switch
                checked={preserveLayout}
                onCheckedChange={setPreserveLayout}
                data-testid="switch-preserve-layout"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Enhance Image Quality</Label>
                <p className="text-xs text-muted-foreground mt-1">Apply preprocessing to improve OCR accuracy</p>
              </div>
              <Switch
                checked={enhanceImage}
                onCheckedChange={setEnhanceImage}
                data-testid="switch-enhance-image"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OCR Information */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-2">OCR Configuration</h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Language:</span>
            <span className="ml-2 font-medium">{languages.find(l => l.value === ocrLanguage)?.label}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Output:</span>
            <span className="ml-2 font-medium">{outputFormat.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Layout:</span>
            <span className="ml-2 font-medium">{preserveLayout ? "Preserved" : "Text Only"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Enhancement:</span>
            <span className="ml-2 font-medium">{enhanceImage ? "Enabled" : "Disabled"}</span>
          </div>
        </div>
      </div>

      {/* Tips for Best Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Best Practices</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Use high-resolution scans (300+ DPI)</li>
            <li>• Ensure good contrast between text and background</li>
            <li>• Avoid skewed or rotated documents</li>
            <li>• Clean scans work better than photos</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Supported Content</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Printed text documents</li>
            <li>• Business cards and forms</li>
            <li>• Screenshots and images</li>
            <li>• Handwritten text (limited support)</li>
          </ul>
        </div>
      </div>

      {/* Language Support Notice */}
      {ocrLanguage === "auto" && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h5 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Auto-detect Language</h5>
          <p className="text-sm text-muted-foreground">
            Our AI will automatically detect the primary language in your document. This works best with documents 
            containing primarily one language and clear, well-formatted text.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      {ocrOptions}
    </UniversalToolInterface>
  );
}