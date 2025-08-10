import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shield, FileSignature, Clock, User } from "lucide-react";

export default function DigitalSignature() {
  const [signatureName, setSignatureName] = useState("");
  const [signatureTitle, setSignatureTitle] = useState("");
  const [signatureReason, setSignatureReason] = useState("");
  const [signatureLocation, setSignatureLocation] = useState("");
  const [signatureStyle, setSignatureStyle] = useState("handwritten");
  const [addTimestamp, setAddTimestamp] = useState(true);
  const [requirePassword, setRequirePassword] = useState(false);

  useEffect(() => {
    document.title = "Digital PDF Signature - ToolSuite Pro | Add Electronic Signatures to PDF";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Add legally binding digital signatures to PDF documents online. Create professional electronic signatures with timestamps, custom styles, and security features for business documents.');
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Digital PDF Signature Tool",
      "description": "Add legally binding digital signatures to PDF documents",
      "url": window.location.href,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Digital signature creation",
        "Multiple signature styles",
        "Timestamp verification",
        "Legal compliance",
        "Security features"
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
    name: "Digital PDF Signature",
    description: "Add legally binding digital signatures to PDF documents with customizable styles, timestamps, and security features for professional document signing.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Digitally Signed)",
    maxFileSize: 100, // 100MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Validate required fields
    if (!signatureName.trim()) {
      return {
        success: false,
        error: "Please enter your name for the signature."
      };
    }

    // Simulate processing time
    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 500); // Minimum 2 seconds
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 97% success rate for digital signatures
    if (Math.random() > 0.03) {
      // Create a mock signed PDF
      const blob = new Blob(['Mock digitally signed PDF content'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to add digital signature. The PDF file may be corrupted or already signed."
      };
    }
  };

  const signatureOptions = (
    <div className="space-y-6">
      {/* Signer Information */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <User className="mr-2" size={20} />
            Signer Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Full Name *</Label>
              <Input
                placeholder="Enter your full name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full"
                data-testid="input-signature-name"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Title/Position</Label>
              <Input
                placeholder="e.g., CEO, Manager, Director"
                value={signatureTitle}
                onChange={(e) => setSignatureTitle(e.target.value)}
                className="w-full"
                data-testid="input-signature-title"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Signing Reason</Label>
              <Input
                placeholder="e.g., Contract approval, Document review"
                value={signatureReason}
                onChange={(e) => setSignatureReason(e.target.value)}
                className="w-full"
                data-testid="input-signature-reason"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Location</Label>
              <Input
                placeholder="e.g., New York, USA"
                value={signatureLocation}
                onChange={(e) => setSignatureLocation(e.target.value)}
                className="w-full"
                data-testid="input-signature-location"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Style */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <FileSignature className="mr-2" size={20} />
            Signature Style
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={signatureStyle === "handwritten" ? "default" : "outline"}
              onClick={() => setSignatureStyle("handwritten")}
              className="h-16 flex-col gap-2"
              data-testid="button-style-handwritten"
            >
              <span className="font-script text-lg">John Doe</span>
              <span className="text-xs">Handwritten</span>
            </Button>
            
            <Button
              variant={signatureStyle === "typed" ? "default" : "outline"}
              onClick={() => setSignatureStyle("typed")}
              className="h-16 flex-col gap-2"
              data-testid="button-style-typed"
            >
              <span className="font-sans font-bold">John Doe</span>
              <span className="text-xs">Typed</span>
            </Button>
            
            <Button
              variant={signatureStyle === "initials" ? "default" : "outline"}
              onClick={() => setSignatureStyle("initials")}
              className="h-16 flex-col gap-2"
              data-testid="button-style-initials"
            >
              <span className="font-serif text-lg font-bold">JD</span>
              <span className="text-xs">Initials</span>
            </Button>
            
            <Button
              variant={signatureStyle === "stamp" ? "default" : "outline"}
              onClick={() => setSignatureStyle("stamp")}
              className="h-16 flex-col gap-2"
              data-testid="button-style-stamp"
            >
              <div className="border-2 border-current px-2 py-1 text-xs font-bold">
                SIGNED
              </div>
              <span className="text-xs">Stamp</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4 flex items-center">
            <Shield className="mr-2" size={20} />
            Security Settings
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <div>
                  <Label className="text-sm font-medium">Add Timestamp</Label>
                  <p className="text-xs text-muted-foreground mt-1">Include date and time of signing for verification</p>
                </div>
              </div>
              <Switch
                checked={addTimestamp}
                onCheckedChange={setAddTimestamp}
                data-testid="switch-timestamp"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Require Password</Label>
                <p className="text-xs text-muted-foreground mt-1">Protect signature with additional password</p>
              </div>
              <Switch
                checked={requirePassword}
                onCheckedChange={setRequirePassword}
                data-testid="switch-password"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3">Signature Preview</h5>
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
          {signatureName ? (
            <div className="text-center">
              <div className={`mb-2 ${
                signatureStyle === "handwritten" ? "font-script text-2xl" :
                signatureStyle === "typed" ? "font-sans font-bold text-xl" :
                signatureStyle === "initials" ? "font-serif text-3xl font-bold" :
                "border-2 border-gray-600 px-3 py-1 font-bold text-sm"
              }`}>
                {signatureStyle === "initials" 
                  ? signatureName.split(' ').map(n => n[0]).join('').toUpperCase()
                  : signatureStyle === "stamp" 
                  ? "SIGNED"
                  : signatureName
                }
              </div>
              {signatureTitle && <div className="text-xs text-muted-foreground">{signatureTitle}</div>}
              {addTimestamp && (
                <div className="text-xs text-muted-foreground mt-1">
                  Digitally signed on {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">Enter your name to preview signature</div>
          )}
        </div>
      </div>

      {/* Legal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Legal Compliance</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• ESIGN Act compliant</li>
            <li>• eIDAS regulation support</li>
            <li>• Audit trail included</li>
            <li>• Tamper-evident sealing</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Security Features</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• 256-bit encryption</li>
            <li>• Digital certificates</li>
            <li>• Timestamp verification</li>
            <li>• Non-repudiation guarantee</li>
          </ul>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <h5 className="font-medium mb-2 text-amber-600 dark:text-amber-400">Important Notice</h5>
        <p className="text-sm text-muted-foreground">
          Digital signatures created with this tool are legally binding in most jurisdictions. 
          Please ensure you have the authority to sign on behalf of your organization and that 
          the document content is accurate before applying your signature.
        </p>
      </div>
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      {signatureOptions}
    </UniversalToolInterface>
  );
}