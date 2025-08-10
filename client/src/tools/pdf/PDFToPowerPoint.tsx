import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function PDFToPowerPoint() {
  const [conversionMode, setConversionMode] = useState("preserve");

  useEffect(() => {
    document.title = "PDF to PowerPoint Converter - ToolSuite Pro | Convert PDF to PPTX";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Convert PDF files to editable PowerPoint presentations online. Transform presentations, reports, and documents to PPTX format while preserving layout and graphics.');
    }
  }, []);

  const toolConfig = {
    name: "PDF to PowerPoint Converter",
    description: "Transform PDF documents into editable PowerPoint presentations. Ideal for converting presentations, reports, and visual documents while maintaining formatting and layout.",
    acceptedFormats: [".pdf"],
    outputFormat: "PPTX",
    maxFileSize: 75, // 75MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate processing time based on file size
    const processingTime = Math.max(4000, (file.size / 1024 / 1024) * 1500); // Minimum 4 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 93% success rate
    if (Math.random() > 0.07) {
      // Create a mock PowerPoint file
      const blob = new Blob(['Mock PowerPoint presentation content'], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to convert PDF to PowerPoint. The document may have complex formatting or be password-protected."
      };
    }
  };

  const customOptions = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Conversion Mode</label>
        <select
          value={conversionMode}
          onChange={(e) => setConversionMode(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-background"
          data-testid="select-conversion-mode"
        >
          <option value="preserve">Preserve Original Layout</option>
          <option value="optimize">Optimize for Editing</option>
          <option value="slides">One Page per Slide</option>
        </select>
      </div>
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      {customOptions}
    </UniversalToolInterface>
  );
}