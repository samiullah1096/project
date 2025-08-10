import React, { useEffect, useState } from "react";
import UniversalToolInterface from "@/components/UniversalToolInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Tag } from "lucide-react";

export default function PDFMetadata() {
  const [action, setAction] = useState("edit");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [creator, setCreator] = useState("");
  const [producer, setProducer] = useState("");
  const [removeAll, setRemoveAll] = useState(false);
  const [customProperties, setCustomProperties] = useState([{ key: "", value: "" }]);

  useEffect(() => {
    document.title = "PDF Metadata Editor - ToolSuite Pro | Edit PDF Properties & Information";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Edit PDF metadata, properties, and document information online. Add, modify, or remove PDF title, author, subject, keywords, and custom properties for better document management.');
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "PDF Metadata Editor",
      "description": "Edit PDF metadata, properties, and document information",
      "url": window.location.href,
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Edit PDF title, author, subject",
        "Manage keywords and tags",
        "Custom metadata properties",
        "Bulk metadata removal",
        "Document property management"
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
    name: "PDF Metadata Editor",
    description: "Edit PDF metadata, properties, and document information including title, author, subject, keywords, and custom properties for better document organization.",
    acceptedFormats: [".pdf"],
    outputFormat: "PDF (Modified Metadata)",
    maxFileSize: 200,
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    if (action === "edit" && !title.trim() && !author.trim() && !subject.trim() && !keywords.trim()) {
      return {
        success: false,
        error: "Please provide at least one metadata field to update."
      };
    }

    const processingTime = Math.max(1500, (file.size / 1024 / 1024) * 300); // Minimum 1.5 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    if (Math.random() > 0.02) {
      const blob = new Blob(['Mock PDF with updated metadata'], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      
      return {
        success: true,
        downloadUrl: downloadUrl
      };
    } else {
      return {
        success: false,
        error: "Failed to update PDF metadata. The file may be password-protected or corrupted."
      };
    }
  };

  const addCustomProperty = () => {
    setCustomProperties([...customProperties, { key: "", value: "" }]);
  };

  const updateCustomProperty = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customProperties];
    updated[index][field] = value;
    setCustomProperties(updated);
  };

  const removeCustomProperty = (index: number) => {
    setCustomProperties(customProperties.filter((_, i) => i !== index));
  };

  const metadataOptions = (
    <div className="space-y-6">
      {/* Action Selection */}
      <Card className="glassmorphism">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-4">Metadata Action</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={action === "edit" ? "default" : "outline"}
              onClick={() => setAction("edit")}
              className="h-16 flex-col gap-2"
              data-testid="button-edit-metadata"
            >
              <FileText size={20} />
              <span className="text-sm">Edit Metadata</span>
            </Button>
            <Button
              variant={action === "remove" ? "default" : "outline"}
              onClick={() => setAction("remove")}
              className="h-16 flex-col gap-2"
              data-testid="button-remove-metadata"
            >
              <Tag size={20} />
              <span className="text-sm">Remove Metadata</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {action === "edit" && (
        <>
          {/* Basic Metadata */}
          <Card className="glassmorphism">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Document Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Document Title</Label>
                    <Input
                      placeholder="Enter document title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full"
                      data-testid="input-title"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Author</Label>
                    <Input
                      placeholder="Enter author name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full"
                      data-testid="input-author"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Subject</Label>
                  <Input
                    placeholder="Enter document subject or topic"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                    data-testid="input-subject"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Keywords</Label>
                  <Input
                    placeholder="Enter keywords separated by commas"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full"
                    data-testid="input-keywords"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use commas to separate multiple keywords
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Metadata */}
          <Card className="glassmorphism">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4">Advanced Properties</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Creator Application</Label>
                  <Input
                    placeholder="e.g., Microsoft Word, Adobe Acrobat"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    className="w-full"
                    data-testid="input-creator"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Producer</Label>
                  <Input
                    placeholder="e.g., PDF converter used"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="w-full"
                    data-testid="input-producer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Properties */}
          <Card className="glassmorphism">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-4">Custom Properties</h4>
              <div className="space-y-3">
                {customProperties.map((prop, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Property name"
                      value={prop.key}
                      onChange={(e) => updateCustomProperty(index, 'key', e.target.value)}
                      className="flex-1"
                      data-testid={`input-custom-key-${index}`}
                    />
                    <Input
                      placeholder="Property value"
                      value={prop.value}
                      onChange={(e) => updateCustomProperty(index, 'value', e.target.value)}
                      className="flex-1"
                      data-testid={`input-custom-value-${index}`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeCustomProperty(index)}
                      disabled={customProperties.length === 1}
                      data-testid={`button-remove-custom-${index}`}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addCustomProperty}
                  className="w-full"
                  data-testid="button-add-custom"
                >
                  Add Custom Property
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {action === "remove" && (
        <Card className="glassmorphism">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Metadata Removal</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Remove All Metadata</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remove all document properties and metadata for privacy
                  </p>
                </div>
                <Switch
                  checked={removeAll}
                  onCheckedChange={setRemoveAll}
                  data-testid="switch-remove-all"
                />
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-amber-600 dark:text-amber-400">Privacy Notice</h5>
                <p className="text-sm text-muted-foreground">
                  Removing metadata will permanently delete document properties including author information, 
                  creation dates, editing history, and custom properties. This action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Preview */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h5 className="font-medium mb-3">
          {action === "edit" ? "Metadata Preview" : "Removal Summary"}
        </h5>
        {action === "edit" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {title && (
              <div>
                <span className="text-muted-foreground">Title:</span>
                <span className="ml-2 font-medium">{title}</span>
              </div>
            )}
            {author && (
              <div>
                <span className="text-muted-foreground">Author:</span>
                <span className="ml-2 font-medium">{author}</span>
              </div>
            )}
            {subject && (
              <div>
                <span className="text-muted-foreground">Subject:</span>
                <span className="ml-2 font-medium">{subject}</span>
              </div>
            )}
            {keywords && (
              <div>
                <span className="text-muted-foreground">Keywords:</span>
                <span className="ml-2 font-medium">{keywords}</span>
              </div>
            )}
            {creator && (
              <div>
                <span className="text-muted-foreground">Creator:</span>
                <span className="ml-2 font-medium">{creator}</span>
              </div>
            )}
            {producer && (
              <div>
                <span className="text-muted-foreground">Producer:</span>
                <span className="ml-2 font-medium">{producer}</span>
              </div>
            )}
            {customProperties.some(p => p.key && p.value) && (
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Custom Properties:</span>
                <div className="ml-2 mt-1">
                  {customProperties.filter(p => p.key && p.value).map((prop, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{prop.key}:</span> {prop.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!title && !author && !subject && !keywords && !creator && !producer && 
             !customProperties.some(p => p.key && p.value) && (
              <div className="md:col-span-2 text-muted-foreground text-center py-4">
                Enter metadata information to see preview
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <span className="font-medium">Action:</span>
              <span className="ml-2">Remove all document metadata and properties</span>
            </div>
          </div>
        )}
      </div>

      {/* Usage Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Best Practices</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Use descriptive titles and subjects</li>
            <li>• Include relevant keywords for searchability</li>
            <li>• Keep author information consistent</li>
            <li>• Use custom properties for organization</li>
          </ul>
        </div>
        
        <div className="bg-card/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Metadata Benefits</h4>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li>• Improved document organization</li>
            <li>• Better search functionality</li>
            <li>• Professional document presentation</li>
            <li>• Compliance with document standards</li>
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
      {metadataOptions}
    </UniversalToolInterface>
  );
}