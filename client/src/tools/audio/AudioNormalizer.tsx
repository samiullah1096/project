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
import { Upload, Download, Play, Pause, Volume2, BarChart3, FileAudio, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioAnalysis {
  maxAmplitude: number;
  rmsLevel: number;
  peakLevel: number;
  dynamicRange: number;
  clippingDetected: boolean;
  suggestedGain: number;
}

export default function AudioNormalizer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOriginal, setPlayingOriginal] = useState(true);
  const [targetLevel, setTargetLevel] = useState([-12]); // -12dB LUFS target
  const [presetMode, setPresetMode] = useState("music");
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Audio Normalizer - ToolSuite Pro | Normalize Audio Levels Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional audio normalizer tool. Normalize audio levels, analyze dynamic range, and ensure consistent volume across your audio files.');
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const presets = {
    music: { target: -12, name: "Music", description: "Standard music normalization" },
    podcast: { target: -16, name: "Podcast", description: "Optimized for speech content" },
    broadcast: { target: -23, name: "Broadcast", description: "Broadcasting standards (EBU R128)" },
    mastering: { target: -14, name: "Mastering", description: "Music mastering levels" },
    streaming: { target: -14, name: "Streaming", description: "Optimized for streaming platforms" },
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
    setAnalysis(null);
    setProgress(0);
    
    await processAudio(uploadedFile);
  };

  const processAudio = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Decode audio
      setProgress(20);
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      // Analyze audio
      setProgress(40);
      const audioAnalysis = analyzeAudio(buffer);
      setAnalysis(audioAnalysis);

      // Normalize audio
      setProgress(60);
      const normalized = normalizeAudio(buffer, targetLevel[0]);
      setProcessedBuffer(normalized);

      setProgress(100);
      
      toast({
        title: "Audio Normalized",
        description: "Your audio has been successfully normalized.",
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process audio file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeAudio = (buffer: AudioBuffer): AudioAnalysis => {
    const channelData = buffer.getChannelData(0);
    let maxAmplitude = 0;
    let sumSquares = 0;
    let clippingCount = 0;

    // Analyze audio data
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.abs(channelData[i]);
      maxAmplitude = Math.max(maxAmplitude, sample);
      sumSquares += sample * sample;
      
      if (sample >= 0.99) {
        clippingCount++;
      }
    }

    const rmsLevel = Math.sqrt(sumSquares / channelData.length);
    const peakLevel = 20 * Math.log10(maxAmplitude);
    const rmsDb = 20 * Math.log10(rmsLevel);
    const dynamicRange = peakLevel - rmsDb;
    const clippingDetected = (clippingCount / channelData.length) > 0.001; // More than 0.1% clipped
    const suggestedGain = targetLevel[0] - peakLevel;

    return {
      maxAmplitude,
      rmsLevel,
      peakLevel,
      dynamicRange,
      clippingDetected,
      suggestedGain
    };
  };

  const normalizeAudio = (buffer: AudioBuffer, targetDb: number): AudioBuffer => {
    const normalizedBuffer = audioContextRef.current!.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = normalizedBuffer.getChannelData(channel);
      
      // Find peak
      let peak = 0;
      for (let i = 0; i < inputData.length; i++) {
        peak = Math.max(peak, Math.abs(inputData[i]));
      }

      // Calculate gain to reach target level
      const targetLinear = Math.pow(10, targetDb / 20);
      const gain = peak > 0 ? targetLinear / peak : 1;

      // Apply normalization with soft limiting
      for (let i = 0; i < inputData.length; i++) {
        let normalized = inputData[i] * gain;
        
        // Soft limiting to prevent clipping
        if (Math.abs(normalized) > 0.95) {
          normalized = Math.sign(normalized) * (0.95 - (0.95 - Math.abs(normalized)) * 0.1);
        }
        
        outputData[i] = normalized;
      }
    }

    return normalizedBuffer;
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

  const downloadNormalizedAudio = async () => {
    if (!processedBuffer) return;

    try {
      // Convert AudioBuffer to WAV
      const wav = audioBufferToWav(processedBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `normalized-${file?.name || 'audio'}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download normalized audio.",
        variant: "destructive",
      });
    }
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const blockAlign = numberOfChannels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = buffer.length * blockAlign;

    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    // WAV header
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

    // Audio data
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
    setTargetLevel([preset.target]);
    setPresetMode(presetKey);
    
    if (audioBuffer) {
      processAudio(file!);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Audio Normalizer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional audio normalization tool with advanced analysis, presets for different content types, and precise level control.
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
                    {audioBuffer && (
                      <Badge variant="secondary">
                        {audioBuffer.duration.toFixed(1)}s • {audioBuffer.sampleRate}Hz
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing audio...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings and Analysis */}
          {audioBuffer && (
            <Tabs defaultValue="presets" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="custom">Custom Settings</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="presets">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2" size={20} />
                      Quick Presets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(presets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant={presetMode === key ? "default" : "outline"}
                          className="h-auto p-4 flex-col items-start"
                          onClick={() => applyPreset(key)}
                        >
                          <span className="font-medium">{preset.name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {preset.description}
                          </span>
                          <Badge variant="secondary" className="mt-2">
                            {preset.target}dB LUFS
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2" size={20} />
                      Custom Normalization Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Target Level (LUFS)</label>
                        <span className="text-sm text-muted-foreground">{targetLevel[0]}dB</span>
                      </div>
                      <Slider
                        value={targetLevel}
                        onValueChange={setTargetLevel}
                        min={-30}
                        max={-6}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>-30dB (Quiet)</span>
                        <span>-6dB (Loud)</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => processAudio(file!)}
                      className="w-full gradient-bg"
                      disabled={isProcessing}
                    >
                      Apply Custom Settings
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                {analysis && (
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2" size={20} />
                        Audio Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{analysis.peakLevel.toFixed(1)}dB</p>
                          <p className="text-sm text-muted-foreground">Peak Level</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{(20 * Math.log10(analysis.rmsLevel)).toFixed(1)}dB</p>
                          <p className="text-sm text-muted-foreground">RMS Level</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{analysis.dynamicRange.toFixed(1)}dB</p>
                          <p className="text-sm text-muted-foreground">Dynamic Range</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold">{analysis.suggestedGain.toFixed(1)}dB</p>
                          <p className="text-sm text-muted-foreground">Suggested Gain</p>
                        </div>
                      </div>

                      {analysis.clippingDetected && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <p className="text-destructive font-medium">⚠ Clipping Detected</p>
                          <p className="text-sm text-muted-foreground">
                            The original audio contains clipped samples that may affect quality.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
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
                    {!playingOriginal && isPlaying ? "Stop" : "Play"} Normalized
                  </Button>
                  
                  <Button
                    onClick={downloadNormalizedAudio}
                    variant="outline"
                  >
                    <Download className="mr-2" size={16} />
                    Download Normalized
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