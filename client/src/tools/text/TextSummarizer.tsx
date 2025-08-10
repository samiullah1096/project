import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import AdSlot from "@/components/AdSlot";
import { FileText, Copy, Download, Settings, Zap, BarChart3, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryResult {
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  keyPoints: string[];
  summary: string;
  readabilityScore: number;
  importantSentences: string[];
}

export default function TextSummarizer() {
  const [originalText, setOriginalText] = useState("");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summaryLength, setSummaryLength] = useState([30]); // Percentage
  const [summaryStyle, setSummaryStyle] = useState("balanced");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Text Summarizer - ToolSuite Pro | Summarize Text Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional text summarization tool. Create concise summaries from long articles, documents, and content while preserving key information.');
    }
  }, []);

  const summaryStyles = {
    extractive: {
      name: "Extractive",
      description: "Select and combine existing sentences",
      icon: "✂️"
    },
    abstractive: {
      name: "Abstractive", 
      description: "Generate new sentences based on understanding",
      icon: "🧠"
    },
    balanced: {
      name: "Balanced",
      description: "Mix of extractive and abstractive techniques",
      icon: "⚖️"
    },
    bullets: {
      name: "Bullet Points",
      description: "Key points in bullet format",
      icon: "📝"
    },
    outline: {
      name: "Outline",
      description: "Structured hierarchical summary",
      icon: "🗂️"
    }
  };

  const generateSummary = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    if (originalText.length < 500) {
      toast({
        title: "Text Too Short",
        description: "Please provide at least 500 characters for effective summarization.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setSummary(null);

    try {
      // Simulate processing steps
      setProgress(20);
      await simulateDelay(800);

      // Analyze text structure
      setProgress(40);
      const sentences = extractSentences(originalText);
      const keyWords = extractKeywords(originalText);
      await simulateDelay(1000);

      // Generate summary
      setProgress(60);
      const summaryText = await generateSummaryText(sentences, keyWords);
      await simulateDelay(800);

      // Calculate metrics
      setProgress(80);
      const result = calculateSummaryMetrics(originalText, summaryText, sentences);
      await simulateDelay(500);

      setProgress(100);
      setSummary(result);

      toast({
        title: "Summary Generated",
        description: `Reduced text by ${Math.round(result.compressionRatio)}% while preserving key information.`,
      });

    } catch (error) {
      toast({
        title: "Summarization Failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const extractSentences = (text: string): string[] => {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20); // Filter out very short sentences
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // Common stop words to exclude
    const stopWords = new Set([
      'that', 'with', 'have', 'this', 'will', 'been', 'from', 'they', 'were', 
      'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could',
      'other', 'more', 'very', 'what', 'know', 'just', 'into', 'over',
      'think', 'also', 'your', 'work', 'only', 'than', 'through', 'before'
    ]);

    return Object.entries(frequency)
      .filter(([word]) => !stopWords.has(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  };

  const generateSummaryText = async (sentences: string[], keywords: string[]): Promise<string> => {
    const targetLength = Math.floor(sentences.length * (summaryLength[0] / 100));
    
    // Score sentences based on keyword frequency and position
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // Position scoring (early and late sentences often more important)
      if (index < sentences.length * 0.1) score += 2;
      if (index > sentences.length * 0.9) score += 1;
      
      // Keyword scoring
      const lowerSentence = sentence.toLowerCase();
      keywords.forEach(keyword => {
        const matches = (lowerSentence.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 2;
      });
      
      // Length scoring (prefer medium-length sentences)
      const words = sentence.split(/\s+/).length;
      if (words >= 10 && words <= 30) score += 1;
      
      return { sentence, score, index };
    });

    // Select top sentences
    const selectedSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(3, targetLength))
      .sort((a, b) => a.index - b.index) // Maintain original order
      .map(item => item.sentence);

    let summaryText = selectedSentences.join('. ');
    
    // Apply style-specific formatting
    if (summaryStyle === 'bullets') {
      const points = selectedSentences.slice(0, 8);
      summaryText = points.map(point => `• ${point}`).join('\n');
    } else if (summaryStyle === 'outline') {
      const points = selectedSentences.slice(0, 6);
      summaryText = points.map((point, index) => `${index + 1}. ${point}`).join('\n');
    }

    return summaryText;
  };

  const calculateSummaryMetrics = (original: string, summary: string, sentences: string[]): SummaryResult => {
    const originalLength = original.length;
    const summaryLength = summary.length;
    const compressionRatio = ((originalLength - summaryLength) / originalLength) * 100;
    
    // Extract key points
    const keyPoints = summary.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 5);

    // Calculate readability (simplified Flesch score)
    const words = summary.split(/\s+/).length;
    const sentenceCount = summary.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = words / Math.max(sentenceCount, 1);
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));

    // Important sentences (top 3 by score)
    const importantSentences = keyPoints.slice(0, 3);

    return {
      originalLength,
      summaryLength,
      compressionRatio,
      keyPoints,
      summary,
      readabilityScore: Math.round(readabilityScore),
      importantSentences
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard.",
    });
  };

  const downloadSummary = () => {
    if (!summary) return;
    
    const content = `ORIGINAL TEXT SUMMARY
Generated by ToolSuite Pro

SUMMARY (${Math.round(summary.compressionRatio)}% compression):
${summary.summary}

KEY POINTS:
${summary.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

STATISTICS:
- Original Length: ${summary.originalLength.toLocaleString()} characters
- Summary Length: ${summary.summaryLength.toLocaleString()} characters
- Compression Ratio: ${Math.round(summary.compressionRatio)}%
- Readability Score: ${summary.readabilityScore}/100
`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'text-summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const loadSampleText = () => {
    const sampleText = `Artificial Intelligence has revolutionized the way we interact with technology and process information. Machine learning algorithms have become increasingly sophisticated, enabling computers to recognize patterns, make predictions, and even generate creative content. The applications of AI span across numerous industries, from healthcare and finance to transportation and entertainment.

In healthcare, AI-powered diagnostic tools can analyze medical images with remarkable accuracy, often detecting conditions that might be missed by human practitioners. These systems can process vast amounts of medical data to identify potential health risks and suggest personalized treatment plans. Similarly, in the financial sector, AI algorithms help detect fraudulent transactions, assess credit risks, and automate trading decisions.

The transportation industry has seen significant advancements through autonomous vehicle technology. Self-driving cars use a combination of sensors, cameras, and AI algorithms to navigate roads safely. These vehicles can potentially reduce traffic accidents caused by human error and improve overall road safety.

However, the rapid advancement of AI technology also raises important ethical considerations. Questions about data privacy, algorithmic bias, and the potential displacement of human workers need to be carefully addressed. As AI systems become more integrated into our daily lives, it's crucial to develop frameworks that ensure these technologies are used responsibly and beneficially for society.

Looking toward the future, AI is expected to continue evolving, with developments in areas such as quantum computing and neural networks promising even more powerful capabilities. The key to successful AI implementation lies in balancing innovation with ethical responsibility, ensuring that these powerful tools serve to enhance human potential rather than replace human judgment entirely.`;
    
    setOriginalText(sampleText);
  };

  const getTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 WPM average
    
    return { words, sentences, paragraphs, readingTime };
  };

  const originalStats = originalText ? getTextStats(originalText) : null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Text Summarizer</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional text summarization tool with multiple summary styles. Create concise summaries from long articles, documents, and content while preserving key information.
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
                  Summary Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Summary Style</label>
                  <Select value={summaryStyle} onValueChange={setSummaryStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(summaryStyles).map(([key, style]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <span>{style.icon}</span>
                            <div>
                              <div className="font-medium">{style.name}</div>
                              <div className="text-xs text-muted-foreground">{style.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Summary Length</label>
                    <span className="text-sm text-muted-foreground">{summaryLength[0]}%</span>
                  </div>
                  <Slider
                    value={summaryLength}
                    onValueChange={setSummaryLength}
                    min={10}
                    max={70}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Brief</span>
                    <span>Detailed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Statistics */}
            {originalStats && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Text Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Words</p>
                      <p className="font-medium">{originalStats.words.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sentences</p>
                      <p className="font-medium">{originalStats.sentences}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paragraphs</p>
                      <p className="font-medium">{originalStats.paragraphs}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Read Time</p>
                      <p className="font-medium">{originalStats.readingTime} min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2" size={20} />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={generateSummary}
                  className="w-full gradient-bg"
                  disabled={isProcessing || !originalText.trim()}
                >
                  <Target className="mr-2" size={16} />
                  {isProcessing ? "Summarizing..." : "Generate Summary"}
                </Button>
                
                <Button
                  onClick={loadSampleText}
                  variant="outline"
                  className="w-full"
                >
                  Load Sample Text
                </Button>
                
                {summary && (
                  <>
                    <Button
                      onClick={() => copyToClipboard(summary.summary)}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="mr-2" size={16} />
                      Copy Summary
                    </Button>
                    
                    <Button
                      onClick={downloadSummary}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="mr-2" size={16} />
                      Download Report
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
                  placeholder="Paste your text here to generate a summary..."
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  maxLength={50000}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                  <span>{originalText.length}/50,000 characters</span>
                  {originalStats && (
                    <span>{originalStats.words} words • {originalStats.sentences} sentences</span>
                  )}
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

            {/* Summary Results */}
            {summary && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Target className="mr-2" size={20} />
                      Generated Summary
                    </div>
                    <Badge variant="secondary">
                      {Math.round(summary.compressionRatio)}% reduction
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Text */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                      {summary.summary}
                    </pre>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-500">
                        {summary.originalLength.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Original Chars</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        {summary.summaryLength.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Summary Chars</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">
                        {Math.round(summary.compressionRatio)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compression</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-orange-500">
                        {summary.readabilityScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Readability</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Points */}
                  <div>
                    <h4 className="font-medium mb-3">Key Points Extracted:</h4>
                    <div className="space-y-2">
                      {summary.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start space-x-3 p-2 bg-muted/30 rounded">
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {index + 1}
                          </Badge>
                          <p className="text-sm flex-1">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
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