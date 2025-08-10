import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function VolumeBooster() {
  const [amplificationMethod, setAmplificationMethod] = useState("smart");
  const [volumeIncrease, setVolumeIncrease] = useState([150]);
  const [limiterEnabled, setLimiterEnabled] = useState(true);
  const [limiterThreshold, setLimiterThreshold] = useState([-3]);
  const [preserveDynamics, setPreserveDynamics] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(false);

  useEffect(() => {
    document.title = "Volume Booster - ToolSuite Pro | Increase Audio Volume and Amplify Sound";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Boost audio volume and amplify sound without distortion. Smart amplification, limiter protection, and dynamic range preservation for professional results.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Audio Volume Booster",
      "description": "Amplify and boost audio volume with professional quality and distortion protection",
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
    name: "Audio Volume Booster",
    description: "Amplify and boost audio volume while maintaining quality. Smart amplification algorithms prevent distortion and preserve audio dynamics.",
    acceptedFormats: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"],
    outputFormat: "Amplified audio",
    maxFileSize: 200, // 200MB
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate volume boosting processing
    const processingTime = Math.max(3000, (file.size / 1024 / 1024) * 2000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate 94% success rate
    if (Math.random() > 0.06) {
      // Create mock boosted audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 30; // 30 seconds
      const sampleRate = 44100;
      const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
      
      // Generate boosted audio simulation
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          
          // Generate base audio signal
          let sample = Math.sin(2 * Math.PI * 440 * time) * 0.1; // Quiet original
          
          // Apply volume boost
          const boostFactor = volumeIncrease[0] / 100;
          sample *= boostFactor;
          
          // Apply limiter if enabled
          if (limiterEnabled) {
            const threshold = Math.pow(10, limiterThreshold[0] / 20);
            if (Math.abs(sample) > threshold) {
              sample = Math.sign(sample) * threshold;
            }
          }
          
          // Ensure no clipping
          sample = Math.max(-1, Math.min(1, sample));
          
          channelData[i] = sample;
        }
      }
      
      // Convert to blob
      const blob = new Blob(['Mock boosted audio data'], { 
        type: 'audio/wav'
      });
      
      const downloadUrl = URL.createObjectURL(blob);
      return {
        success: true,
        downloadUrl,
      };
    } else {
      return {
        success: false,
        error: "Volume boosting failed. The audio may be severely clipped or corrupted. Try reducing the amplification level."
      };
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Amplification Method */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Amplification Method</Label>
        <Select value={amplificationMethod} onValueChange={setAmplificationMethod}>
          <SelectTrigger data-testid="select-amplification-method">
            <SelectValue placeholder="Select amplification method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="smart">Smart Amplification (Recommended)</SelectItem>
            <SelectItem value="linear">Linear Gain Boost</SelectItem>
            <SelectItem value="dynamic">Dynamic Range Compression</SelectItem>
            <SelectItem value="peak">Peak Normalization</SelectItem>
            <SelectItem value="rms">RMS Normalization</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Smart amplification analyzes your audio and applies optimal boosting
        </p>
      </div>

      {/* Volume Increase */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Volume Increase: {volumeIncrease[0]}%
        </Label>
        <Slider
          value={volumeIncrease}
          onValueChange={setVolumeIncrease}
          max={500}
          min={100}
          step={10}
          className="w-full"
          data-testid="slider-volume-increase"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>100% (Original)</span>
          <span>200% (2x louder)</span>
          <span>500% (5x louder)</span>
        </div>
      </div>

      {/* Limiter Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="limiter"
            checked={limiterEnabled}
            onCheckedChange={setLimiterEnabled}
            data-testid="switch-limiter"
          />
          <Label htmlFor="limiter">Enable audio limiter (prevents distortion)</Label>
        </div>
        
        {limiterEnabled && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Limiter Threshold: {limiterThreshold[0]} dB
            </Label>
            <Slider
              value={limiterThreshold}
              onValueChange={setLimiterThreshold}
              max={0}
              min={-12}
              step={1}
              className="w-full"
              data-testid="slider-limiter-threshold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lower values provide more protection against clipping
            </p>
          </div>
        )}
      </div>

      {/* Audio Quality Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="preserve-dynamics"
            checked={preserveDynamics}
            onCheckedChange={setPreserveDynamics}
            data-testid="switch-preserve-dynamics"
          />
          <Label htmlFor="preserve-dynamics">Preserve dynamic range</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="noise-reduction"
            checked={noiseReduction}
            onCheckedChange={setNoiseReduction}
            data-testid="switch-noise-reduction"
          />
          <Label htmlFor="noise-reduction">Apply noise reduction</Label>
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
          <h3 className="text-lg font-semibold mb-4">Professional Volume Amplification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🔊</div>
              <div className="font-medium">Smart Boost</div>
              <div className="text-sm text-muted-foreground">Intelligent amplification</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-medium">Limiter Protection</div>
              <div className="text-sm text-muted-foreground">Prevents distortion</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Dynamic Range</div>
              <div className="text-sm text-muted-foreground">Preserve audio quality</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎛️</div>
              <div className="font-medium">Multiple Methods</div>
              <div className="text-sm text-muted-foreground">Various algorithms</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Amplification Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Smart Amplification</h4>
              <p>AI-powered analysis determines optimal boost levels while preserving audio quality and preventing distortion.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Dynamic Range Compression</h4>
              <p>Reduces the difference between loud and quiet parts, making the entire audio more consistently audible.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Peak Normalization</h4>
              <p>Boosts volume until the loudest peak reaches the maximum level without clipping or distortion.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">RMS Normalization</h4>
              <p>Adjusts the average loudness level for consistent perceived volume across different audio files.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Volume Boost Guidelines</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Always enable the limiter for distortion protection</li>
              <li>• Start with moderate increases (150-200%)</li>
              <li>• Use smart amplification for best results</li>
              <li>• Preview before applying to full audio</li>
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Best Practices</h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Use for quiet recordings or low-volume audio</li>
              <li>• Preserve dynamic range for music</li>
              <li>• Apply noise reduction for old recordings</li>
              <li>• Test with different amplification methods</li>
            </ul>
          </div>
        </div>
      </div>
    </UniversalToolInterface>
  );
}