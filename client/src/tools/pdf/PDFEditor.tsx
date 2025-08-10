import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Type, Image, PenTool, Highlighter } from "lucide-react";

export default function PDFEditor() {
  const [editMode, setEditMode] = useState("text");
  const [allowAnnotations, setAllowAnnotations] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);

  useEffect(() => {
    document.title = "PDF Editor Online - ToolSuite Pro | Edit Text, Images & Annotations in PDF";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional PDF editor to edit text, images, and annotations directly in PDF files. Add, modify, or delete content with advanced editing tools while preserving original formatting.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF Editor Online",
      "description": "Professional PDF editor to edit text, images, and annotations in PDF files",
      "url": window.location.href,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Edit PDF text directly",
        "Modify images in PDFs", 
        "Add annotations and comments",
        "Preserve original formatting",
        "Support for all PDF versions"
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
    name: "PDF Editor",
    description: "Edit text, images, and annotations directly in PDF documents. Professional PDF editing tools with advanced formatting preservation and annotation capabilities.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Edited)",
    maxFileSize: 150, // 150MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate processing time based on file size and editing complexity
    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 1000); // Minimum 3 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 94% success rate for PDF editing
    if (Math.random() > 0.06) {
      // Create a mock edited PDF
      const blob = new Blob(['Mock edited PDF content with modifications'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to edit PDF. The file may be password-protected, corrupted, or contain unsupported elements."
      };
    }
  };

  const editingOptions = (
    <div className="space-y-6">
      {/* Editing Mode Selection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4 text-lg">Editing Mode</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={editMode === "text" ? "default" : "outline"}
              onClick={() => setEditMode("text")}
              className="h-16 flex-col gap-2"
              data-testid="button-edit-text"
            >
              <Type size={20} />
              <span className="text-xs">Edit Text</span>
            </Button>
            <Button
              variant={editMode === "images" ? "default" : "outline"}
              onClick={() => setEditMode("images")}
              className="h-16 flex-col gap-2"
              data-testid="button-edit-images"
            >
              <Image size={20} />
              <span className="text-xs">Edit Images</span>
            </Button>
            <Button
              variant={editMode === "annotations" ? "default" : "outline"}
              onClick={() => setEditMode("annotations")}
              className="h-16 flex-col gap-2"
              data-testid="button-add-annotations"
            >
              <PenTool size={20} />
              <span className="text-xs">Annotate</span>
            </Button>
            <Button
              variant={editMode === "highlight" ? "default" : "outline"}
              onClick={() => setEditMode("highlight")}
              className="h-16 flex-col gap-2"
              data-testid="button-highlight"
            >
              <Highlighter size={20} />
              <span className="text-xs">Highlight</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Settings */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Edit Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Allow Annotations</Label>
                <p className="text-xs text-muted-foreground mt-1">Enable adding comments, notes, and markup</p>
              </div>
              <Switch
                checked={allowAnnotations}
                onCheckedChange={setAllowAnnotations}
                data-testid="switch-annotations"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Preserve Formatting</Label>
                <p className="text-xs text-muted-foreground mt-1">Maintain original document layout and styles</p>
              </div>
              <Switch
                checked={preserveFormatting}
                onCheckedChange={setPreserveFormatting}
                data-testid="switch-formatting"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode-specific instructions */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-2">
          {editMode === "text" && "Text Editing Mode"}
          {editMode === "images" && "Image Editing Mode"}
          {editMode === "annotations" && "Annotation Mode"}
          {editMode === "highlight" && "Highlight Mode"}
        </h5>
        <p className="text-sm text-muted-foreground">
          {editMode === "text" && "Modify existing text, change fonts, colors, and add new text content to your PDF."}
          {editMode === "images" && "Replace, resize, or add new images to your PDF document."}
          {editMode === "annotations" && "Add comments, sticky notes, stamps, and drawings to your PDF."}
          {editMode === "highlight" && "Highlight important text, add underlines, and create visual emphasis."}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Advanced Text Editing</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Font family and size adjustment</li>
            <li>• Text color and styling</li>
            <li>• Line spacing and alignment</li>
            <li>• OCR for scanned documents</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Image Management</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Image replacement and insertion</li>
            <li>• Resize and reposition images</li>
            <li>• Crop and rotate images</li>
            <li>• Transparency and effects</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Annotation Tools</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Comments and sticky notes</li>
            <li>• Shapes and drawing tools</li>
            <li>• Stamps and signatures</li>
            <li>• Collaborative reviews</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Format Preservation</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Original layout maintained</li>
            <li>• Interactive elements preserved</li>
            <li>• Hyperlinks and bookmarks</li>
            <li>• Form fields compatibility</li>
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
      {editingOptions}
    </UniversalToolInterface>
  );
}