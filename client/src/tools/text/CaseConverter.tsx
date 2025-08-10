import { useState, useRef } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/AdSlot";
import { Type, Copy, Download, RotateCcw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaseOption {
  id: string;
  name: string;
  description: string;
  example: string;
  transform: (text: string) => string;
}

export default function CaseConverter() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Case Converter - ToolSuite Pro | Convert Text Case Online";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional case converter tool. Convert text between uppercase, lowercase, title case, camel case, and more text formatting options.');
    }

    // Update results when input text changes
    if (inputText.trim()) {
      const newResults: { [key: string]: string } = {};
      caseOptions.forEach(option => {
        newResults[option.id] = option.transform(inputText);
      });
      setResults(newResults);
    } else {
      setResults({});
    }
  }, [inputText]);

  const caseOptions: CaseOption[] = [
    {
      id: 'uppercase',
      name: 'UPPERCASE',
      description: 'Convert all letters to uppercase',
      example: 'HELLO WORLD',
      transform: (text: string) => text.toUpperCase()
    },
    {
      id: 'lowercase',
      name: 'lowercase',
      description: 'Convert all letters to lowercase',
      example: 'hello world',
      transform: (text: string) => text.toLowerCase()
    },
    {
      id: 'titlecase',
      name: 'Title Case',
      description: 'Capitalize the first letter of each word',
      example: 'Hello World',
      transform: (text: string) => {
        return text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
      }
    },
    {
      id: 'sentencecase',
      name: 'Sentence case',
      description: 'Capitalize the first letter of each sentence',
      example: 'Hello world. This is a sentence.',
      transform: (text: string) => {
        return text.toLowerCase().replace(/(^\w)|(\.\s*\w)|(\!\s*\w)|(\?\s*\w)/g, (char) => char.toUpperCase());
      }
    },
    {
      id: 'camelcase',
      name: 'camelCase',
      description: 'Remove spaces and capitalize each word except the first',
      example: 'helloWorld',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[A-Z]/, (char) => char.toLowerCase());
      }
    },
    {
      id: 'pascalcase',
      name: 'PascalCase',
      description: 'Remove spaces and capitalize each word including the first',
      example: 'HelloWorld',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[a-z]/, (char) => char.toUpperCase());
      }
    },
    {
      id: 'snakecase',
      name: 'snake_case',
      description: 'Replace spaces with underscores and use lowercase',
      example: 'hello_world',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
      }
    },
    {
      id: 'kebabcase',
      name: 'kebab-case',
      description: 'Replace spaces with hyphens and use lowercase',
      example: 'hello-world',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    },
    {
      id: 'constantcase',
      name: 'CONSTANT_CASE',
      description: 'Replace spaces with underscores and use uppercase',
      example: 'HELLO_WORLD',
      transform: (text: string) => {
        return text
          .toUpperCase()
          .replace(/[^a-zA-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
      }
    },
    {
      id: 'dotcase',
      name: 'dot.case',
      description: 'Replace spaces with dots and use lowercase',
      example: 'hello.world',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '.')
          .replace(/^\.+|\.+$/g, '');
      }
    },
    {
      id: 'pathcase',
      name: 'path/case',
      description: 'Replace spaces with forward slashes and use lowercase',
      example: 'hello/world',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+/g, '/')
          .replace(/^\/+|\/+$/g, '');
      }
    },
    {
      id: 'alternatingcase',
      name: 'aLtErNaTiNg CaSe',
      description: 'Alternate between lowercase and uppercase letters',
      example: 'hElLo WoRlD',
      transform: (text: string) => {
        return text
          .toLowerCase()
          .split('')
          .map((char, index) => {
            if (char.match(/[a-z]/)) {
              return index % 2 === 0 ? char : char.toUpperCase();
            }
            return char;
          })
          .join('');
      }
    },
    {
      id: 'inversecase',
      name: 'iNVERSE cASE',
      description: 'Invert the case of each letter',
      example: 'hELLO wORLD',
      transform: (text: string) => {
        return text
          .split('')
          .map((char) => {
            if (char === char.toUpperCase()) {
              return char.toLowerCase();
            } else {
              return char.toUpperCase();
            }
          })
          .join('');
      }
    },
    {
      id: 'randomcase',
      name: 'RaNdOm CaSe',
      description: 'Randomly capitalize letters',
      example: 'HeLlO WoRlD',
      transform: (text: string) => {
        return text
          .split('')
          .map((char) => {
            if (char.match(/[a-zA-Z]/)) {
              return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
            }
            return char;
          })
          .join('');
      }
    },
    {
      id: 'widespace',
      name: 'W I D E   S P A C E',
      description: 'Add extra spaces between each character',
      example: 'H E L L O   W O R L D',
      transform: (text: string) => {
        return text
          .split('')
          .join(' ')
          .replace(/\s+/g, '   ');
      }
    }
  ];

  const copyToClipboard = (text: string, caseName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${caseName} text copied to clipboard.`,
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

  const clearText = () => {
    setInputText("");
    setResults({});
  };

  const loadSampleText = () => {
    const sampleText = "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet!";
    setInputText(sampleText);
  };

  const getTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    return { words, chars, charsNoSpaces, sentences };
  };

  const stats = inputText ? getTextStats(inputText) : null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Type className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Case Converter</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional text case converter with 15+ formatting options. Convert between uppercase, lowercase, title case, camel case, and many more text formats instantly.
          </p>
        </div>

        <AdSlot position="tool-top" page="universal-tool" size="banner" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glassmorphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    Input Text
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={loadSampleText}
                      variant="outline"
                      size="sm"
                    >
                      Sample Text
                    </Button>
                    <Button
                      onClick={clearText}
                      variant="ghost"
                      size="sm"
                      disabled={!inputText}
                    >
                      <RotateCcw className="mr-1" size={14} />
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your text here to convert between different cases..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                  maxLength={10000}
                />
                
                <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                  <span>{inputText.length}/10,000 characters</span>
                  {stats && (
                    <span>{stats.words} words • {stats.sentences} sentences</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            {Object.keys(results).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseOptions.map((option) => (
                  results[option.id] && (
                    <Card key={option.id} className="glassmorphism">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-sm font-medium">{option.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => copyToClipboard(results[option.id], option.name)}
                              variant="ghost"
                              size="sm"
                            >
                              <Copy size={14} />
                            </Button>
                            <Button
                              onClick={() => downloadAsText(results[option.id], `${option.id}-text.txt`)}
                              variant="ghost"
                              size="sm"
                            >
                              <Download size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="p-3 bg-muted/50 rounded-lg min-h-[60px] break-words">
                          <p className="text-sm leading-relaxed">{results[option.id]}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            {/* Text Statistics */}
            {stats && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    Text Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Words</p>
                      <p className="font-medium">{stats.words}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Characters</p>
                      <p className="font-medium">{stats.chars}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">No Spaces</p>
                      <p className="font-medium">{stats.charsNoSpaces}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sentences</p>
                      <p className="font-medium">{stats.sentences}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Examples */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Case Format Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="font-medium">Programming Cases:</p>
                    <p className="text-muted-foreground">camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Text Cases:</p>
                    <p className="text-muted-foreground">UPPERCASE, lowercase, Title Case, Sentence case</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium">Special Cases:</p>
                    <p className="text-muted-foreground">aLtErNaTiNg, iNVERSE, RaNdOm, W I D E</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Usage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>• Use camelCase for JavaScript variables and functions</p>
                  <p>• Use PascalCase for class names and components</p>
                  <p>• Use snake_case for Python variables and functions</p>
                  <p>• Use kebab-case for CSS classes and URLs</p>
                  <p>• Use CONSTANT_CASE for environment variables</p>
                  <p>• Use Title Case for headings and titles</p>
                  <p>• Use Sentence case for regular paragraphs</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => {
                    const allResults = Object.entries(results)
                      .map(([key, value]) => {
                        const option = caseOptions.find(opt => opt.id === key);
                        return `${option?.name}:\n${value}\n`;
                      })
                      .join('\n');
                    downloadAsText(allResults, 'all-case-conversions.txt');
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={Object.keys(results).length === 0}
                >
                  <Download className="mr-2" size={16} />
                  Download All
                </Button>
                
                <Button
                  onClick={() => {
                    const randomOption = caseOptions[Math.floor(Math.random() * caseOptions.length)];
                    if (inputText) {
                      const converted = randomOption.transform(inputText);
                      copyToClipboard(converted, randomOption.name);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={!inputText}
                >
                  <Type className="mr-2" size={16} />
                  Random Case
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}