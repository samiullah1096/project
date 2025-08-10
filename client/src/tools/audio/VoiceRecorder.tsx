import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/AdSlot";
import { Mic, MicOff, Play, Pause, Download, Trash2, FileAudio, Clock, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  name: string;
  createdAt: Date;
  size: number;
}

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Voice Recorder - ToolSuite Pro | Record Audio Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional voice recorder tool. Record high-quality audio directly in your browser, with advanced features like real-time monitoring and multiple format export.');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Set up audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Monitor volume levels
      const monitorVolume = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(Math.round(average));
          requestAnimationFrame(monitorVolume);
        }
      };
      
      streamRef.current = stream;
      return stream;
    } catch (error) {
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use the voice recorder.",
        variant: "destructive",
      });
      return null;
    }
  };

  const startRecording = async () => {
    const stream = await requestMicrophonePermission();
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const url = URL.createObjectURL(blob);
        const recording: Recording = {
          id: `recording-${Date.now()}`,
          blob,
          url,
          duration: recordingTime,
          name: `Recording ${recordings.length + 1}`,
          createdAt: new Date(),
          size: blob.size
        };
        setRecordings(prev => [recording, ...prev]);
        chunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer and volume monitoring
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const monitorVolume = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(Math.round(average));
          requestAnimationFrame(monitorVolume);
        }
      };
      monitorVolume();

      toast({
        title: "Recording Started",
        description: "Voice recording is now active.",
      });

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pauseResumeRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        toast({
          title: "Recording Resumed",
          description: "Voice recording has been resumed.",
        });
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        toast({
          title: "Recording Paused",
          description: "Voice recording has been paused.",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setIsPaused(false);
    setVolume(0);

    toast({
      title: "Recording Complete",
      description: "Your voice recording has been saved successfully.",
    });
  };

  const playRecording = (recording: Recording) => {
    if (currentPlayingId === recording.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        setCurrentPlayingId(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(recording.url);
      audioRef.current = audio;
      setCurrentPlayingId(recording.id);
      
      audio.onended = () => {
        setCurrentPlayingId(null);
      };
      
      audio.play();
    }
  };

  const downloadRecording = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.${recording.blob.type.includes('webm') ? 'webm' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteRecording = (recordingId: string) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
    if (currentPlayingId === recordingId && audioRef.current) {
      audioRef.current.pause();
      setCurrentPlayingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Mic className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Voice Recorder</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional voice recording tool with real-time monitoring, high-quality audio capture, and instant playback.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        {/* Recording Controls */}
        <Card className="glassmorphism border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="mr-2" size={20} />
              Recording Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recording Status */}
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                isRecording ? 'bg-red-500/20 border border-red-500/30' : 'bg-muted'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'
                }`} />
                <span className="text-sm font-medium">
                  {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Ready'}
                </span>
              </div>

              {/* Timer */}
              <div className="text-3xl font-mono font-bold">
                {formatTime(recordingTime)}
              </div>

              {/* Volume Level */}
              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Volume2 size={16} />
                    <span className="text-sm">Input Level</span>
                  </div>
                  <Progress value={volume} className="w-64 mx-auto" />
                </div>
              )}
            </div>

            <Separator />

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="gradient-bg px-8 py-3 text-lg"
                  size="lg"
                >
                  <Mic className="mr-2" size={20} />
                  Start Recording
                </Button>
              ) : (
                <div className="flex space-x-3">
                  <Button
                    onClick={pauseResumeRecording}
                    variant="outline"
                    size="lg"
                  >
                    {isPaused ? <Play className="mr-2" size={16} /> : <Pause className="mr-2" size={16} />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <MicOff className="mr-2" size={16} />
                    Stop
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recordings List */}
        {recordings.length > 0 && (
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileAudio className="mr-2" size={20} />
                Your Recordings ({recordings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => playRecording(recording)}
                        variant="outline"
                        size="sm"
                      >
                        {currentPlayingId === recording.id ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </Button>
                      
                      <div>
                        <h4 className="font-medium">{recording.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {formatTime(recording.duration)}
                          </span>
                          <span>{formatFileSize(recording.size)}</span>
                          <span>{recording.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => downloadRecording(recording)}
                        variant="outline"
                        size="sm"
                      >
                        <Download size={16} />
                      </Button>
                      <Button
                        onClick={() => deleteRecording(recording.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}