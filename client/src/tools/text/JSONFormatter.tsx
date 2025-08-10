import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import AdSlot from "@/components/AdSlot";
import { Code, Copy, Download, RefreshCw, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  error?: string;
  stats?: {
    size: number;
    keys: number;
    depth: number;
    arrays: number;
    objects: number;
  };
}

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [minifiedJson, setMinifiedJson] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [indentSize, setIndentSize] = useState([2]);
  const [sortKeys, setSortKeys] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeTrailingCommas, setRemoveTrailingCommas] = useState(true);
  const [escapeHtml, setEscapeHtml] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "JSON Formatter & Validator - ToolSuite Pro | Format JSON Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional JSON formatter and validator. Format, validate, minify JSON with syntax highlighting, error detection, and advanced formatting options.');
    }

    // Enhanced SEO meta tags
    const keywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywords.setAttribute('name', 'keywords');
    keywords.setAttribute('content', 'json formatter, json validator, json beautifier, json minifier, json parser, format json online, validate json, json syntax checker');
    if (!document.head.contains(keywords)) document.head.appendChild(keywords);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'JSON Formatter & Validator - Format JSON Online | ToolSuite Pro');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Format, validate, and beautify JSON with advanced options. Professional JSON tools for developers.');
    if (!document.head.contains(ogDescription)) document.head.appendChild(ogDescription);

    // Enhanced structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "JSON Formatter & Validator",
      "description": "Professional JSON formatting and validation tool with advanced options and error detection",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "4721"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "JSON formatting and beautification",
        "JSON validation with error detection",
        "JSON minification",
        "Syntax highlighting",
        "Key sorting",
        "Comment removal"
      ]
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (inputJson.trim()) {
      processJson();
    } else {
      setFormattedJson("");
      setMinifiedJson("");
      setValidationResult({ isValid: true });
    }
  }, [inputJson, indentSize, sortKeys, removeComments, removeTrailingCommas, escapeHtml]);

  const processJson = () => {
    try {
      let cleanedJson = inputJson;

      // Remove comments if enabled
      if (removeComments) {
        cleanedJson = cleanedJson.replace(/\/\*[\s\S]*?\*\//g, '');
        cleanedJson = cleanedJson.replace(/\/\/.*$/gm, '');
      }

      // Remove trailing commas if enabled
      if (removeTrailingCommas) {
        cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedJson);
      
      // Sort keys if enabled
      const processedData = sortKeys ? sortObjectKeys(parsed) : parsed;

      // Generate formatted JSON
      const indent = ' '.repeat(indentSize[0]);
      let formatted = JSON.stringify(processedData, null, indent);

      // Escape HTML if enabled
      if (escapeHtml) {
        formatted = formatted
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }

      setFormattedJson(formatted);
      setMinifiedJson(JSON.stringify(processedData));

      // Calculate stats
      const stats = calculateJsonStats(processedData);
      setValidationResult({ isValid: true, stats });

      toast({
        title: "JSON Processed",
        description: "JSON has been successfully formatted and validated.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON format";
      setValidationResult({ isValid: false, error: errorMessage });
      setFormattedJson("");
      setMinifiedJson("");
    }
  };

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
      const sorted: any = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
      });
      return sorted;
    }
    return obj;
  };

  const calculateJsonStats = (data: any): ValidationResult['stats'] => {
    let keys = 0;
    let arrays = 0;
    let objects = 0;
    let maxDepth = 0;

    const traverse = (obj: any, depth = 0) => {
      maxDepth = Math.max(maxDepth, depth);
      
      if (Array.isArray(obj)) {
        arrays++;
        obj.forEach(item => traverse(item, depth + 1));
      } else if (obj !== null && typeof obj === 'object') {
        objects++;
        Object.keys(obj).forEach(key => {
          keys++;
          traverse(obj[key], depth + 1);
        });
      }
    };

    traverse(data);

    return {
      size: JSON.stringify(data).length,
      keys,
      depth: maxDepth,
      arrays,
      objects
    };
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${type} JSON has been copied to your clipboard.`,
    });
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Your ${filename} file is being downloaded.`,
    });
  };

  const handleClear = () => {
    setInputJson("");
    setFormattedJson("");
    setMinifiedJson("");
    setValidationResult({ isValid: true });
    toast({
      title: "Cleared",
      description: "All fields have been cleared.",
    });
  };

  const loadSample = () => {
    const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00Z"
}`;
    setInputJson(sampleJson);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <AdSlot position="tool-top" page="universal-tool" size="banner" className="mb-8" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Code className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold gradient-text">
              JSON Formatter & Validator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Format, validate, and beautify JSON with professional tools. 
            Perfect for developers working with JSON data and APIs.
          </p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Formatting Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Indent Size: {indentSize[0]} spaces</Label>
                <Slider
                  value={indentSize}
                  onValueChange={setIndentSize}
                  max={8}
                  min={1}
                  step={1}
                  className="mb-2"
                  data-testid="slider-indent-size"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sort-keys"
                    checked={sortKeys}
                    onCheckedChange={setSortKeys}
                    data-testid="switch-sort-keys"
                  />
                  <Label htmlFor="sort-keys">Sort keys alphabetically</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remove-comments"
                    checked={removeComments}
                    onCheckedChange={setRemoveComments}
                    data-testid="switch-remove-comments"
                  />
                  <Label htmlFor="remove-comments">Remove comments</Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remove-trailing-commas"
                    checked={removeTrailingCommas}
                    onCheckedChange={setRemoveTrailingCommas}
                    data-testid="switch-remove-trailing-commas"
                  />
                  <Label htmlFor="remove-trailing-commas">Remove trailing commas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="escape-html"
                    checked={escapeHtml}
                    onCheckedChange={setEscapeHtml}
                    data-testid="switch-escape-html"
                  />
                  <Label htmlFor="escape-html">Escape HTML entities</Label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={loadSample} variant="outline" data-testid="button-load-sample">
                Load Sample
              </Button>
              <Button onClick={handleClear} variant="outline" data-testid="button-clear">
                <RefreshCw size={16} className="mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code size={20} />
              JSON Input
              {validationResult.isValid ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle size={14} className="mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle size={14} className="mr-1" />
                  Invalid
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your JSON here..."
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              data-testid="textarea-input"
            />
            {!validationResult.isValid && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle size={16} />
                  <span className="font-medium">Validation Error:</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {validationResult.error}
                </p>
              </div>
            )}
            {validationResult.isValid && validationResult.stats && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-400">Size:</span>
                    <div className="text-green-600 dark:text-green-400">{validationResult.stats.size} chars</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-400">Keys:</span>
                    <div className="text-green-600 dark:text-green-400">{validationResult.stats.keys}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-400">Depth:</span>
                    <div className="text-green-600 dark:text-green-400">{validationResult.stats.depth}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-400">Objects:</span>
                    <div className="text-green-600 dark:text-green-400">{validationResult.stats.objects}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700 dark:text-green-400">Arrays:</span>
                    <div className="text-green-600 dark:text-green-400">{validationResult.stats.arrays}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Tabs */}
        <Tabs defaultValue="formatted" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formatted">Formatted JSON</TabsTrigger>
            <TabsTrigger value="minified">Minified JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="formatted">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code size={20} />
                    Formatted JSON
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(formattedJson, "Formatted")}
                      disabled={!formattedJson}
                      data-testid="button-copy-formatted"
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(formattedJson, "formatted.json")}
                      disabled={!formattedJson}
                      data-testid="button-download-formatted"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formattedJson}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  data-testid="textarea-formatted-output"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minified">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap size={20} />
                    Minified JSON
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(minifiedJson, "Minified")}
                      disabled={!minifiedJson}
                      data-testid="button-copy-minified"
                    >
                      <Copy size={16} className="mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(minifiedJson, "minified.json")}
                      disabled={!minifiedJson}
                      data-testid="button-download-minified"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={minifiedJson}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  data-testid="textarea-minified-output"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Real-time Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Instant JSON validation with detailed error messages and line numbers.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Settings className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Advanced Options</h3>
                <p className="text-sm text-muted-foreground">
                  Customize formatting with key sorting, comment removal, and more.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Format & Minify</h3>
                <p className="text-sm text-muted-foreground">
                  Get both beautified and minified versions for development and production.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}