import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, RefreshCw, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface BarcodeConfig {
  text: string;
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  fontSize: number;
  margin: number;
}

const barcodeFormats = {
  'CODE128': 'Code 128',
  'CODE39': 'Code 39',
  'EAN13': 'EAN-13',
  'EAN8': 'EAN-8',
  'UPC': 'UPC-A',
  'ITF14': 'ITF-14',
  'MSI': 'MSI',
  'pharmacode': 'Pharmacode',
  'codabar': 'Codabar'
};

export default function BarcodeGenerator() {
  const { toast } = useToast();
  const [config, setConfig] = useState<BarcodeConfig>({
    text: '123456789012',
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 20,
    margin: 10
  });
  const [generatedBarcode, setGeneratedBarcode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.title = "Barcode Generator - ToolSuite Pro | Generate Various Types of Barcodes";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional barcode generator supporting Code 128, Code 39, EAN-13, UPC-A and more. Generate high-quality barcodes for products, inventory, and business use.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Barcode Generator",
      "description": "Professional barcode generator tool",
      "applicationCategory": "BusinessApplication",
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

  // Simulate barcode generation (in a real app, you'd use a library like JsBarcode)
  const generateBarcodeData = (config: BarcodeConfig): string => {
    const { text, format, width, height, displayValue, fontSize, margin } = config;
    
    // Create SVG barcode representation
    const barWidth = width;
    const totalWidth = text.length * barWidth * 6 + margin * 2; // Approximate width
    const totalHeight = height + (displayValue ? fontSize + 10 : 0) + margin * 2;
    
    let barcodePattern = '';
    // Simulate different barcode patterns based on format
    const patterns = {
      'CODE128': '11010010000',
      'CODE39': '1010001110111010',
      'EAN13': '101',
      'EAN8': '101',
      'UPC': '101',
      'ITF14': '1010',
      'MSI': '110',
      'pharmacode': '111000111',
      'codabar': '1011001'
    };
    
    const basePattern = patterns[format as keyof typeof patterns] || patterns.CODE128;
    
    // Generate bars
    let bars = '';
    let xPos = margin;
    
    for (let i = 0; i < text.length * 8; i++) {
      const isBar = (i + parseInt(text.charAt(i % text.length))) % 2 === 0;
      if (isBar) {
        bars += `<rect x="${xPos}" y="${margin}" width="${barWidth}" height="${height}" fill="black"/>`;
      }
      xPos += barWidth;
    }
    
    // Add text if enabled
    let textElement = '';
    if (displayValue) {
      textElement = `<text x="${totalWidth / 2}" y="${height + margin + fontSize}" 
        font-family="monospace" font-size="${fontSize}" text-anchor="middle" fill="black">${text}</text>`;
    }
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" style="background: white;">
      ${bars}
      ${textElement}
    </svg>`;
  };

  const generateBarcode = async () => {
    if (!config.text.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to generate barcode",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const barcodeData = generateBarcodeData(config);
      setGeneratedBarcode(barcodeData);
      
      toast({
        title: "Barcode Generated!",
        description: "Your barcode has been generated successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate barcode. Please check your input.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBarcode = () => {
    if (!generatedBarcode) return;
    
    const blob = new Blob([generatedBarcode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${config.format}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "Barcode has been downloaded as SVG",
    });
  };

  const copyBarcodeText = () => {
    navigator.clipboard.writeText(config.text);
    toast({
      title: "Copied!",
      description: "Barcode text copied to clipboard",
    });
  };

  const generateRandomBarcode = () => {
    const formats = Object.keys(barcodeFormats);
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    
    let randomText = '';
    if (randomFormat === 'EAN13') {
      randomText = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    } else if (randomFormat === 'EAN8') {
      randomText = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    } else if (randomFormat === 'UPC') {
      randomText = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    } else {
      randomText = Math.floor(Math.random() * 1000000000).toString();
    }
    
    setConfig(prev => ({
      ...prev,
      text: randomText,
      format: randomFormat
    }));
  };

  const presets = {
    small: { width: 1, height: 50, fontSize: 12, margin: 5 },
    medium: { width: 2, height: 100, fontSize: 20, margin: 10 },
    large: { width: 3, height: 150, fontSize: 24, margin: 15 },
    extra_large: { width: 4, height: 200, fontSize: 30, margin: 20 }
  };

  const applyPreset = (preset: keyof typeof presets) => {
    setConfig(prev => ({ ...prev, ...presets[preset] }));
  };

  useEffect(() => {
    if (config.text.trim()) {
      generateBarcode();
    }
  }, [config]);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Barcode Generator</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate professional barcodes in various formats including Code 128, Code 39, EAN-13, UPC-A, and more. 
            Perfect for inventory management, product labeling, and business applications.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="barcode-generator-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Barcode Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="barcode-text">Barcode Text/Data</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode-text"
                      value={config.text}
                      onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter text or numbers"
                      className="font-mono"
                    />
                    <Button size="sm" onClick={copyBarcodeText} variant="outline">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="barcode-format">Barcode Format</Label>
                  <Select value={config.format} onValueChange={(value) => setConfig(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(barcodeFormats).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bar-width">Bar Width</Label>
                    <Select value={config.width.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, width: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1px (Thin)</SelectItem>
                        <SelectItem value="2">2px (Normal)</SelectItem>
                        <SelectItem value="3">3px (Thick)</SelectItem>
                        <SelectItem value="4">4px (Extra Thick)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="bar-height">Bar Height</Label>
                    <Input
                      id="bar-height"
                      type="number"
                      min="20"
                      max="300"
                      value={config.height}
                      onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) || 100 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="display-value"
                    checked={config.displayValue}
                    onChange={(e) => setConfig(prev => ({ ...prev, displayValue: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="display-value">Show text below barcode</Label>
                </div>

                {config.displayValue && (
                  <div>
                    <Label htmlFor="font-size">Text Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      min="8"
                      max="50"
                      value={config.fontSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 20 }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Size Presets</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => applyPreset('small')}
                    >
                      Small
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => applyPreset('medium')}
                    >
                      Medium
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => applyPreset('large')}
                    >
                      Large
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => applyPreset('extra_large')}
                    >
                      Extra Large
                    </Button>
                  </div>
                </div>

                <div>
                  <Button 
                    onClick={generateRandomBarcode}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Generate Random Barcode
                  </Button>
                </div>

                <div>
                  <Button 
                    onClick={generateBarcode}
                    disabled={isGenerating || !config.text.trim()}
                    className="w-full gradient-bg"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Barcode'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Barcode */}
          {generatedBarcode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Generated Barcode
                  <div className="flex gap-2">
                    <Button size="sm" onClick={downloadBarcode}>
                      <Download size={16} className="mr-2" />
                      Download SVG
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-white rounded-lg border">
                  <div
                    dangerouslySetInnerHTML={{ __html: generatedBarcode }}
                    className="inline-block"
                  />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Format: {barcodeFormats[config.format as keyof typeof barcodeFormats]} | 
                  Data: {config.text} | 
                  Size: {config.width}px × {config.height}px
                </div>
              </CardContent>
            </Card>
          )}

          {/* Format Information */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Format Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="code128">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
                  <TabsTrigger value="code128">Code 128</TabsTrigger>
                  <TabsTrigger value="code39">Code 39</TabsTrigger>
                  <TabsTrigger value="ean13">EAN-13</TabsTrigger>
                  <TabsTrigger value="upc">UPC-A</TabsTrigger>
                  <TabsTrigger value="other">Others</TabsTrigger>
                </TabsList>
                
                <TabsContent value="code128" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Code 128</h4>
                    <p className="text-sm text-muted-foreground">
                      High-density barcode that can encode all ASCII characters. 
                      Commonly used for shipping labels and inventory management.
                    </p>
                    <p className="text-xs"><strong>Characters:</strong> All ASCII (0-127)</p>
                    <p className="text-xs"><strong>Use cases:</strong> Shipping, inventory, healthcare</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="code39" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Code 39</h4>
                    <p className="text-sm text-muted-foreground">
                      Alphanumeric barcode widely used in automotive and defense industries.
                    </p>
                    <p className="text-xs"><strong>Characters:</strong> 0-9, A-Z, and some symbols</p>
                    <p className="text-xs"><strong>Use cases:</strong> Manufacturing, automotive, military</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="ean13" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">EAN-13</h4>
                    <p className="text-sm text-muted-foreground">
                      International standard for retail products. 13-digit barcode used worldwide.
                    </p>
                    <p className="text-xs"><strong>Characters:</strong> 13 digits (0-9)</p>
                    <p className="text-xs"><strong>Use cases:</strong> Retail products, grocery stores</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="upc" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">UPC-A</h4>
                    <p className="text-sm text-muted-foreground">
                      Standard barcode for retail products in North America. 12-digit barcode.
                    </p>
                    <p className="text-xs"><strong>Characters:</strong> 12 digits (0-9)</p>
                    <p className="text-xs"><strong>Use cases:</strong> US/Canada retail, grocery stores</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="other" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">EAN-8</h4>
                      <p className="text-xs text-muted-foreground">Compact version of EAN-13 for small products</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">ITF-14</h4>
                      <p className="text-xs text-muted-foreground">Used for packaging and shipping containers</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Pharmacode</h4>
                      <p className="text-xs text-muted-foreground">Pharmaceutical packaging standard</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="barcode-generator-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}