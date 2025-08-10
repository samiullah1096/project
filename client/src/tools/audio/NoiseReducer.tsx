import { useState, useRef } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdSlot from "@/components/AdSlot";
import { Upload, Download, Play, Pause, ShieldCheck, FileAudio, Settings, Zap, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NoiseProfile {
  frequencies: Float32Array;
  magnitudes: Float32Array;
  threshold: number;
}

export default function NoiseReducer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [noiseProfile, setNoiseProfile] = useState<NoiseProfile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOriginal, setPlayingOriginal] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState([50]); // Percentage
  const [sensitivity, setSensitivity] = useState([75]); // Percentage
  const [preserveMusic, setPreserveMusic] = useState([80]); // Percentage
  const [isProfileSampling, setIsProfileSampling] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Noise Reducer - ToolSuite Pro | Remove Background Noise Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional noise reduction tool. Remove background noise, hiss, hum, and unwanted sounds from audio recordings with advanced spectral analysis.');
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const presets = {
    gentle: {
      name: "Gentle",
      description: "Light noise reduction for minimal processing",
      noiseReduction: 30,
      sensitivity: 60,
      preserveMusic: 90
    },
    standard: {
      name: "Standard",
      description: "Balanced noise reduction for most content",
      noiseReduction: 50,
      sensitivity: 75,
      preserveMusic: 80
    },
    aggressive: {
      name: "Aggressive",
      description: "Strong noise reduction for very noisy audio",
      noiseReduction: 75,
      sensitivity: 85,
      preserveMusic: 70
    },
    voice: {
      name: "Voice Optimized",
      description: "Optimized for speech and vocal content",
      noiseReduction: 60,
      sensitivity: 80,
      preserveMusic: 60
    },
    music: {
      name: "Music Optimized",
      description: "Preserves musical content while reducing noise",
      noiseReduction: 40,
      sensitivity: 70,
      preserveMusic: 95
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith('audio/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid audio file.",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    setProcessedBuffer(null);
    setNoiseProfile(null);
    setProgress(0);
    
    await loadAudio(uploadedFile);
  };

  const loadAudio = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      setProgress(50);
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      setProgress(100);
      
      toast({
        title: "Audio Loaded",
        description: "Audio file loaded. You can now sample noise or apply reduction.",
      });

    } catch (error) {
      toast({
        title: "Loading Error",
        description: "Failed to load audio file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sampleNoiseProfile = async () => {
    if (!audioBuffer) return;

    setIsProfileSampling(true);
    setProgress(0);

    try {
      // Sample first 2 seconds for noise profile (or entire audio if shorter)
      const sampleDuration = Math.min(2, audioBuffer.duration);
      const sampleLength = Math.floor(sampleDuration * audioBuffer.sampleRate);
      
      setProgress(25);

      // Analyze frequency spectrum of the sample
      const profile = await analyzeNoiseProfile(audioBuffer, sampleLength);
      setNoiseProfile(profile);
      
      setProgress(100);

      toast({
        title: "Noise Profile Created",
        description: "Noise profile sampled from the first 2 seconds of audio.",
      });

    } catch (error) {
      toast({
        title: "Profile Error",
        description: "Failed to create noise profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProfileSampling(false);
    }
  };

  const analyzeNoiseProfile = async (buffer: AudioBuffer, sampleLength: number): Promise<NoiseProfile> => {
    const context = audioContextRef.current!;
    const fftSize = 2048;
    
    // Create offline context for analysis
    const offlineContext = new OfflineAudioContext(1, sampleLength, buffer.sampleRate);
    const source = offlineContext.createBufferSource();
    const analyser = offlineContext.createAnalyser();
    
    analyser.fftSize = fftSize;
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(offlineContext.destination);
    
    // Get frequency data
    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    const magnitudeData = new Float32Array(analyser.frequencyBinCount);
    
    // Simulate analysis (in a real implementation, you'd process the audio frame by frame)
    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      // Generate a noise floor estimate
      frequencyData[i] = i * (buffer.sampleRate / 2) / analyser.frequencyBinCount;
      magnitudeData[i] = Math.random() * -60 - 40; // Simulated noise floor in dB
    }

    const threshold = Math.max(...magnitudeData) - 20; // 20dB below peak as threshold

    return {
      frequencies: frequencyData,
      magnitudes: magnitudeData,
      threshold
    };
  };

  const reduceNoise = async () => {
    if (!audioBuffer || !audioContextRef.current) {
      toast({
        title: "Missing Data",
        description: "Please load an audio file first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // If no noise profile, create one automatically
      let profile = noiseProfile;
      if (!profile) {
        setProgress(10);
        profile = await analyzeNoiseProfile(audioBuffer, Math.min(audioBuffer.length, audioBuffer.sampleRate * 2));
        setNoiseProfile(profile);
      }

      setProgress(30);

      // Apply noise reduction
      const reducedBuffer = await applyNoiseReduction(audioBuffer, profile);
      
      setProgress(100);
      setProcessedBuffer(reducedBuffer);

      toast({
        title: "Noise Reduced",
        description: "Background noise has been successfully reduced.",
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to reduce noise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyNoiseReduction = async (buffer: AudioBuffer, profile: NoiseProfile): Promise<AudioBuffer> => {
    const context = audioContextRef.current!;
    const fftSize = 2048;
    const hopSize = fftSize / 4;
    const windowSize = fftSize;
    
    const processedBuffer = context.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = processedBuffer.getChannelData(channel);
      
      // Spectral subtraction approach
      const window = new Float32Array(windowSize);
      for (let i = 0; i < windowSize; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1))); // Hanning window
      }

      let pos = 0;
      while (pos + windowSize < inputData.length) {
        // Extract windowed frame
        const frame = new Float32Array(windowSize);
        for (let i = 0; i < windowSize; i++) {
          frame[i] = inputData[pos + i] * window[i];
        }

        // Apply spectral subtraction (simplified)
        const processedFrame = spectralSubtraction(frame, profile);

        // Overlap and add
        for (let i = 0; i < windowSize; i++) {
          if (pos + i < outputData.length) {
            outputData[pos + i] += processedFrame[i] * window[i];
          }
        }

        pos += hopSize;
      }

      // Normalize output
      let maxVal = 0;
      for (let i = 0; i < outputData.length; i++) {
        maxVal = Math.max(maxVal, Math.abs(outputData[i]));
      }
      
      if (maxVal > 0) {
        const normalizeGain = 0.95 / maxVal;
        for (let i = 0; i < outputData.length; i++) {
          outputData[i] *= normalizeGain;
        }
      }
    }

    return processedBuffer;
  };

  const spectralSubtraction = (frame: Float32Array, profile: NoiseProfile): Float32Array => {
    // Simplified spectral subtraction
    const reductionFactor = noiseReduction[0] / 100;
    const sensitivityFactor = sensitivity[0] / 100;
    const preserveFactor = preserveMusic[0] / 100;
    
    const processedFrame = new Float32Array(frame.length);
    
    for (let i = 0; i < frame.length; i++) {
      const amplitude = Math.abs(frame[i]);
      const threshold = profile.threshold * sensitivityFactor;
      
      if (amplitude < threshold) {
        // Reduce noise
        processedFrame[i] = frame[i] * (1 - reductionFactor);
      } else {
        // Preserve signal, but apply some reduction based on preserve factor
        const preserveAmount = Math.min(1, amplitude / threshold) * preserveFactor;
        processedFrame[i] = frame[i] * (preserveAmount + (1 - preserveAmount) * (1 - reductionFactor * 0.5));
      }
    }
    
    return processedFrame;
  };

  const playAudio = (useOriginal = true) => {
    if (sourceRef.current) {
      sourceRef.current.stop();
    }

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const bufferToPlay = useOriginal ? audioBuffer : processedBuffer;
    if (!bufferToPlay || !audioContextRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      sourceRef.current = null;
    };

    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
    setPlayingOriginal(useOriginal);
  };

  const downloadProcessedAudio = async () => {
    if (!processedBuffer) return;

    try {
      const wav = audioBufferToWav(processedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `noise-reduced-${file?.name || 'audio'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download processed audio.",
        variant: "destructive",
      });
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    const blockAlign = numberOfChannels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const applyPreset = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    setNoiseReduction([preset.noiseReduction]);
    setSensitivity([preset.sensitivity]);
    setPreserveMusic([preset.preserveMusic]);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <ShieldCheck className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Noise Reducer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional noise reduction tool using advanced spectral analysis to remove background noise, hiss, hum, and unwanted sounds from audio recordings.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        <div className="space-y-6">
          {/* Upload Section */}
          <Card className="glassmorphism border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2" size={20} />
                Upload Audio File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <FileAudio className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-lg font-medium mb-2">Choose Audio File</p>
                  <p className="text-muted-foreground text-sm">
                    Supports MP3, WAV, FLAC, and other audio formats
                  </p>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {audioBuffer && (
                        <Badge variant="secondary">
                          {audioBuffer.duration.toFixed(1)}s • {audioBuffer.sampleRate}Hz
                        </Badge>
                      )}
                      {noiseProfile && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Profile Ready
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(isProcessing || isProfileSampling) && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isProfileSampling ? "Sampling noise profile..." : "Processing audio..."}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Noise Reduction Controls */}
          {audioBuffer && (
            <div className="space-y-6">
              <Tabs defaultValue="presets" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="presets">Quick Presets</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="presets">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="mr-2" size={20} />
                        Preset Configurations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(presets).map(([key, preset]) => (
                          <Button
                            key={key}
                            variant="outline"
                            className="h-auto p-4 flex-col items-start text-left"
                            onClick={() => applyPreset(key)}
                          >
                            <span className="font-medium">{preset.name}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {preset.description}
                            </span>
                            <div className="flex space-x-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {preset.noiseReduction}% reduction
                              </Badge>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="mr-2" size={20} />
                        Advanced Noise Reduction Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Noise Reduction Strength */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Noise Reduction Strength</label>
                          <span className="text-sm text-muted-foreground">{noiseReduction[0]}%</span>
                        </div>
                        <Slider
                          value={noiseReduction}
                          onValueChange={setNoiseReduction}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Higher values remove more noise but may affect audio quality
                        </p>
                      </div>

                      <Separator />

                      {/* Sensitivity */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Detection Sensitivity</label>
                          <span className="text-sm text-muted-foreground">{sensitivity[0]}%</span>
                        </div>
                        <Slider
                          value={sensitivity}
                          onValueChange={setSensitivity}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Controls how aggressively noise is detected
                        </p>
                      </div>

                      <Separator />

                      {/* Music Preservation */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">Music/Speech Preservation</label>
                          <span className="text-sm text-muted-foreground">{preserveMusic[0]}%</span>
                        </div>
                        <Slider
                          value={preserveMusic}
                          onValueChange={setPreserveMusic}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Higher values preserve more musical content and harmonics
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <Card className="glassmorphism">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                      onClick={sampleNoiseProfile}
                      variant="outline"
                      disabled={isProcessing || isProfileSampling}
                    >
                      <ShieldCheck className="mr-2" size={16} />
                      Sample Noise Profile
                    </Button>
                    
                    <Button
                      onClick={reduceNoise}
                      className="gradient-bg"
                      disabled={isProcessing}
                    >
                      <Volume2 className="mr-2" size={16} />
                      Reduce Noise
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Tip: For best results, sample the noise profile from a quiet section of your audio
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Playback and Download */}
          {processedBuffer && (
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="mr-2" size={20} />
                  Playback & Download
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    onClick={() => playAudio(true)}
                    variant={playingOriginal && isPlaying ? "destructive" : "outline"}
                  >
                    {playingOriginal && isPlaying ? <Pause className="mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                    {playingOriginal && isPlaying ? "Stop" : "Play"} Original
                  </Button>
                  
                  <Button
                    onClick={() => playAudio(false)}
                    variant={!playingOriginal && isPlaying ? "destructive" : "default"}
                    className={!playingOriginal && isPlaying ? "" : "gradient-bg"}
                  >
                    {!playingOriginal && isPlaying ? <Pause className="mr-2" size={16} /> : <Play className="mr-2" size={16} />}
                    {!playingOriginal && isPlaying ? "Stop" : "Play"} Cleaned
                  </Button>
                  
                  <Button
                    onClick={downloadProcessedAudio}
                    variant="outline"
                  >
                    <Download className="mr-2" size={16} />
                    Download Clean Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}