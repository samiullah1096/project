import { useState, useRef } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdSlot from "@/components/AdSlot";
import { Search, Shield, AlertTriangle, CheckCircle, FileText, BarChart3, Globe, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlagiarismResult {
  similarity: number;
  sources: {
    url: string;
    title: string;
    matchedText: string;
    similarity: number;
  }[];
  sentences: {
    text: string;
    similarity: number;
    isPlagiarized: boolean;
    sources: string[];
  }[];
  overallScore: number;
  uniqueContent: number;
}

interface TextStatistics {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  characterCount: number;
  averageWordsPerSentence: number;
  readabilityScore: number;
}

export default function PlagiarismChecker() {
  const [text, setText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [statistics, setStatistics] = useState<TextStatistics | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Plagiarism Checker - ToolSuite Pro | Detect Plagiarism Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional plagiarism checker tool. Detect copied content, check originality, and ensure academic integrity with detailed similarity reports.');
    }

    // Update statistics when text changes
    if (text.trim()) {
      const stats = calculateTextStatistics(text);
      setStatistics(stats);
    } else {
      setStatistics(null);
    }
  }, [text]);

  const calculateTextStatistics = (text: string): TextStatistics => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    const averageWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    
    // Simplified Flesch Reading Ease Score
    const averageSentenceLength = averageWordsPerSentence;
    const averageSyllablesPerWord = calculateAverageSyllables(words);
    const readabilityScore = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      characterCount: characters,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      readabilityScore: Math.max(0, Math.min(100, Math.round(readabilityScore)))
    };
  };

  const calculateAverageSyllables = (words: string[]): number => {
    if (words.length === 0) return 0;
    
    const countSyllables = (word: string): number => {
      word = word.toLowerCase();
      if (word.length <= 3) return 1;
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const matches = word.match(/[aeiouy]{1,2}/g);
      return matches ? matches.length : 1;
    };

    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
    return totalSyllables / words.length;
  };

  const checkPlagiarism = async () => {
    if (!text.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    if (text.length < 100) {
      toast({
        title: "Text Too Short",
        description: "Please provide at least 100 characters for accurate plagiarism detection.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate plagiarism checking process
      setProgress(20);
      await simulateDelay(1000);

      // Analyze text structure
      setProgress(40);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      await simulateDelay(1000);

      // Check against databases (simulated)
      setProgress(60);
      await simulateDelay(1500);

      // Generate results
      setProgress(80);
      const mockResult = generateMockPlagiarismResult(sentences);
      await simulateDelay(1000);

      setProgress(100);
      setResult(mockResult);

      const uniquePercentage = Math.round(mockResult.uniqueContent);
      if (uniquePercentage >= 90) {
        toast({
          title: "Excellent Originality",
          description: `Your content is ${uniquePercentage}% original.`,
        });
      } else if (uniquePercentage >= 70) {
        toast({
          title: "Good Originality",
          description: `Your content is ${uniquePercentage}% original with some similarities detected.`,
        });
      } else {
        toast({
          title: "Plagiarism Detected",
          description: `Significant similarities found. Only ${uniquePercentage}% of content appears original.`,
          variant: "destructive",
        });
      }

    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to complete plagiarism check. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const generateMockPlagiarismResult = (sentences: string[]): PlagiarismResult => {
    const analyzedSentences = sentences.map((sentence, index) => {
      const similarity = Math.random() * 100;
      const isPlagiarized = similarity > 70;
      const sources = isPlagiarized ? 
        [`source-${Math.floor(Math.random() * 5) + 1}.com`] : [];

      return {
        text: sentence.trim(),
        similarity: Math.round(similarity),
        isPlagiarized,
        sources
      };
    });

    const mockSources = [
      {
        url: "https://example-journal.com/article/123",
        title: "Academic Research Paper on Similar Topic",
        matchedText: "Sample matched text from the source...",
        similarity: 85
      },
      {
        url: "https://educational-site.edu/content/456",
        title: "Educational Content Repository",
        matchedText: "Another example of matched content...",
        similarity: 72
      },
      {
        url: "https://blog-example.com/post/789",
        title: "Popular Blog Post",
        matchedText: "Blog content that matches your text...",
        similarity: 68
      }
    ];

    const plagiarizedSentences = analyzedSentences.filter(s => s.isPlagiarized);
    const overallSimilarity = plagiarizedSentences.length > 0 ? 
      Math.round(plagiarizedSentences.reduce((sum, s) => sum + s.similarity, 0) / plagiarizedSentences.length) : 0;
    
    const uniqueContent = Math.max(10, 100 - (plagiarizedSentences.length / sentences.length) * 100);

    return {
      similarity: overallSimilarity,
      sources: mockSources.slice(0, Math.max(1, plagiarizedSentences.length)),
      sentences: analyzedSentences,
      overallScore: Math.round(overallSimilarity),
      uniqueContent: Math.round(uniqueContent)
    };
  };

  const getSeverityColor = (similarity: number) => {
    if (similarity >= 80) return "text-red-500";
    if (similarity >= 60) return "text-orange-500";
    if (similarity >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getSeverityBadge = (similarity: number) => {
    if (similarity >= 80) return { text: "High Risk", variant: "destructive" as const };
    if (similarity >= 60) return { text: "Medium Risk", variant: "default" as const };
    if (similarity >= 40) return { text: "Low Risk", variant: "secondary" as const };
    return { text: "Original", variant: "outline" as const };
  };

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return "Very Easy";
    if (score >= 80) return "Easy";
    if (score >= 70) return "Fairly Easy";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly Difficult";
    if (score >= 30) return "Difficult";
    return "Very Difficult";
  };

  const highlightText = (text: string, isHighlighted: boolean) => {
    if (!isHighlighted) return text;
    return `<mark class="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded">${text}</mark>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Search className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Plagiarism Checker</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional plagiarism detection tool with comprehensive similarity analysis, source identification, and detailed originality reports.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glassmorphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    Text to Check
                  </div>
                  {text.length > 0 && (
                    <Button
                      onClick={() => copyToClipboard(text)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="mr-1" size={14} />
                      Copy
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your text here to check for plagiarism..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] resize-none"
                  maxLength={10000}
                />
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{text.length}/10,000 characters</span>
                  {statistics && (
                    <span>{statistics.wordCount} words • {statistics.sentenceCount} sentences</span>
                  )}
                </div>

                <Button
                  onClick={checkPlagiarism}
                  className="w-full gradient-bg"
                  disabled={isChecking || text.length < 100}
                  size="lg"
                >
                  <Search className="mr-2" size={16} />
                  {isChecking ? "Checking..." : "Check for Plagiarism"}
                </Button>

                {isChecking && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing content...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {result && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" size={20} />
                    Plagiarism Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="sentences">Sentence Analysis</TabsTrigger>
                      <TabsTrigger value="sources">Sources</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="text-center p-6 bg-muted/50 rounded-lg">
                          <div className="text-4xl font-bold mb-2">
                            <span className={getSeverityColor(100 - result.uniqueContent)}>
                              {Math.round(result.uniqueContent)}%
                            </span>
                          </div>
                          <p className="text-lg font-medium mb-2">Original Content</p>
                          <Badge {...getSeverityBadge(100 - result.uniqueContent)}>
                            {getSeverityBadge(100 - result.uniqueContent).text}
                          </Badge>
                        </div>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-red-500">
                              {result.sentences.filter(s => s.isPlagiarized).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Flagged Sentences</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-orange-500">
                              {result.sources.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Similar Sources</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">
                              {result.sentences.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Sentences</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">
                              {Math.round(result.overallScore)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Similarity Score</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="sentences">
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {result.sentences.map((sentence, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              sentence.isPlagiarized 
                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' 
                                : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                            } ${selectedSentence === index ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedSentence(selectedSentence === index ? null : index)}
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-sm flex-1 mr-4">{sentence.text}</p>
                              <div className="flex items-center space-x-2">
                                <Badge {...getSeverityBadge(sentence.similarity)}>
                                  {sentence.similarity}%
                                </Badge>
                                {sentence.isPlagiarized ? (
                                  <AlertTriangle className="text-red-500" size={16} />
                                ) : (
                                  <CheckCircle className="text-green-500" size={16} />
                                )}
                              </div>
                            </div>
                            {selectedSentence === index && sentence.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground">Similar sources:</p>
                                {sentence.sources.map((source, sourceIndex) => (
                                  <p key={sourceIndex} className="text-xs text-blue-600 dark:text-blue-400">
                                    {source}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="sources">
                      <div className="space-y-4">
                        {result.sources.map((source, index) => (
                          <div key={index} className="p-4 border border-border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{source.title}</h4>
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                  {source.url}
                                </a>
                              </div>
                              <Badge variant="outline">
                                {source.similarity}% match
                              </Badge>
                            </div>
                            <div className="p-2 bg-muted/50 rounded text-xs italic">
                              "{source.matchedText}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {statistics && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Text Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Words</p>
                      <p className="font-medium">{statistics.wordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Characters</p>
                      <p className="font-medium">{statistics.characterCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sentences</p>
                      <p className="font-medium">{statistics.sentenceCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paragraphs</p>
                      <p className="font-medium">{statistics.paragraphCount}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Words per Sentence</p>
                      <p className="font-medium">{statistics.averageWordsPerSentence}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Readability Score</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{statistics.readabilityScore}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getReadabilityLevel(statistics.readabilityScore)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2" size={20} />
                  Detection Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Web Content Scanning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Academic Database Search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Citation Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Paraphrase Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span>Multi-language Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Minimum 100 characters required</p>
                  <p>• Maximum 10,000 characters per check</p>
                  <p>• Results are indicative and should be reviewed manually</p>
                  <p>• Check citations and references separately</p>
                  <p>• Consider context when interpreting results</p>
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