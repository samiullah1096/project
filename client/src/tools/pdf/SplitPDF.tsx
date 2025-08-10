import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function SplitPDF() {
  const [splitMode, setSplitMode] = useState("pages");
  const [pageRange, setPageRange] = useState("");
  const [pagesPerFile, setPagesPerFile] = useState(1);

  useEffect(() => {
    document.title = "Split PDF - ToolSuite Pro | Split PDF into Multiple Files";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Split PDF files into separate pages or custom ranges online. Extract specific pages, split by page count, or create multiple documents from one PDF.');
    }
  }, []);

  const toolConfig = {
    name: "PDF Splitter",
    description: "Split PDF documents into separate files by pages, ranges, or bookmarks. Extract specific pages or divide large PDFs into smaller, manageable documents.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Multiple Files)",
    maxFileSize: 200, // 200MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Validate page range if specified
    if (splitMode === "range" && pageRange && !/^(\d+(-\d+)?,?)+$/.test(pageRange.replace(/\s/g, ''))) {
      return {
        success: false,
        error: "Invalid page range format. Use format like: 1-5, 7, 10-12"
      };
    }

    // Simulate processing time based on file size
    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 800); // Minimum 2 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 97% success rate
    if (Math.random() > 0.03) {
      // Create a mock zip file with split PDFs
      const blob = new Blob(['Mock ZIP file with split PDFs'], { type: 'application/zip' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to split PDF. The file may be corrupted or password-protected."
      };
    }
  };

  const customOptions = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Split Mode</label>
        <select
          value={splitMode}
          onChange={(e) => setSplitMode(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-background"
          data-testid="select-split-mode"
        >
          <option value="pages">Split into Individual Pages</option>
          <option value="count">Split by Page Count</option>
          <option value="range">Split by Page Range</option>
          <option value="bookmarks">Split by Bookmarks</option>
        </select>
      </div>
      
      {splitMode === "count" && (
        <div>
          <label className="block text-sm font-medium mb-2">Pages per File</label>
          <input
            type="number"
            min="1"
            max="50"
            value={pagesPerFile}
            onChange={(e) => setPagesPerFile(parseInt(e.target.value) || 1)}
            className="w-full p-2 border border-border rounded-md bg-background"
            data-testid="input-pages-per-file"
          />
        </div>
      )}
      
      {splitMode === "range" && (
        <div>
          <label className="block text-sm font-medium mb-2">Page Range</label>
          <input
            type="text"
            placeholder="e.g., 1-5, 7, 10-12"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background"
            data-testid="input-page-range"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use commas to separate ranges: 1-5, 7, 10-12
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
      {customOptions}
    </UniversalToolInterface>
  );
}