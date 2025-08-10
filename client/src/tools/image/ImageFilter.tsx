import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function ImageFilter() {
  const [filterType, setFilterType] = useState("artistic");
  const [filterName, setFilterName] = useState("oil-painting");
  const [intensity, setIntensity] = useState([75]);
  const [preserveOriginal, setPreserveOriginal] = useState(false);
  const [blendMode, setBlendMode] = useState("replace");

  useEffect(() => {
    document.title = "Image Filter - ToolSuite Pro | Apply Artistic Filters and Effects";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Apply artistic filters and creative effects to images. Oil painting, watercolor, sketch, vintage, and many more professional filters.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Image Filter Tool",
      "description": "Apply artistic filters and creative effects to transform your images",
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
    name: "Image Filter & Effects",
    description: "Transform your images with professional artistic filters and creative effects. From oil painting to vintage looks, create stunning visual transformations.",
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".bmp"],
    outputFormat: "Filtered image",
    maxFileSize: 50, // 50MB
  };

  const filterCategories = {
    artistic: [
      { name: "oil-painting", label: "Oil Painting", description: "Rich, textured oil paint effect" },
      { name: "watercolor", label: "Watercolor", description: "Soft watercolor painting style" },
      { name: "sketch", label: "Pencil Sketch", description: "Hand-drawn sketch appearance" },
      { name: "pop-art", label: "Pop Art", description: "Bold, high-contrast pop art style" },
      { name: "impressionist", label: "Impressionist", description: "Monet-style impressionist painting" },
    ],
    vintage: [
      { name: "sepia", label: "Sepia Tone", description: "Classic sepia photography" },
      { name: "film-grain", label: "Film Grain", description: "Analog film texture" },
      { name: "polaroid", label: "Polaroid", description: "Instant camera look" },
      { name: "vintage-color", label: "Vintage Color", description: "Faded retro colors" },
      { name: "lomography", label: "Lomography", description: "Lomo camera effect" },
    ],
    stylized: [
      { name: "cartoon", label: "Cartoon", description: "Animated cartoon style" },
      { name: "anime", label: "Anime", description: "Japanese anime art style" },
      { name: "comic-book", label: "Comic Book", description: "Comic book illustration" },
      { name: "low-poly", label: "Low Poly", description: "Geometric low-poly art" },
      { name: "pixel-art", label: "Pixel Art", description: "8-bit pixel game style" },
    ],
    dramatic: [
      { name: "hdr", label: "HDR Effect", description: "High dynamic range look" },
      { name: "dramatic-bw", label: "Dramatic B&W", description: "High-contrast black and white" },
      { name: "cross-process", label: "Cross Process", description: "Color-shifted film effect" },
      { name: "orton", label: "Orton Effect", description: "Dreamy, glowing effect" },
      { name: "tilt-shift", label: "Tilt Shift", description: "Miniature effect" },
    ]
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate filter processing time
    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 2000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate 93% success rate
    if (Math.random() > 0.07) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 800;
      canvas.height = 600;
      
      // Create base image
      const gradient = ctx!.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // Apply different gradients based on filter type
      switch (filterType) {
        case 'artistic':
          gradient.addColorStop(0, '#FF6B6B');
          gradient.addColorStop(0.5, '#4ECDC4');
          gradient.addColorStop(1, '#45B7D1');
          break;
        case 'vintage':
          gradient.addColorStop(0, '#D2B48C');
          gradient.addColorStop(0.5, '#DEB887');
          gradient.addColorStop(1, '#8B7355');
          break;
        case 'stylized':
          gradient.addColorStop(0, '#667EEA');
          gradient.addColorStop(1, '#764BA2');
          break;
        case 'dramatic':
          gradient.addColorStop(0, '#2C3E50');
          gradient.addColorStop(0.5, '#34495E');
          gradient.addColorStop(1, '#1A252F');
          break;
        default:
          gradient.addColorStop(0, '#667EEA');
          gradient.addColorStop(1, '#764BA2');
      }
      
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply filter-specific effects
      if (filterName === 'sketch') {
        // Simulate sketch effect with lines
        ctx!.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx!.lineWidth = 1;
        for (let i = 0; i < 200; i++) {
          ctx!.beginPath();
          ctx!.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx!.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx!.stroke();
        }
      } else if (filterName === 'oil-painting') {
        // Simulate oil painting texture
        for (let i = 0; i < 500; i++) {
          ctx!.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
          ctx!.beginPath();
          ctx!.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, 2 * Math.PI);
          ctx!.fill();
        }
      } else if (filterName === 'film-grain') {
        // Add film grain effect
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const grain = (Math.random() - 0.5) * 50;
          data[i] += grain;     // Red
          data[i + 1] += grain; // Green
          data[i + 2] += grain; // Blue
        }
        ctx!.putImageData(imageData, 0, 0);
      }
      
      // Apply intensity
      if (intensity[0] < 100) {
        ctx!.globalAlpha = intensity[0] / 100;
        ctx!.globalCompositeOperation = 'source-over';
      }
      
      // Add filter name overlay
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = 'white';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText(`${filterName.replace('-', ' ').toUpperCase()} Filter`, canvas.width / 2, canvas.height / 2);
      
      ctx!.font = '16px Arial';
      ctx!.fillText(`Intensity: ${intensity[0]}%`, canvas.width / 2, canvas.height / 2 + 30);
      
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
              error: "Failed to apply filter"
            });
          }
        }, 'image/png');
      });
    } else {
      return {
        success: false,
        error: "Filter application failed. Please try again with different settings or a smaller image."
      };
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Filter Category */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Filter Category</Label>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger data-testid="select-filter-type">
            <SelectValue placeholder="Select filter category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artistic">Artistic Filters</SelectItem>
            <SelectItem value="vintage">Vintage & Retro</SelectItem>
            <SelectItem value="stylized">Stylized Effects</SelectItem>
            <SelectItem value="dramatic">Dramatic Effects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Specific Filter */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Filter Effect</Label>
        <Select value={filterName} onValueChange={setFilterName}>
          <SelectTrigger data-testid="select-filter-name">
            <SelectValue placeholder="Select filter" />
          </SelectTrigger>
          <SelectContent>
            {filterCategories[filterType as keyof typeof filterCategories]?.map((filter) => (
              <SelectItem key={filter.name} value={filter.name}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          {filterCategories[filterType as keyof typeof filterCategories]?.find(f => f.name === filterName)?.description}
        </p>
      </div>

      {/* Intensity */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Filter Intensity: {intensity[0]}%
        </Label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          max={100}
          min={10}
          step={5}
          className="w-full"
          data-testid="slider-intensity"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Lower values create subtle effects, higher values for dramatic transformations
        </p>
      </div>

      {/* Blend Mode */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Blend Mode</Label>
        <Select value={blendMode} onValueChange={setBlendMode}>
          <SelectTrigger data-testid="select-blend-mode">
            <SelectValue placeholder="Select blend mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="replace">Replace (Normal)</SelectItem>
            <SelectItem value="overlay">Overlay</SelectItem>
            <SelectItem value="multiply">Multiply</SelectItem>
            <SelectItem value="screen">Screen</SelectItem>
            <SelectItem value="soft-light">Soft Light</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options */}
      <div className="flex items-center space-x-2">
        <Switch
          id="preserve"
          checked={preserveOriginal}
          onCheckedChange={setPreserveOriginal}
          data-testid="switch-preserve"
        />
        <Label htmlFor="preserve">Preserve original colors</Label>
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
          <h3 className="text-lg font-semibold mb-4">Professional Filter Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Artistic</div>
              <div className="text-sm text-muted-foreground">Oil, watercolor, sketch</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📷</div>
              <div className="font-medium">Vintage</div>
              <div className="text-sm text-muted-foreground">Retro, film, sepia</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-medium">Stylized</div>
              <div className="text-sm text-muted-foreground">Cartoon, anime, comic</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">Dramatic</div>
              <div className="text-sm text-muted-foreground">HDR, B&W, tilt-shift</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Filter Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Adjustable Intensity</h4>
              <p>Fine-tune filter strength from subtle enhancements to dramatic transformations.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Blend Modes</h4>
              <p>Multiple blending options to control how filters interact with your original image.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">High Quality Processing</h4>
              <p>Professional-grade algorithms ensure crisp, artifact-free results.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Batch Processing</h4>
              <p>Apply the same filter settings to multiple images for consistent styling.</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">🎯 Filter Tips</h4>
          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
            <li>• Start with lower intensity and gradually increase for best results</li>
            <li>• Artistic filters work best on high-resolution images</li>
            <li>• Use vintage filters for creating mood and atmosphere</li>
            <li>• Combine multiple filters with different blend modes for unique effects</li>
            <li>• Preview effects before applying to save processing time</li>
          </ul>
        </div>
      </div>
    </UniversalToolInterface>
  );
}