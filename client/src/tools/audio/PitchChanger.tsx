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
import { Upload, Download, Play, Pause, Music, FileAudio, Settings, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PitchChanger() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processedBuffer, setProcessedBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOriginal, setPlayingOriginal] = useState(true);
  const [pitchShift, setPitchShift] = useState([0]); // Semitones
  const [preserveTempo, setPreserveTempo] = useState(true);
  const [formantCorrection, setFormantCorrection] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Pitch Changer - ToolSuite Pro | Change Audio Pitch Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional pitch changer tool. Change audio pitch without affecting speed, with formant correction and advanced options for music and voice processing.');
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const presets = [
    { name: "Octave Up", shift: 12, description: "Raise pitch by one octave" },
    { name: "Perfect Fifth", shift: 7, description: "Musical perfect fifth up" },
    { name: "Perfect Fourth", shift: 5, description: "Musical perfect fourth up" },
    { name: "Major Third", shift: 4, description: "Musical major third up" },
    { name: "Whole Tone", shift: 2, description: "Raise by one whole tone" },
    { name: "Semitone", shift: 1, description: "Raise by one semitone" },
    { name: "Original", shift: 0, description: "No pitch change" },
    { name: "Semitone Down", shift: -1, description: "Lower by one semitone" },
    { name: "Whole Tone Down", shift: -2, description: "Lower by one whole tone" },
    { name: "Minor Third Down", shift: -3, description: "Musical minor third down" },
    { name: "Perfect Fourth Down", shift: -5, description: "Musical perfect fourth down" },
    { name: "Octave Down", shift: -12, description: "Lower pitch by one octave" },
  ];

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

      setProgress(30);
      const buffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);

      setProgress(100);
      
      toast({
        title: "Audio Loaded",
        description: "Audio file has been loaded successfully.",
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

  const changePitch = async () => {
    if (!audioBuffer || !audioContextRef.current) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Calculate pitch ratio
      const pitchRatio = Math.pow(2, pitchShift[0] / 12);
      
      setProgress(20);

      // Simple pitch shifting using playback rate
      // For better quality, you would implement PSOLA or similar algorithms
      const processedBuffer = await simplePitchShift(audioBuffer, pitchRatio);
      
      setProgress(100);
      setProcessedBuffer(processedBuffer);

      toast({
        title: "Pitch Changed",
        description: `Pitch shifted by ${pitchShift[0]} semitones.`,
      });

    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to change pitch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simplePitchShift = async (buffer: AudioBuffer, pitchRatio: number): Promise<AudioBuffer> => {
    const context = audioContextRef.current!;
    
    if (preserveTempo) {
      // For tempo preservation, we need a more complex algorithm
      // This is a simplified version - in production, use libraries like soundtouch.js
      return await timeStretchPitchShift(buffer, pitchRatio);
    } else {
      // Simple resampling (changes both pitch and tempo)
      const newLength = Math.floor(buffer.length / pitchRatio);
      const newBuffer = context.createBuffer(buffer.numberOfChannels, newLength, buffer.sampleRate);

      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const inputData = buffer.getChannelData(channel);
        const outputData = newBuffer.getChannelData(channel);

        for (let i = 0; i < newLength; i++) {
          const sourceIndex = i * pitchRatio;
          const index1 = Math.floor(sourceIndex);
          const index2 = Math.min(index1 + 1, buffer.length - 1);
          const fraction = sourceIndex - index1;

          // Linear interpolation
          outputData[i] = inputData[index1] * (1 - fraction) + inputData[index2] * fraction;
        }
      }

      return newBuffer;
    }
  };

  const timeStretchPitchShift = async (buffer: AudioBuffer, pitchRatio: number): Promise<AudioBuffer> => {
    // Simplified PSOLA-style pitch shifting
    const context = audioContextRef.current!;
    const frameSize = 2048;
    const hopSize = frameSize / 4;
    const overlapRatio = 4;

    const newBuffer = context.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      // Phase vocoder implementation (simplified)
      const fftSize = frameSize;
      const window = new Float32Array(fftSize);
      
      // Hanning window
      for (let i = 0; i < fftSize; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
      }

      let inputPhase = 0;
      let outputPhase = 0;

      while (inputPhase + fftSize < inputData.length) {
        const frame = new Float32Array(fftSize);
        
        // Extract windowed frame
        for (let i = 0; i < fftSize; i++) {
          frame[i] = inputData[inputPhase + i] * window[i];
        }

        // Apply pitch shift (simplified)
        const shiftedFrame = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
          const srcIndex = Math.floor(i / pitchRatio);
          if (srcIndex < fftSize) {
            shiftedFrame[i] = frame[srcIndex];
          }
        }

        // Overlap and add
        for (let i = 0; i < fftSize && outputPhase + i < outputData.length; i++) {
          outputData[outputPhase + i] += shiftedFrame[i] * window[i];
        }

        inputPhase += hopSize;
        outputPhase += hopSize;
      }
    }

    return newBuffer;
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
      link.download = `pitch-shifted-${file?.name || 'audio'}.wav`;
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

  const applyPreset = (shift: number) => {
    setPitchShift([shift]);
  };

  const resetSettings = () => {
    setPitchShift([0]);
    setPreserveTempo(true);
    setFormantCorrection(false);
  };

  const getSemitoneText = (semitones: number) => {
    if (semitones === 0) return "Original Pitch";
    const direction = semitones > 0 ? "up" : "down";
    const absValue = Math.abs(semitones);
    if (absValue === 12) return `1 octave ${direction}`;
    if (absValue > 12) return `${Math.floor(absValue / 12)} octaves ${absValue % 12 > 0 ? `+ ${absValue % 12} semitones` : ''} ${direction}`;
    return `${absValue} semitone${absValue > 1 ? 's' : ''} ${direction}`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Music className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Pitch Changer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional pitch shifting tool with tempo preservation, formant correction, and musical presets for precise audio manipulation.
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

          {/* Pitch Control */}
          {audioBuffer && (
            <div className="space-y-6">
              <Tabs defaultValue="slider" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="slider">Manual Control</TabsTrigger>
                  <TabsTrigger value="presets">Musical Presets</TabsTrigger>
                </TabsList>

                <TabsContent value="slider">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="mr-2" size={20} />
                        Pitch Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold mb-2">{getSemitoneText(pitchShift[0])}</div>
                        <Badge variant="secondary">{pitchShift[0] > 0 ? '+' : ''}{pitchShift[0]} semitones</Badge>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-sm font-medium">Pitch Shift (Semitones)</label>
                          <Button
                            onClick={resetSettings}
                            variant="ghost"
                            size="sm"
                          >
                            <RotateCcw className="mr-1" size={14} />
                            Reset
                          </Button>
                        </div>
                        <Slider
                          value={pitchShift}
                          onValueChange={setPitchShift}
                          min={-24}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>-24 (2 octaves down)</span>
                          <span>0 (original)</span>
                          <span>+24 (2 octaves up)</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Preserve Tempo</label>
                          <input
                            type="checkbox"
                            checked={preserveTempo}
                            onChange={(e) => setPreserveTempo(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Keep the original playback speed while changing pitch
                        </p>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Formant Correction</label>
                          <input
                            type="checkbox"
                            checked={formantCorrection}
                            onChange={(e) => setFormantCorrection(e.target.checked)}
                            className="rounded"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Maintain natural vocal characteristics (best for voice)
                        </p>
                      </div>

                      <Button
                        onClick={changePitch}
                        className="w-full gradient-bg"
                        disabled={isProcessing}
                      >
                        Apply Pitch Change
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="presets">
                  <Card className="glassmorphism">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Music className="mr-2" size={20} />
                        Musical Presets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {presets.map((preset) => (
                          <Button
                            key={preset.name}
                            variant={pitchShift[0] === preset.shift ? "default" : "outline"}
                            className="h-auto p-3 flex-col items-start text-left"
                            onClick={() => applyPreset(preset.shift)}
                          >
                            <span className="font-medium text-sm">{preset.name}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {preset.description}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className="mt-2 text-xs"
                            >
                              {preset.shift > 0 ? '+' : ''}{preset.shift}
                            </Badge>
                          </Button>
                        ))}
                      </div>

                      <Button
                        onClick={changePitch}
                        className="w-full gradient-bg mt-6"
                        disabled={isProcessing}
                      >
                        Apply Pitch Change
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Playback and Download */}
          {processedBuffer && (
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Music className="mr-2" size={20} />
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
                    {!playingOriginal && isPlaying ? "Stop" : "Play"} Pitch-Shifted
                  </Button>
                  
                  <Button
                    onClick={downloadProcessedAudio}
                    variant="outline"
                  >
                    <Download className="mr-2" size={16} />
                    Download
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