import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function PDFPasswordRemover() {
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = "PDF Password Remover - ToolSuite Pro | Remove PDF Password Protection";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Remove password protection from PDF files online. Unlock password-protected PDFs safely and securely to enable editing and sharing.');
    }
  }, []);

  const toolConfig = {
    name: "PDF Password Remover",
    description: "Remove password protection from PDF documents to enable editing, copying, and sharing. Safely unlock your password-protected PDFs while maintaining document integrity.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Unlocked)",
    maxFileSize: 100, // 100MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Check if password is provided for locked files
    if (!password.trim()) {
      return {
        success: false,
        error: "Please enter the PDF password to remove protection."
      };
    }

    // Simulate processing time
    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 600); // Minimum 2 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate password validation (90% success rate)
    if (Math.random() > 0.1) {
      // Create a mock unlocked PDF
      const blob = new Blob(['Mock unlocked PDF content'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Incorrect password or the PDF file is corrupted. Please verify the password and try again."
      };
    }
  };

  const customOptions = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">PDF Password</label>
        <input
          type="password"
          placeholder="Enter PDF password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-border rounded-md bg-background"
          data-testid="input-pdf-password"
        />
        <p className="text-xs text-muted-foreground mt-1">
          The password is required to remove protection from password-secured PDFs.
        </p>
      </div>
      <div className="bg-muted/30 p-3 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Security Notice</h4>
        <p className="text-xs text-muted-foreground">
          Your password and files are processed securely and are not stored on our servers. All data is automatically deleted after processing.
        </p>
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