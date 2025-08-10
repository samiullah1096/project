import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Upload, RefreshCw, FileText, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

export default function Base64Encoder() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [processingFile, setProcessingFile] = useState(false);

  useEffect(() => {
    document.title = "Base64 Encoder/Decoder - ToolSuite Pro | Encode and Decode Base64 Strings";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional Base64 encoder and decoder tool. Convert text to Base64, decode Base64 strings, and encode files to Base64 format with instant results.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Base64 Encoder/Decoder",
      "description": "Professional Base64 encoding and decoding tool",
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const processText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to process",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(encoded);
        toast({
          title: "Text Encoded",
          description: "Your text has been encoded to Base64",
        });
      } else {
        // Validate Base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(inputText.replace(/\s/g, ''))) {
          throw new Error("Invalid Base64 format");
        }
        const decoded = decodeURIComponent(escape(atob(inputText.replace(/\s/g, ''))));
        setOutputText(decoded);
        toast({
          title: "Text Decoded",
          description: "Your Base64 has been decoded to text",
        });
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: mode === 'encode' ? 
          "Failed to encode text. Please check your input." : 
          "Failed to decode Base64. Please check if the input is valid Base64.",
        variant: "destructive",
      });
      setOutputText("");
    }
  };

  useEffect(() => {
    if (inputText.trim()) {
      processText();
    } else {
      setOutputText("");
    }
  }, [inputText, mode]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setProcessingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1]; // Remove data URL prefix
        setFileBase64(base64);
        setProcessingFile(false);
        
        toast({
          title: "File Encoded",
          description: "Your file has been converted to Base64",
        });
      };
      reader.onerror = () => {
        setProcessingFile(false);
        toast({
          title: "File Error",
          description: "Failed to read the file",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setProcessingFile(false);
      toast({
        title: "Encoding Failed",
        description: "Failed to encode the file",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const downloadResult = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Result has been downloaded",
    });
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setSelectedFile(null);
    setFileBase64("");
  };

  const swapInputOutput = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image size={16} className="text-blue-500" />;
    }
    return <FileText size={16} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidBase64 = (str: string) => {
    try {
      return btoa(atob(str.replace(/\s/g, ''))) === str.replace(/\s/g, '');
    } catch (err) {
      return false;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Base64 Encoder/Decoder</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encode text and files to Base64 or decode Base64 strings back to their original format. 
            Perfect for data transmission, storage, and web development.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="base64-encoder-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* Text Encoder/Decoder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Text Encoder/Decoder</span>
                <div className="flex space-x-2">
                  <Badge variant={mode === 'encode' ? 'default' : 'secondary'}>
                    {mode === 'encode' ? 'Encoding' : 'Decoding'}
                  </Badge>
                  <Button onClick={swapInputOutput} size="sm" variant="outline">
                    <RefreshCw size={16} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="encode">Encode to Base64</TabsTrigger>
                  <TabsTrigger value="decode">Decode from Base64</TabsTrigger>
                </TabsList>
                
                <TabsContent value="encode" className="space-y-4">
                  <div>
                    <Label htmlFor="text-input">Text to Encode</Label>
                    <Textarea
                      id="text-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to encode to Base64..."
                      rows={6}
                      className="font-mono"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      Characters: {inputText.length} | Bytes: {new Blob([inputText]).size}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="decode" className="space-y-4">
                  <div>
                    <Label htmlFor="base64-input">Base64 to Decode</Label>
                    <Textarea
                      id="base64-input"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter Base64 string to decode..."
                      rows={6}
                      className="font-mono"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                      <span>Characters: {inputText.length}</span>
                      {inputText && (
                        <Badge variant={isValidBase64(inputText) ? 'default' : 'destructive'}>
                          {isValidBase64(inputText) ? 'Valid Base64' : 'Invalid Base64'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Output */}
              {outputText && (
                <div>
                  <Label htmlFor="output">
                    {mode === 'encode' ? 'Base64 Result' : 'Decoded Text'}
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="output"
                      value={outputText}
                      readOnly
                      rows={6}
                      className="font-mono bg-muted"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(outputText, mode === 'encode' ? 'Base64' : 'Decoded text')}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadResult(outputText, mode === 'encode' ? 'encoded.txt' : 'decoded.txt')}
                        variant="outline"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Result length: {outputText.length} characters
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={clearAll} variant="outline">
                  <RefreshCw size={16} className="mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Encoder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2" size={20} />
                File to Base64 Encoder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Upload className="text-primary" size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Upload File</h3>
                      <p className="text-muted-foreground">
                        Click to select a file to encode to Base64 (max 5MB)
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {selectedFile && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(selectedFile)}
                    <div className="flex-1">
                      <div className="font-medium">{selectedFile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </div>
                    </div>
                    {processingFile && (
                      <div className="text-sm text-muted-foreground">Processing...</div>
                    )}
                  </div>
                </div>
              )}

              {fileBase64 && !processingFile && (
                <div>
                  <Label htmlFor="file-base64">Base64 Result</Label>
                  <div className="relative">
                    <Textarea
                      id="file-base64"
                      value={fileBase64}
                      readOnly
                      rows={8}
                      className="font-mono bg-muted text-xs"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(fileBase64, 'File Base64')}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadResult(fileBase64, `${selectedFile?.name || 'file'}.base64`)}
                        variant="outline"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Base64 length: {fileBase64.length.toLocaleString()} characters
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle>About Base64 Encoding</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="what-is">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="what-is">What is Base64?</TabsTrigger>
                  <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                
                <TabsContent value="what-is" className="mt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Base64 is a binary-to-text encoding scheme that represents binary data as printable ASCII characters. 
                    It uses 64 characters (A-Z, a-z, 0-9, +, /) to encode data.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Each Base64 character represents 6 bits of data</li>
                    <li>3 bytes of input produce 4 characters of Base64 output</li>
                    <li>Padding with '=' characters ensures proper length</li>
                    <li>Safe for transmission over text-based protocols</li>
                  </ul>
                </TabsContent>
                
                <TabsContent value="use-cases" className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm">Web Development</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Embedding images in CSS/HTML</li>
                        <li>Data URLs for small files</li>
                        <li>API authentication tokens</li>
                        <li>Storing binary data in JSON</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Data Transmission</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Email attachments (MIME)</li>
                        <li>XML and JSON payloads</li>
                        <li>URL encoding for binary data</li>
                        <li>Database storage of files</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-4 space-y-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Text Example</h4>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                        <div>Input: "Hello, World!"</div>
                        <div>Output: SGVsbG8sIFdvcmxkIQ==</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Data URL Example</h4>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="base64-encoder-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}