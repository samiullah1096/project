import { useState, useRef } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/AdSlot";
import { Volume2, Play, Pause, Download, Settings, Type, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Voice {
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  quality: 'standard' | 'premium';
}

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Text to Speech Converter - ToolSuite Pro | Convert Text to Audio";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional text-to-speech converter with multiple voices, speed control, and download options. Convert any text to natural-sounding speech online.');
    }

    // Load voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  const getVoicesByLanguage = () => {
    const grouped: { [key: string]: SpeechSynthesisVoice[] } = {};
    voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      if (!grouped[lang]) {
        grouped[lang] = [];
      }
      grouped[lang].push(voice);
    });
    return grouped;
  };

  const playText = () => {
    if (!text.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];
    utterance.volume = volume[0];

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      toast({
        title: "Speech Error",
        description: "Failed to convert text to speech. Please try again.",
        variant: "destructive",
      });
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pauseText = () => {
    speechSynthesis.pause();
    setIsPaused(true);
  };

  const stopText = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const downloadAudio = async () => {
    if (!text.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to download as audio.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use Web Audio API to capture speech synthesis
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `speech-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = rate[0];
      utterance.pitch = pitch[0];
      utterance.volume = volume[0];

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      };

      speechSynthesis.speak(utterance);

      toast({
        title: "Generating Audio",
        description: "Your audio file will download shortly.",
      });

    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to generate audio file. Your browser may not support this feature.",
        variant: "destructive",
      });
    }
  };

  const presetTexts = [
    "Hello, welcome to our text-to-speech service. This is a sample of how your text will sound.",
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "Good morning! I hope you're having a wonderful day. This is a test of our speech synthesis technology.",
    "Testing different emotions: I'm excited about this new feature! Are you ready to try it out?",
  ];

  const getLanguageName = (code: string) => {
    const names: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'pl': 'Polish',
      'tr': 'Turkish',
    };
    return names[code] || code.toUpperCase();
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Volume2 className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Text to Speech</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Convert any text to natural-sounding speech with customizable voice options, speed control, and download capabilities.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <div className="lg:col-span-2">
            <Card className="glassmorphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Type className="mr-2" size={20} />
                  Text Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your text here to convert to speech..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{text.length}/5000 characters</span>
                  <span>{text.split(' ').filter(word => word.length > 0).length} words</span>
                </div>

                <Separator />

                {/* Preset Texts */}
                <div>
                  <h4 className="font-medium mb-2">Quick Test Phrases:</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {presetTexts.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto p-3"
                        onClick={() => setText(preset)}
                      >
                        <span className="truncate">{preset}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Voice Settings */}
          <div className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Object.entries(getVoicesByLanguage()).map(([lang, langVoices]) => (
                        <div key={lang}>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-b">
                            {getLanguageName(lang)}
                          </div>
                          {langVoices.map((voice) => (
                            <SelectItem key={voice.name} value={voice.name}>
                              <div className="flex items-center justify-between w-full">
                                <span>{voice.name.split('- ')[0] || voice.name}</span>
                                {voice.localService && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Local</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Speed Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Speech Rate</label>
                    <span className="text-sm text-muted-foreground">{rate[0]}x</span>
                  </div>
                  <Slider
                    value={rate}
                    onValueChange={setRate}
                    min={0.1}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Pitch Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Pitch</label>
                    <span className="text-sm text-muted-foreground">{pitch[0]}</span>
                  </div>
                  <Slider
                    value={pitch}
                    onValueChange={setPitch}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                {/* Volume Control */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-sm text-muted-foreground">{Math.round(volume[0] * 100)}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <Card className="glassmorphism">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {!isPlaying ? (
                    <Button
                      onClick={playText}
                      className="w-full gradient-bg"
                      size="lg"
                    >
                      <Play className="mr-2" size={16} />
                      Play
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={isPaused ? playText : pauseText}
                        className="w-full"
                        variant="outline"
                      >
                        {isPaused ? <Play className="mr-2" size={16} /> : <Pause className="mr-2" size={16} />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button
                        onClick={stopText}
                        className="w-full"
                        variant="destructive"
                      >
                        <VolumeX className="mr-2" size={16} />
                        Stop
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    onClick={downloadAudio}
                    className="w-full"
                    variant="outline"
                    disabled={!text.trim()}
                  >
                    <Download className="mr-2" size={16} />
                    Download Audio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}