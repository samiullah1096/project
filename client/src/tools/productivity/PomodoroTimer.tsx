import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Settings, Clock, Coffee, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface PomodoroSession {
  id: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number;
  completedAt: string;
}

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export default function PomodoroTimer() {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [currentMode, setCurrentMode] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false
  });

  useEffect(() => {
    document.title = "Pomodoro Timer - ToolSuite Pro | Focus Timer for Productivity Enhancement";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional Pomodoro timer with customizable work and break intervals. Boost productivity with focused work sessions, automatic break reminders, and progress tracking.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Pomodoro Timer",
      "description": "Professional productivity timer tool",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimerComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Record completed session
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      type: currentMode,
      duration: getCurrentDuration(),
      completedAt: new Date().toLocaleString()
    };
    
    setCompletedSessions(prev => [newSession, ...prev.slice(0, 19)]); // Keep last 20 sessions
    
    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${currentMode === 'work' ? 'Work' : 'Break'} session completed!`, {
        body: getNextModeMessage(),
        icon: '/favicon.ico'
      });
    }
    
    toast({
      title: `${currentMode === 'work' ? 'Work' : 'Break'} Session Complete!`,
      description: getNextModeMessage(),
    });
    
    // Auto-switch to next mode
    if (currentMode === 'work') {
      setSessionCount(prev => prev + 1);
      const shouldLongBreak = (sessionCount + 1) % settings.sessionsUntilLongBreak === 0;
      const nextMode = shouldLongBreak ? 'long-break' : 'short-break';
      setCurrentMode(nextMode);
      setTimeLeft(shouldLongBreak ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);
      
      if (settings.autoStartBreaks) {
        setIsActive(true);
      }
    } else {
      setCurrentMode('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartPomodoros) {
        setIsActive(true);
      }
    }
  };

  const getCurrentDuration = () => {
    switch (currentMode) {
      case 'work': return settings.workDuration;
      case 'short-break': return settings.shortBreakDuration;
      case 'long-break': return settings.longBreakDuration;
    }
  };

  const getNextModeMessage = () => {
    if (currentMode === 'work') {
      const shouldLongBreak = (sessionCount + 1) % settings.sessionsUntilLongBreak === 0;
      return shouldLongBreak ? 'Time for a long break!' : 'Time for a short break!';
    }
    return 'Ready for another work session!';
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    
    // Request notification permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getCurrentDuration() * 60);
  };

  const switchMode = (mode: 'work' | 'short-break' | 'long-break') => {
    setIsActive(false);
    setCurrentMode(mode);
    const duration = mode === 'work' ? settings.workDuration : 
                    mode === 'short-break' ? settings.shortBreakDuration : 
                    settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = getCurrentDuration() * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (currentMode) {
      case 'work': return 'text-red-500';
      case 'short-break': return 'text-green-500';
      case 'long-break': return 'text-blue-500';
    }
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case 'work': return <Target className="text-red-500" size={24} />;
      case 'short-break': return <Coffee className="text-green-500" size={24} />;
      case 'long-break': return <Coffee className="text-blue-500" size={24} />;
    }
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = completedSessions.filter(session => 
      new Date(session.completedAt).toDateString() === today
    );
    
    return {
      workSessions: todaySessions.filter(s => s.type === 'work').length,
      shortBreaks: todaySessions.filter(s => s.type === 'short-break').length,
      longBreaks: todaySessions.filter(s => s.type === 'long-break').length,
      totalTime: todaySessions.reduce((sum, s) => sum + s.duration, 0)
    };
  };

  const clearHistory = () => {
    setCompletedSessions([]);
    setSessionCount(0);
    toast({
      title: "History Cleared",
      description: "All session history has been cleared",
    });
  };

  const stats = getTodayStats();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Clock className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Pomodoro Timer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Boost your productivity with the Pomodoro Technique. Work in focused 25-minute intervals 
            followed by short breaks to maintain peak performance.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="pomodoro-timer-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* Main Timer */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                {getModeIcon()}
                <span className={`ml-2 capitalize ${getModeColor()}`}>
                  {currentMode.replace('-', ' ')} Session
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="relative">
                <div className="text-6xl md:text-8xl font-mono font-bold text-primary mb-4">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={getProgress()} className="w-full h-2" />
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className={isActive ? "bg-red-500 hover:bg-red-600" : "gradient-bg"}
                >
                  {isActive ? <Pause size={20} /> : <Play size={20} />}
                  <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
                </Button>
                
                <Button
                  onClick={resetTimer}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw size={20} />
                  <span className="ml-2">Reset</span>
                </Button>
              </div>

              {/* Mode Switcher */}
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={() => switchMode('work')}
                  size="sm"
                  variant={currentMode === 'work' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  Work
                </Button>
                <Button
                  onClick={() => switchMode('short-break')}
                  size="sm"
                  variant={currentMode === 'short-break' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  Short Break
                </Button>
                <Button
                  onClick={() => switchMode('long-break')}
                  size="sm"
                  variant={currentMode === 'long-break' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  Long Break
                </Button>
              </div>

              {/* Session Counter */}
              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  Session {sessionCount + 1} • Next long break in {settings.sessionsUntilLongBreak - (sessionCount % settings.sessionsUntilLongBreak)} sessions
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Settings and Stats */}
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="space-y-6">
              {/* Today's Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-red-500">{stats.workSessions}</div>
                      <div className="text-sm text-muted-foreground">Work Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">{stats.shortBreaks}</div>
                      <div className="text-sm text-muted-foreground">Short Breaks</div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">{stats.longBreaks}</div>
                      <div className="text-sm text-muted-foreground">Long Breaks</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">{stats.totalTime}</div>
                      <div className="text-sm text-muted-foreground">Total Minutes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              {completedSessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Sessions
                      <Button size="sm" onClick={clearHistory} variant="outline">
                        Clear History
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {completedSessions.slice(0, 10).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant={session.type === 'work' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {session.type.replace('-', ' ')}
                            </Badge>
                            <span className="text-sm">{session.duration} minutes</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {session.completedAt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2" size={20} />
                    Timer Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                      <Input
                        id="work-duration"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.workDuration}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          workDuration: parseInt(e.target.value) || 25
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="short-break">Short Break (minutes)</Label>
                      <Input
                        id="short-break"
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreakDuration}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          shortBreakDuration: parseInt(e.target.value) || 5
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="long-break">Long Break (minutes)</Label>
                      <Input
                        id="long-break"
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          longBreakDuration: parseInt(e.target.value) || 15
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sessions-until-long-break">Sessions until Long Break</Label>
                    <Input
                      id="sessions-until-long-break"
                      type="number"
                      min="2"
                      max="10"
                      value={settings.sessionsUntilLongBreak}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        sessionsUntilLongBreak: parseInt(e.target.value) || 4
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-start-breaks"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoStartBreaks: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="auto-start-breaks">Auto-start breaks</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-start-pomodoros"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          autoStartPomodoros: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="auto-start-pomodoros">Auto-start work sessions</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="pomodoro-timer-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}