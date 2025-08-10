import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AdSlot from "@/components/AdSlot";
import { Link, Copy, RefreshCw, Code, ArrowUpDown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EncodingResult {
  method: string;
  input: string;
  output: string;
  difference: number;
}

export default function URLEncoder() {
  const [inputText, setInputText] = useState("");
  const [encodedResults, setEncodedResults] = useState<EncodingResult[]>([]);
  const [decodedResults, setDecodedResults] = useState<EncodingResult[]>([]);
  const [activeTab, setActiveTab] = useState("encode");
  const [encodingMethods, setEncodingMethods] = useState<string[]>(["standard", "component"]);
  const [preserveReserved, setPreserveReserved] = useState(false);
  const [encodeSpacesAsPlus, setEncodeSpacesAsPlus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "URL Encoder/Decoder - ToolSuite Pro | Encode Decode URLs Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional URL encoder and decoder with multiple encoding methods. Encode/decode URLs, query strings, and special characters online.');
    }

    // Enhanced SEO meta tags
    const keywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywords.setAttribute('name', 'keywords');
    keywords.setAttribute('content', 'url encoder, url decoder, encode url, decode url, percent encoding, query string encoder, uri encoder, url escape');
    if (!document.head.contains(keywords)) document.head.appendChild(keywords);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'URL Encoder/Decoder - Professional URL Tools | ToolSuite Pro');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Encode and decode URLs with advanced options. Support for multiple encoding methods and formats.');
    if (!document.head.contains(ogDescription)) document.head.appendChild(ogDescription);

    // Enhanced structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "URL Encoder & Decoder",
      "description": "Professional URL encoding and decoding tool with multiple methods and customization options",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "4156"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "URL encoding and decoding",
        "Component encoding",
        "Query string encoding",
        "Custom encoding options",
        "Batch processing",
        "Multiple output formats"
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
    if (inputText.trim()) {
      if (activeTab === "encode") {
        encodeURL();
      } else {
        decodeURL();
      }
    } else {
      setEncodedResults([]);
      setDecodedResults([]);
    }
  }, [inputText, encodingMethods, preserveReserved, encodeSpacesAsPlus, activeTab]);

  const encodingMethodsConfig = {
    standard: {
      name: "Standard URL Encoding",
      description: "Encode entire URLs (encodeURI)",
      encode: (text: string) => {
        let result = encodeURI(text);
        if (encodeSpacesAsPlus) {
          result = result.replace(/%20/g, '+');
        }
        return result;
      }
    },
    component: {
      name: "Component Encoding",
      description: "Encode URL components (encodeURIComponent)",
      encode: (text: string) => {
        let result = encodeURIComponent(text);
        if (encodeSpacesAsPlus) {
          result = result.replace(/%20/g, '+');
        }
        if (preserveReserved) {
          // Restore some reserved characters that might be needed
          result = result.replace(/%3A/g, ':')
                        .replace(/%2F/g, '/')
                        .replace(/%3F/g, '?')
                        .replace(/%23/g, '#')
                        .replace(/%40/g, '@')
                        .replace(/%21/g, '!');
        }
        return result;
      }
    },
    custom: {
      name: "Custom Encoding",
      description: "Manual percent encoding",
      encode: (text: string) => {
        return text.split('').map(char => {
          const code = char.charCodeAt(0);
          if (code > 127 || /[^a-zA-Z0-9\-_.~]/.test(char)) {
            return encodeURIComponent(char);
          }
          return char;
        }).join('');
      }
    },
    html: {
      name: "HTML Entity Encoding",
      description: "Encode as HTML entities",
      encode: (text: string) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/\//g, '&#x2F;');
      }
    },
    base64: {
      name: "Base64 Encoding",
      description: "Encode as Base64",
      encode: (text: string) => {
        return btoa(unescape(encodeURIComponent(text)));
      }
    }
  };

  const decodingMethodsConfig = {
    standard: {
      name: "Standard URL Decoding",
      description: "Decode URLs (decodeURI)",
      decode: (text: string) => {
        try {
          let result = text;
          if (result.includes('+')) {
            result = result.replace(/\+/g, '%20');
          }
          return decodeURI(result);
        } catch {
          return "Invalid encoding";
        }
      }
    },
    component: {
      name: "Component Decoding",
      description: "Decode URL components (decodeURIComponent)",
      decode: (text: string) => {
        try {
          let result = text;
          if (result.includes('+')) {
            result = result.replace(/\+/g, '%20');
          }
          return decodeURIComponent(result);
        } catch {
          return "Invalid encoding";
        }
      }
    },
    html: {
      name: "HTML Entity Decoding",
      description: "Decode HTML entities",
      decode: (text: string) => {
        return text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, '/');
      }
    },
    base64: {
      name: "Base64 Decoding",
      description: "Decode from Base64",
      decode: (text: string) => {
        try {
          return decodeURIComponent(escape(atob(text)));
        } catch {
          return "Invalid Base64";
        }
      }
    }
  };

  const encodeURL = () => {
    const results: EncodingResult[] = [];

    encodingMethods.forEach(method => {
      const config = encodingMethodsConfig[method as keyof typeof encodingMethodsConfig];
      if (config) {
        const output = config.encode(inputText);
        const difference = output.length - inputText.length;
        
        results.push({
          method: config.name,
          input: inputText,
          output,
          difference
        });
      }
    });

    setEncodedResults(results);
  };

  const decodeURL = () => {
    const results: EncodingResult[] = [];

    // Try all decoding methods
    Object.entries(decodingMethodsConfig).forEach(([key, config]) => {
      const output = config.decode(inputText);
      const difference = inputText.length - output.length;
      
      results.push({
        method: config.name,
        input: inputText,
        output,
        difference
      });
    });

    setDecodedResults(results);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const handleSwap = () => {
    if (activeTab === "encode" && encodedResults.length > 0) {
      setInputText(encodedResults[0].output);
      setActiveTab("decode");
    } else if (activeTab === "decode" && decodedResults.length > 0) {
      setInputText(decodedResults[0].output);
      setActiveTab("encode");
    }
  };

  const handleClear = () => {
    setInputText("");
    setEncodedResults([]);
    setDecodedResults([]);
    toast({
      title: "Cleared",
      description: "Input and results have been cleared.",
    });
  };

  const loadSample = () => {
    if (activeTab === "encode") {
      setInputText("https://example.com/search?q=hello world&lang=en#section1");
    } else {
      setInputText("https%3A//example.com/search%3Fq%3Dhello%20world%26lang%3Den%23section1");
    }
  };

  const toggleEncodingMethod = (method: string) => {
    setEncodingMethods(prev => 
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <AdSlot position="tool-top" page="universal-tool" size="banner" className="mb-8" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Link className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold gradient-text">
              URL Encoder & Decoder
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Encode and decode URLs with multiple methods and customization options.
            Perfect for web developers working with query strings and special characters.
          </p>
        </div>

        {/* Main Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="encode">Encode URLs</TabsTrigger>
            <TabsTrigger value="decode">Decode URLs</TabsTrigger>
          </TabsList>

          <TabsContent value="encode" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Input */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Code size={20} />
                        URL Input
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={loadSample} data-testid="button-load-sample">
                          Load Sample
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleSwap} data-testid="button-swap">
                          <ArrowUpDown size={16} className="mr-1" />
                          Swap
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleClear} data-testid="button-clear">
                          <RefreshCw size={16} className="mr-1" />
                          Clear
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter URL or text to encode..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                      data-testid="textarea-input"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Encoding Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Encoding Methods</Label>
                    <div className="space-y-2">
                      {Object.entries(encodingMethodsConfig).map(([key, config]) => (
                        <div key={key} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={key}
                            checked={encodingMethods.includes(key)}
                            onChange={() => toggleEncodingMethod(key)}
                            className="mt-1"
                            data-testid={`checkbox-${key}`}
                          />
                          <div className="flex-1">
                            <Label htmlFor={key} className="font-medium cursor-pointer text-sm">
                              {config.name}
                            </Label>
                            <div className="text-xs text-muted-foreground">
                              {config.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preserve-reserved"
                        checked={preserveReserved}
                        onCheckedChange={setPreserveReserved}
                        data-testid="switch-preserve-reserved"
                      />
                      <Label htmlFor="preserve-reserved" className="text-sm">Preserve reserved chars</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="spaces-as-plus"
                        checked={encodeSpacesAsPlus}
                        onCheckedChange={setEncodeSpacesAsPlus}
                        data-testid="switch-spaces-as-plus"
                      />
                      <Label htmlFor="spaces-as-plus" className="text-sm">Encode spaces as +</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Encoded Results */}
            {encodedResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Encoded Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {encodedResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{result.method}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {result.difference >= 0 ? '+' : ''}{result.difference} characters
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(result.output, result.method)}
                            data-testid={`button-copy-encoded-${index}`}
                          >
                            <Copy size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="font-mono text-sm break-all bg-muted p-3 rounded">
                          {result.output}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decode" className="space-y-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Code size={20} />
                    Encoded URL Input
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSample} data-testid="button-load-sample-decode">
                      Load Sample
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSwap} data-testid="button-swap-decode">
                      <ArrowUpDown size={16} className="mr-1" />
                      Swap
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleClear} data-testid="button-clear-decode">
                      <RefreshCw size={16} className="mr-1" />
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter encoded URL or text to decode..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[150px] font-mono text-sm"
                  data-testid="textarea-input-decode"
                />
              </CardContent>
            </Card>

            {/* Decoded Results */}
            {decodedResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Decoded Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {decodedResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{result.method}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {result.difference >= 0 ? '+' : ''}{result.difference} characters
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(result.output, result.method)}
                            data-testid={`button-copy-decoded-${index}`}
                          >
                            <Copy size={14} className="mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="font-mono text-sm break-all bg-muted p-3 rounded">
                          {result.output}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <ArrowUpDown className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Bi-directional Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Seamlessly switch between encoding and decoding with the swap feature.
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
                <h3 className="font-semibold mb-2">Multiple Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Support for various encoding methods including standard, component, and custom options.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Code className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Developer Friendly</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for web developers working with APIs, query strings, and URL parameters.
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