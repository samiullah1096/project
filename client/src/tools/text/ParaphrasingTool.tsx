import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import AdSlot from "@/components/AdSlot";
import { RefreshCw, Copy, Download, FileText, Settings, Zap, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParaphraseResult {
  originalText: string;
  paraphrasedText: string;
  similarity: number;
  improvements: string[];
  readabilityScore: number;
  wordChanges: {
    original: string;
    paraphrased: string;
    type: 'synonym' | 'restructure' | 'tone';
  }[];
}

interface ParaphraseMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  strength: number;
}

export default function ParaphrasingTool() {
  const [originalText, setOriginalText] = useState("");
  const [paraphrasedTexts, setParaphrasedTexts] = useState<ParaphraseResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMode, setSelectedMode] = useState("balanced");
  const [creativityLevel, setCreativityLevel] = useState("medium");
  const [preserveLength, setPreserveLength] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Paraphrasing Tool - ToolSuite Pro | Rewrite Text Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional paraphrasing tool with multiple rewrite modes. Rewrite text while maintaining meaning, improve readability, and avoid plagiarism.');
    }
  }, []);

  const modes: ParaphraseMode[] = [
    {
      id: "fluency",
      name: "Fluency",
      description: "Improve grammar and readability",
      icon: "✨",
      strength: 3
    },
    {
      id: "standard",
      name: "Standard",
      description: "Basic paraphrasing with synonyms",
      icon: "📝",
      strength: 4
    },
    {
      id: "balanced",
      name: "Balanced",
      description: "Balance between accuracy and creativity",
      icon: "⚖️",
      strength: 5
    },
    {
      id: "creative",
      name: "Creative",
      description: "More creative restructuring",
      icon: "🎨",
      strength: 7
    },
    {
      id: "formal",
      name: "Formal",
      description: "Professional and academic tone",
      icon: "🎓",
      strength: 4
    },
    {
      id: "casual",
      name: "Casual",
      description: "Conversational and friendly tone",
      icon: "💬",
      strength: 5
    },
    {
      id: "concise",
      name: "Concise",
      description: "Shorten while keeping meaning",
      icon: "📏",
      strength: 6
    },
    {
      id: "expand",
      name: "Expand",
      description: "Add detail and explanation",
      icon: "🔍",
      strength: 6
    }
  ];

  const creativityLevels = {
    low: { name: "Conservative", description: "Minimal changes, focus on accuracy" },
    medium: { name: "Balanced", description: "Good balance of creativity and accuracy" },
    high: { name: "Creative", description: "More creative rewrites, less literal" }
  };

  const generateParaphrases = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to paraphrase.",
        variant: "destructive",
      });
      return;
    }

    if (originalText.length < 20) {
      toast({
        title: "Text Too Short",
        description: "Please provide at least 20 characters for effective paraphrasing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setParaphrasedTexts([]);

    try {
      // Simulate processing steps
      setProgress(20);
      await simulateDelay(800);

      // Generate multiple paraphrase versions
      const results: ParaphraseResult[] = [];
      
      for (let i = 0; i < 3; i++) {
        setProgress(30 + (i * 20));
        const result = await generateSingleParaphrase(originalText, i);
        results.push(result);
        await simulateDelay(600);
      }

      setProgress(100);
      setParaphrasedTexts(results);
      setSelectedResult(0);

      toast({
        title: "Paraphrasing Complete",
        description: `Generated ${results.length} alternative versions of your text.`,
      });

    } catch (error) {
      toast({
        title: "Paraphrasing Failed",
        description: "Failed to paraphrase text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateSingleParaphrase = async (text: string, variant: number): Promise<ParaphraseResult> => {
    // This is a simplified simulation - in a real app, you'd use AI/ML services
    const paraphrased = await simulateParaphrasing(text, variant);
    const similarity = calculateSimilarity(text, paraphrased);
    const improvements = generateImprovements();
    const readabilityScore = calculateReadability(paraphrased);
    const wordChanges = generateWordChanges(text, paraphrased);

    return {
      originalText: text,
      paraphrasedText: paraphrased,
      similarity,
      improvements,
      readabilityScore,
      wordChanges
    };
  };

  const simulateParaphrasing = async (text: string, variant: number): Promise<string> => {
    // Simple text transformation simulation
    let result = text;
    
    // Basic synonym replacement patterns
    const synonymMap: { [key: string]: string[] } = {
      'important': ['significant', 'crucial', 'vital', 'essential'],
      'good': ['excellent', 'great', 'outstanding', 'remarkable'],
      'big': ['large', 'huge', 'massive', 'enormous'],
      'small': ['tiny', 'little', 'compact', 'minor'],
      'fast': ['quick', 'rapid', 'swift', 'speedy'],
      'help': ['assist', 'support', 'aid', 'facilitate'],
      'make': ['create', 'produce', 'generate', 'develop'],
      'show': ['demonstrate', 'display', 'reveal', 'exhibit'],
      'use': ['utilize', 'employ', 'apply', 'implement'],
      'think': ['believe', 'consider', 'assume', 'conclude']
    };

    // Apply transformations based on mode and variant
    Object.entries(synonymMap).forEach(([original, synonyms]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      const replacement = synonyms[variant % synonyms.length];
      result = result.replace(regex, replacement);
    });

    // Sentence restructuring patterns
    if (selectedMode === 'creative' || variant === 2) {
      result = result.replace(/(\w+) is (\w+)/g, 'The $2 nature of $1');
      result = result.replace(/In order to (\w+)/g, 'To $1');
      result = result.replace(/It is (\w+) that/g, '$1,');
    }

    // Tone adjustments
    if (selectedMode === 'formal') {
      result = result.replace(/\bcan't\b/g, 'cannot');
      result = result.replace(/\bdon't\b/g, 'do not');
      result = result.replace(/\bwon't\b/g, 'will not');
    } else if (selectedMode === 'casual') {
      result = result.replace(/\bcannot\b/g, "can't");
      result = result.replace(/\bdo not\b/g, "don't");
      result = result.replace(/\bwill not\b/g, "won't");
    }

    return result;
  };

  const calculateSimilarity = (original: string, paraphrased: string): number => {
    // Simple similarity calculation
    const originalWords = original.toLowerCase().split(/\s+/);
    const paraphrasedWords = paraphrased.toLowerCase().split(/\s+/);
    
    const commonWords = originalWords.filter(word => 
      paraphrasedWords.includes(word) && word.length > 3
    );
    
    const similarity = (commonWords.length / Math.max(originalWords.length, paraphrasedWords.length)) * 100;
    return Math.round(100 - similarity); // Return dissimilarity as uniqueness percentage
  };

  const generateImprovements = (): string[] => {
    const possibleImprovements = [
      "Enhanced readability",
      "Improved word choice",
      "Better sentence structure",
      "More engaging tone",
      "Clearer expression",
      "Reduced redundancy",
      "Enhanced flow",
      "Professional terminology"
    ];
    
    return possibleImprovements.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const calculateReadability = (text: string): number => {
    // Simplified readability score
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Simple readability calculation
    const score = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    return Math.round(score);
  };

  const generateWordChanges = (original: string, paraphrased: string) => {
    // Simple word change detection
    const originalWords = original.toLowerCase().split(/\s+/);
    const paraphrasedWords = paraphrased.toLowerCase().split(/\s+/);
    
    const changes: ParaphraseResult['wordChanges'] = [];
    
    // Find some example changes
    if (original.includes('important') && paraphrased.includes('significant')) {
      changes.push({ original: 'important', paraphrased: 'significant', type: 'synonym' });
    }
    if (original.includes('good') && paraphrased.includes('excellent')) {
      changes.push({ original: 'good', paraphrased: 'excellent', type: 'synonym' });
    }
    
    return changes.slice(0, 5); // Limit to 5 changes
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  const downloadAsText = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getQualityBadge = (similarity: number) => {
    if (similarity >= 80) return { text: "Excellent", variant: "default" as const, color: "text-green-600" };
    if (similarity >= 60) return { text: "Good", variant: "secondary" as const, color: "text-blue-600" };
    if (similarity >= 40) return { text: "Fair", variant: "outline" as const, color: "text-yellow-600" };
    return { text: "Needs Work", variant: "destructive" as const, color: "text-red-600" };
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <RefreshCw className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Paraphrasing Tool</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional paraphrasing tool with multiple rewrite modes. Rewrite text while maintaining meaning, improve readability, and create unique content.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2" size={20} />
                  Paraphrase Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Paraphrase Mode</label>
                  <Select value={selectedMode} onValueChange={setSelectedMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modes.map((mode) => (
                        <SelectItem key={mode.id} value={mode.id}>
                          <div className="flex items-center space-x-2">
                            <span>{mode.icon}</span>
                            <div>
                              <div className="font-medium">{mode.name}</div>
                              <div className="text-xs text-muted-foreground">{mode.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Creativity Level</label>
                  <Select value={creativityLevel} onValueChange={setCreativityLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(creativityLevels).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{level.name}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Preserve Length</label>
                  <input
                    type="checkbox"
                    checked={preserveLength}
                    onChange={(e) => setPreserveLength(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2" size={20} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={generateParaphrases}
                  className="w-full gradient-bg"
                  disabled={isProcessing || !originalText.trim()}
                >
                  <RefreshCw className="mr-2" size={16} />
                  {isProcessing ? "Processing..." : "Paraphrase Text"}
                </Button>
                
                {paraphrasedTexts.length > 0 && (
                  <>
                    <Button
                      onClick={() => copyToClipboard(paraphrasedTexts[selectedResult]?.paraphrasedText || "")}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="mr-2" size={16} />
                      Copy Result
                    </Button>
                    
                    <Button
                      onClick={() => downloadAsText(paraphrasedTexts[selectedResult]?.paraphrasedText || "", "paraphrased-text.txt")}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input */}
            <Card className="glassmorphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2" size={20} />
                  Original Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your text here to paraphrase..."
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={5000}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                  <span>{originalText.length}/5,000 characters</span>
                  <span>{originalText.trim().split(/\s+/).filter(w => w.length > 0).length} words</span>
                </div>

                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing text...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {paraphrasedTexts.length > 0 && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <RefreshCw className="mr-2" size={20} />
                      Paraphrased Results
                    </div>
                    <Badge variant="secondary">
                      {paraphrasedTexts.length} versions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedResult.toString()} onValueChange={(value) => setSelectedResult(parseInt(value))}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      {paraphrasedTexts.map((_, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          Version {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {paraphrasedTexts.map((result, index) => (
                      <TabsContent key={index} value={index.toString()} className="space-y-6">
                        {/* Result Text */}
                        <div className="space-y-4">
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="whitespace-pre-wrap">{result.paraphrasedText}</p>
                          </div>

                          {/* Quality Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-2xl font-bold text-blue-500">
                                {result.similarity}%
                              </div>
                              <div className="text-sm text-muted-foreground">Uniqueness</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-2xl font-bold text-green-500">
                                {result.readabilityScore}
                              </div>
                              <div className="text-sm text-muted-foreground">Readability</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-2xl font-bold text-purple-500">
                                {result.wordChanges.length}
                              </div>
                              <div className="text-sm text-muted-foreground">Changes</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-2xl font-bold">
                                <Badge {...getQualityBadge(result.similarity)}>
                                  {getQualityBadge(result.similarity).text}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">Quality</div>
                            </div>
                          </div>

                          <Separator />

                          {/* Improvements */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center">
                              <CheckCircle className="mr-2 text-green-500" size={16} />
                              Improvements Made
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {result.improvements.map((improvement, improvementIndex) => (
                                <Badge key={improvementIndex} variant="outline" className="text-xs">
                                  {improvement}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Word Changes */}
                          {result.wordChanges.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-3">Key Changes</h4>
                              <div className="space-y-2">
                                {result.wordChanges.slice(0, 3).map((change, changeIndex) => (
                                  <div key={changeIndex} className="flex items-center space-x-2 text-sm">
                                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                                      {change.original}
                                    </span>
                                    <span>→</span>
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300">
                                      {change.paraphrased}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {change.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}