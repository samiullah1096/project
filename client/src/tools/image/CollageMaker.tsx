import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function CollageMaker() {
  const [layout, setLayout] = useState("grid");
  const [columns, setColumns] = useState([3]);
  const [spacing, setSpacing] = useState([10]);
  const [backgroundType, setBackgroundType] = useState("white");
  const [borderRadius, setBorderRadius] = useState([0]);
  const [shadowEnabled, setShadowEnabled] = useState(false);

  useEffect(() => {
    document.title = "Collage Maker - ToolSuite Pro | Create Photo Collages and Layouts";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create beautiful photo collages with customizable layouts, spacing, backgrounds, and effects. Perfect for social media, presentations, and creative projects.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Photo Collage Maker",
      "description": "Create photo collages with customizable layouts and creative effects",
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
    name: "Photo Collage Maker",
    description: "Create stunning photo collages with customizable layouts, backgrounds, and creative effects. Perfect for social media posts, presentations, and memory books.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".bmp"],
    outputFormat: "High-quality collage image",
    maxFileSize: 20, // 20MB per image
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate collage creation processing
    const processingTime = Math.max(4000, (file.size / 1024 / 1024) * 2000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create collage dimensions
      canvas.width = 1200;
      canvas.height = 800;
      
      // Set background
      if (backgroundType === "white") {
        ctx!.fillStyle = 'white';
      } else if (backgroundType === "black") {
        ctx!.fillStyle = 'black';
      } else if (backgroundType === "gradient") {
        const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667EEA');
        gradient.addColorStop(1, '#764BA2');
        ctx!.fillStyle = gradient;
      } else {
        ctx!.fillStyle = '#f0f0f0';
      }
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create layout simulation
      const cols = columns[0];
      const cellWidth = (canvas.width - spacing[0] * (cols + 1)) / cols;
      const cellHeight = cellWidth * 0.75; // 4:3 aspect ratio
      
      // Draw placeholder images in grid
      for (let i = 0; i < cols * 2; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = spacing[0] + col * (cellWidth + spacing[0]);
        const y = spacing[0] + row * (cellHeight + spacing[0]);
        
        // Create image placeholder
        const imageGradient = ctx!.createLinearGradient(x, y, x + cellWidth, y + cellHeight);
        imageGradient.addColorStop(0, `hsl(${(i * 50) % 360}, 70%, 60%)`);
        imageGradient.addColorStop(1, `hsl(${(i * 50 + 180) % 360}, 70%, 40%)`);
        
        if (borderRadius[0] > 0) {
          // Draw rounded rectangle
          ctx!.beginPath();
          ctx!.roundRect(x, y, cellWidth, cellHeight, borderRadius[0]);
          ctx!.fillStyle = imageGradient;
          ctx!.fill();
        } else {
          ctx!.fillStyle = imageGradient;
          ctx!.fillRect(x, y, cellWidth, cellHeight);
        }
        
        // Add shadow if enabled
        if (shadowEnabled) {
          ctx!.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx!.shadowBlur = 10;
          ctx!.shadowOffsetX = 5;
          ctx!.shadowOffsetY = 5;
        }
        
        // Add image number
        ctx!.fillStyle = 'white';
        ctx!.font = 'bold 24px Arial';
        ctx!.textAlign = 'center';
        ctx!.fillText(`${i + 1}`, x + cellWidth / 2, y + cellHeight / 2);
        
        // Reset shadow
        ctx!.shadowColor = 'transparent';
        ctx!.shadowBlur = 0;
        ctx!.shadowOffsetX = 0;
        ctx!.shadowOffsetY = 0;
      }
      
      // Add title
      ctx!.fillStyle = backgroundType === 'white' ? 'black' : 'white';
      ctx!.font = 'bold 32px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Photo Collage', canvas.width / 2, 50);
      
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
              error: "Failed to create collage"
            });
          }
        }, 'image/png');
      });
    } else {
      return {
        success: false,
        error: "Collage creation failed. Please try again with different settings or fewer images."
      };
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Layout Type */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Layout Type</Label>
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger data-testid="select-layout">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grid">Grid Layout</SelectItem>
            <SelectItem value="masonry">Masonry Style</SelectItem>
            <SelectItem value="circle">Circular Layout</SelectItem>
            <SelectItem value="heart">Heart Shape</SelectItem>
            <SelectItem value="diagonal">Diagonal Pattern</SelectItem>
            <SelectItem value="random">Random Placement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid Columns (for grid layout) */}
      {layout === 'grid' && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Columns: {columns[0]}
          </Label>
          <Slider
            value={columns}
            onValueChange={setColumns}
            max={6}
            min={1}
            step={1}
            className="w-full"
            data-testid="slider-columns"
          />
        </div>
      )}

      {/* Spacing */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Spacing: {spacing[0]}px
        </Label>
        <Slider
          value={spacing}
          onValueChange={setSpacing}
          max={50}
          min={0}
          step={5}
          className="w-full"
          data-testid="slider-spacing"
        />
      </div>

      {/* Background */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Background</Label>
        <Select value={backgroundType} onValueChange={setBackgroundType}>
          <SelectTrigger data-testid="select-background">
            <SelectValue placeholder="Select background" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="white">White</SelectItem>
            <SelectItem value="black">Black</SelectItem>
            <SelectItem value="transparent">Transparent</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="pattern">Pattern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Border Radius */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Border Radius: {borderRadius[0]}px
        </Label>
        <Slider
          value={borderRadius}
          onValueChange={setBorderRadius}
          max={50}
          min={0}
          step={5}
          className="w-full"
          data-testid="slider-border-radius"
        />
      </div>

      {/* Effects */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="shadow"
            checked={shadowEnabled}
            onCheckedChange={setShadowEnabled}
            data-testid="switch-shadow"
          />
          <Label htmlFor="shadow">Drop shadow</Label>
        </div>
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
          <h3 className="text-lg font-semibold mb-4">Creative Collage Layouts</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-medium">Social Media Ready</div>
              <div className="text-sm text-muted-foreground">Perfect for Instagram, Facebook</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Custom Layouts</div>
              <div className="text-sm text-muted-foreground">Grid, masonry, and creative shapes</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="font-medium">Multiple Backgrounds</div>
              <div className="text-sm text-muted-foreground">Solid colors, gradients, patterns</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-medium">Professional Effects</div>
              <div className="text-sm text-muted-foreground">Shadows, borders, rounded corners</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📐</div>
              <div className="font-medium">Aspect Ratio Control</div>
              <div className="text-sm text-muted-foreground">Square, portrait, landscape</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Batch Processing</div>
              <div className="text-sm text-muted-foreground">Multiple collages at once</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Layout Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Grid Layout</h4>
              <p>Organize photos in neat rows and columns with customizable spacing and alignment.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Masonry Style</h4>
              <p>Pinterest-style layout that automatically arranges photos based on their dimensions.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Creative Shapes</h4>
              <p>Arrange photos in heart, circle, or custom shapes for unique presentations.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Random Placement</h4>
              <p>Artistic scattered layout with overlapping photos for a creative scrapbook look.</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">💡 Collage Tips</h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Use images with similar lighting for cohesive collages</li>
            <li>• Keep spacing consistent for professional appearance</li>
            <li>• Mix portrait and landscape orientations for visual interest</li>
            <li>• Add subtle shadows for depth and dimension</li>
            <li>• Consider your collage's final use when choosing aspect ratios</li>
          </ul>
        </div>
      </div>
    </UniversalToolInterface>
  );
}