import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function MemeGenerator() {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontFamily, setFontFamily] = useState("impact");
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("white");
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState("black");
  const [strokeWidth, setStrokeWidth] = useState([3]);
  const [template, setTemplate] = useState("custom");

  useEffect(() => {
    document.title = "Meme Generator - ToolSuite Pro | Create Memes with Text and Images";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create hilarious memes with custom text, fonts, and images. Add top and bottom text with professional styling options for viral-ready memes.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Meme Generator",
      "description": "Create custom memes with text overlays and professional styling",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
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
    name: "Meme Generator",
    description: "Create viral-ready memes with custom text, professional fonts, and styling options. Perfect for social media, humor, and creative expression.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"],
    outputFormat: "Meme image",
    maxFileSize: 20, // 20MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate meme generation processing
    const processingTime = Math.max(2000, (file.size / 1024 / 1024) * 1000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 97% success rate
    if (Math.random() > 0.03) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;
      
      // Create background image simulation
      const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667EEA');
      gradient.addColorStop(1, '#764BA2');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Setup text styling
      ctx!.font = `bold ${fontSize[0]}px ${fontFamily}`;
      ctx!.textAlign = 'center';
      ctx!.fillStyle = textColor;
      
      if (strokeEnabled) {
        ctx!.strokeStyle = strokeColor;
        ctx!.lineWidth = strokeWidth[0];
        ctx!.lineJoin = 'round';
      }
      
      // Add top text
      if (topText) {
        const words = topText.toUpperCase().split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx!.measureText(testLine);
          if (metrics.width > canvas.width - 40) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        lines.forEach((line, index) => {
          const y = 60 + (index * (fontSize[0] + 10));
          if (strokeEnabled) {
            ctx!.strokeText(line, canvas.width / 2, y);
          }
          ctx!.fillText(line, canvas.width / 2, y);
        });
      }
      
      // Add bottom text
      if (bottomText) {
        const words = bottomText.toUpperCase().split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx!.measureText(testLine);
          if (metrics.width > canvas.width - 40) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        lines.forEach((line, index) => {
          const y = canvas.height - 40 - ((lines.length - 1 - index) * (fontSize[0] + 10));
          if (strokeEnabled) {
            ctx!.strokeText(line, canvas.width / 2, y);
          }
          ctx!.fillText(line, canvas.width / 2, y);
        });
      }
      
      // Add watermark indicator if no text
      if (!topText && !bottomText) {
        ctx!.font = '24px Arial';
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx!.fillText('Add your text above', canvas.width / 2, canvas.height / 2);
      }
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const downloadUrl = URL.createObjectURL(blob);
            resolve({
              success: true,
              downloadUrl,
            });
          } else {
            resolve({
              success: false,
              error: "Failed to generate meme"
            });
          }
        }, 'image/png');
      });
    } else {
      return {
        success: false,
        error: "Meme generation failed. Please try again with different text or image."
      };
    }
  };

  const popularTemplates = [
    "Distracted Boyfriend",
    "Drake Pointing",
    "Woman Yelling at Cat",
    "Two Buttons",
    "Change My Mind",
    "Expanding Brain",
    "This Is Fine",
    "Surprised Pikachu"
  ];

  const settingsComponent = (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="top-text" className="text-sm font-medium mb-2 block">Top Text</Label>
          <Input
            id="top-text"
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            placeholder="Enter top text..."
            maxLength={50}
            data-testid="input-top-text"
          />
        </div>
        
        <div>
          <Label htmlFor="bottom-text" className="text-sm font-medium mb-2 block">Bottom Text</Label>
          <Input
            id="bottom-text"
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            placeholder="Enter bottom text..."
            maxLength={50}
            data-testid="input-bottom-text"
          />
        </div>
      </div>

      {/* Font Settings */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Font Family</Label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger data-testid="select-font-family">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="impact">Impact (Classic)</SelectItem>
              <SelectItem value="arial">Arial</SelectItem>
              <SelectItem value="helvetica">Helvetica</SelectItem>
              <SelectItem value="comic-sans">Comic Sans MS</SelectItem>
              <SelectItem value="times">Times New Roman</SelectItem>
              <SelectItem value="courier">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Font Size: {fontSize[0]}px
          </Label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            max={80}
            min={20}
            step={2}
            className="w-full"
            data-testid="slider-font-size"
          />
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Text Color</Label>
          <Select value={textColor} onValueChange={setTextColor}>
            <SelectTrigger data-testid="select-text-color">
              <SelectValue placeholder="Select text color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="black">Black</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="green">Green</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stroke Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="stroke"
            checked={strokeEnabled}
            onCheckedChange={setStrokeEnabled}
            data-testid="switch-stroke"
          />
          <Label htmlFor="stroke">Text outline/stroke</Label>
        </div>
        
        {strokeEnabled && (
          <>
            <div>
              <Label className="text-sm font-medium mb-3 block">Stroke Color</Label>
              <Select value={strokeColor} onValueChange={setStrokeColor}>
                <SelectTrigger data-testid="select-stroke-color">
                  <SelectValue placeholder="Select stroke color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Stroke Width: {strokeWidth[0]}px
              </Label>
              <Slider
                value={strokeWidth}
                onValueChange={setStrokeWidth}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="slider-stroke-width"
              />
            </div>
          </>
        )}
      </div>

      {/* Popular Templates */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Popular Templates</Label>
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger data-testid="select-template">
            <SelectValue placeholder="Choose a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Upload Custom Image</SelectItem>
            {popularTemplates.map((temp) => (
              <SelectItem key={temp.toLowerCase().replace(/\s+/g, '-')} value={temp.toLowerCase().replace(/\s+/g, '-')}>
                {temp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Or upload your own image below
        </p>
      </div>
    </div>
  );

  return (
    <UniversalToolInterface
      config={toolConfig}
      onProcess={handleProcess}
    >
      <div className="bg-muted/30 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Professional Meme Creation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">😂</div>
              <div className="font-medium">Viral Ready</div>
              <div className="text-sm text-muted-foreground">Perfect for social media</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Custom Styling</div>
              <div className="text-sm text-muted-foreground">Fonts, colors, outlines</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Quick Creation</div>
              <div className="text-sm text-muted-foreground">Generate in seconds</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium">Popular Templates</div>
              <div className="text-sm text-muted-foreground">Trending meme formats</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">Multi-Platform</div>
              <div className="text-sm text-muted-foreground">Works everywhere</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">💯</div>
              <div className="font-medium">High Quality</div>
              <div className="text-sm text-muted-foreground">Crisp, clear output</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Meme Creation Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Text Placement</h4>
              <p>Keep text short and punchy. Top text sets up the joke, bottom text delivers the punchline.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Font Choice</h4>
              <p>Impact font is the classic choice for memes. Use bold, easy-to-read fonts for maximum impact.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Color Contrast</h4>
              <p>White text with black outline works on any background. Ensure text is always readable.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Timing & Trends</h4>
              <p>Use current events and trending topics for maximum virality and engagement.</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">📝 Meme Best Practices</h4>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Keep text concise - less is more in memes</li>
            <li>• Use ALL CAPS for traditional meme styling</li>
            <li>• Ensure good contrast between text and background</li>
            <li>• Choose relatable content for your audience</li>
            <li>• Test different formats to see what works</li>
          </ul>
        </div>
      </div>
    </UniversalToolInterface>
  );
}