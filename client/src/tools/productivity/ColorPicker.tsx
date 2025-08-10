import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Palette, RefreshCw, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export default function ColorPicker() {
  const { toast } = useToast();
  const [color, setColor] = useState<Color>({
    hex: "#3b82f6",
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    hsv: { h: 217, s: 76, v: 96 },
    cmyk: { c: 76, m: 47, y: 0, k: 4 }
  });
  
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk'>('hex');

  useEffect(() => {
    document.title = "Color Picker - ToolSuite Pro | Pick Colors & Get Hex, RGB, HSL Codes";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Advanced color picker tool to extract hex, RGB, HSL, HSV, and CMYK color codes. Perfect for web designers, developers, and graphic artists.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Color Picker",
      "description": "Professional color picker and converter tool",
      "applicationCategory": "DesignApplication",
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, m, y);

    return {
      c: Math.round(((c - k) / (1 - k) || 0) * 100),
      m: Math.round(((m - k) / (1 - k) || 0) * 100),
      y: Math.round(((y - k) / (1 - k) || 0) * 100),
      k: Math.round(k * 100)
    };
  };

  const updateColor = (hex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return;
    
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

    const newColor = { hex, rgb, hsl, hsv, cmyk };
    setColor(newColor);
    
    // Add to history if not already present
    if (!colorHistory.includes(hex)) {
      setColorHistory(prev => [hex, ...prev.slice(0, 9)]);
    }
  };

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateColor(randomHex);
  };

  const copyToClipboard = (value: string, format: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${format} color code copied to clipboard`,
    });
  };

  const formatColor = (color: Color, format: string) => {
    switch (format) {
      case 'hex': return color.hex;
      case 'rgb': return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
      case 'hsl': return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
      case 'hsv': return `hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`;
      case 'cmyk': return `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;
      default: return color.hex;
    }
  };

  const popularColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Palette className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Color Picker</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional color picker tool to extract and convert colors to hex, RGB, HSL, HSV, and CMYK formats. 
            Perfect for designers and developers.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="color-picker-top" size="banner" />

        <div className="space-y-8">
          {/* Main Color Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Color Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2" size={20} />
                  Color Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="w-full h-48 rounded-lg border-4 border-white shadow-lg"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="space-y-2">
                  <Label htmlFor="color-input">Select Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-input"
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColor(e.target.value)}
                      className="w-16 h-12 p-1 border-2"
                    />
                    <Input
                      type="text"
                      value={color.hex}
                      onChange={(e) => updateColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                    <Button onClick={generateRandomColor} variant="outline">
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Codes */}
            <Card>
              <CardHeader>
                <CardTitle>Color Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as any)}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="hex">HEX</TabsTrigger>
                    <TabsTrigger value="rgb">RGB</TabsTrigger>
                    <TabsTrigger value="hsl">HSL</TabsTrigger>
                    <TabsTrigger value="hsv">HSV</TabsTrigger>
                    <TabsTrigger value="cmyk">CMYK</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4 space-y-3">
                    {/* HEX */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">HEX</div>
                        <div className="font-mono">{color.hex}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(color.hex, 'HEX')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* RGB */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">RGB</div>
                        <div className="font-mono">rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(formatColor(color, 'rgb'), 'RGB')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* HSL */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">HSL</div>
                        <div className="font-mono">hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(formatColor(color, 'hsl'), 'HSL')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* HSV */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">HSV</div>
                        <div className="font-mono">hsv({color.hsv.h}, {color.hsv.s}%, {color.hsv.v}%)</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(formatColor(color, 'hsv'), 'HSV')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>

                    {/* CMYK */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">CMYK</div>
                        <div className="font-mono">cmyk({color.cmyk.c}%, {color.cmyk.m}%, {color.cmyk.y}%, {color.cmyk.k}%)</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(formatColor(color, 'cmyk'), 'CMYK')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Popular Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {popularColors.map((hexColor, index) => (
                  <button
                    key={index}
                    className="aspect-square rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                    style={{ backgroundColor: hexColor }}
                    onClick={() => updateColor(hexColor)}
                    title={hexColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Color History */}
          {colorHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2" size={20} />
                  Recent Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {colorHistory.map((hexColor, index) => (
                    <button
                      key={index}
                      className="aspect-square rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                      style={{ backgroundColor: hexColor }}
                      onClick={() => updateColor(hexColor)}
                      title={hexColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="color-picker-bottom" size="banner" />
        </div>
      </div>
    </div>
  );
}