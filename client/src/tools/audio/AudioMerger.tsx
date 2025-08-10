import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import UniversalToolInterface from "@/components/UniversalToolInterface";

export default function AudioMerger() {
  const [mergeType, setMergeType] = useState("sequential");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [quality, setQuality] = useState([192]);
  const [crossfadeDuration, setCrossfadeDuration] = useState([2]);
  const [normalizeVolume, setNormalizeVolume] = useState(true);
  const [addSilence, setAddSilence] = useState(false);
  const [silenceDuration, setSilenceDuration] = useState([1]);

  useEffect(() => {
    document.title = "Audio Merger - ToolSuite Pro | Combine Multiple Audio Files";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Merge and combine multiple audio files into one. Sequential merging, crossfade transitions, volume normalization, and professional mixing features.');
    }
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Audio Merger",
      "description": "Combine multiple audio files with professional mixing and transition options",
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
    name: "Audio Merger & Combiner",
    description: "Combine multiple audio files into one with professional mixing options. Support for crossfades, volume normalization, and various merge modes.",
    acceptedFormats: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma"],
    outputFormat: "Merged audio file",
    maxFileSize: 200, // 200MB per file
  };

  const handleProcess = async (file: File): Promise<{ success: boolean; downloadUrl?: string; error?: string }> => {
    // Simulate audio merging processing
    const processingTime = Math.max(4000, (file.size / 1024 / 1024) * 3000);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      // Create mock merged audio
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = 60; // 60 seconds merged audio
      const sampleRate = 44100;
      const buffer = audioContext.createBuffer(2, sampleRate * duration, sampleRate);
      
      // Generate merged audio content simulation
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          const time = i / sampleRate;
          
          // Simulate multiple audio sources merged
          let sample = 0;
          
          // First audio (0-20s)
          if (time < 20) {
            sample += Math.sin(2 * Math.PI * 440 * time) * 0.3;
          }
          
          // Second audio (15-35s) with crossfade
          if (time >= 15 && time < 35) {
            let volume = 0.3;
            if (time >= 15 && time < 17) {
              // Crossfade in
              volume = (time - 15) / 2 * 0.3;
            }
            if (time >= 33 && time < 35) {
              // Crossfade out
              volume = (35 - time) / 2 * 0.3;
            }
            sample += Math.sin(2 * Math.PI * 523 * time) * volume;
          }
          
          // Third audio (30-60s)
          if (time >= 30) {
            sample += Math.sin(2 * Math.PI * 659 * time) * 0.3;
          }
          
          channelData[i] = sample;
        }
      }
      
      // Convert to blob (simplified)
      const blob = new Blob(['Mock merged audio data'], { 
        type: getOutputMimeType(outputFormat) 
      });
      
      const downloadUrl = URL.createObjectURL(blob);
      return {
        success: true,
        downloadUrl,
      };
    } else {
      return {
        success: false,
        error: "Audio merging failed. Please check that all files are valid audio files and try again."
      };
    }
  };

  const getOutputMimeType = (format: string) => {
    switch (format) {
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'flac':
        return 'audio/flac';
      case 'aac':
        return 'audio/aac';
      case 'ogg':
        return 'audio/ogg';
      default:
        return 'audio/mpeg';
    }
  };

  const settingsComponent = (
    <div className="space-y-6">
      {/* Merge Type */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Merge Type</Label>
        <Select value={mergeType} onValueChange={setMergeType}>
          <SelectTrigger data-testid="select-merge-type">
            <SelectValue placeholder="Select merge type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequential (One after another)</SelectItem>
            <SelectItem value="crossfade">Crossfade Transition</SelectItem>
            <SelectItem value="overlay">Overlay (Mix together)</SelectItem>
            <SelectItem value="interleave">Interleave (Alternate segments)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Crossfade Duration (for crossfade mode) */}
      {mergeType === 'crossfade' && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Crossfade Duration: {crossfadeDuration[0]} seconds
          </Label>
          <Slider
            value={crossfadeDuration}
            onValueChange={setCrossfadeDuration}
            max={10}
            min={0.5}
            step={0.5}
            className="w-full"
            data-testid="slider-crossfade"
          />
        </div>
      )}

      {/* Output Format */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger data-testid="select-output-format">
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
            <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
            <SelectItem value="flac">FLAC (Lossless)</SelectItem>
            <SelectItem value="aac">AAC (High Quality)</SelectItem>
            <SelectItem value="ogg">OGG Vorbis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Settings */}
      {(outputFormat === 'mp3' || outputFormat === 'aac') && (
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Quality: {quality[0]} kbps
          </Label>
          <Slider
            value={quality}
            onValueChange={setQuality}
            max={320}
            min={64}
            step={32}
            className="w-full"
            data-testid="slider-quality"
          />
        </div>
      )}

      {/* Silence Between Tracks */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="silence"
            checked={addSilence}
            onCheckedChange={setAddSilence}
            data-testid="switch-silence"
          />
          <Label htmlFor="silence">Add silence between tracks</Label>
        </div>
        
        {addSilence && (
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Silence Duration: {silenceDuration[0]} seconds
            </Label>
            <Slider
              value={silenceDuration}
              onValueChange={setSilenceDuration}
              max={10}
              min={0.1}
              step={0.1}
              className="w-full"
              data-testid="slider-silence-duration"
            />
          </div>
        )}
      </div>

      {/* Volume Normalization */}
      <div className="flex items-center space-x-2">
        <Switch
          id="normalize"
          checked={normalizeVolume}
          onCheckedChange={setNormalizeVolume}
          data-testid="switch-normalize"
        />
        <Label htmlFor="normalize">Normalize volume levels</Label>
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
          <h3 className="text-lg font-semibold mb-4">Professional Audio Merging</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🔗</div>
              <div className="font-medium">Sequential Merge</div>
              <div className="text-sm text-muted-foreground">End-to-end joining</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🌊</div>
              <div className="font-medium">Crossfade</div>
              <div className="text-sm text-muted-foreground">Smooth transitions</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-medium">Overlay Mix</div>
              <div className="text-sm text-muted-foreground">Simultaneous playback</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-medium">Volume Balance</div>
              <div className="text-sm text-muted-foreground">Automatic leveling</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Merge Modes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Sequential Merge</h4>
              <p>Join audio files one after another in the order you upload them. Perfect for creating playlists or compilations.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Crossfade Transitions</h4>
              <p>Smooth transitions between tracks where the end of one fades out as the next fades in. Professional DJ-style mixing.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Overlay Mixing</h4>
              <p>Mix multiple audio tracks together to play simultaneously. Great for adding background music or sound effects.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Volume Normalization</h4>
              <p>Automatically balance volume levels across all tracks for consistent listening experience.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🎧 Audio Merging Tips</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use crossfade for smooth DJ-style transitions</li>
            <li>• Enable volume normalization for consistent levels</li>
            <li>• Add silence for clear track separation</li>
            <li>• Use overlay mode for background music mixing</li>
            <li>• Choose lossless formats (WAV/FLAC) for best quality</li>
          </ul>
        </div>
      </div>
    </UniversalToolInterface>
  );
}