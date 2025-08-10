import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, Copy, BarChart3, Eye, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface ShortenedURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  title?: string;
}

export default function URLShortener() {
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<ShortenedURL | null>(null);

  useEffect(() => {
    document.title = "URL Shortener - ToolSuite Pro | Create Short URLs for Easy Sharing";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional URL shortener to create custom short links with analytics. Track clicks, manage links, and create branded URLs for social media and marketing campaigns.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "URL Shortener",
      "description": "Professional URL shortener with analytics",
      "applicationCategory": "UtilityApplication",
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
    };
  }, []);

  const generateShortCode = (length: number = 6): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractTitle = async (url: string): Promise<string> => {
    // Simulate fetching page title
    try {
      const domain = new URL(url).hostname;
      return `Page from ${domain}`;
    } catch {
      return 'Untitled';
    }
  };

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (include http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    // Check if custom code is already used
    if (customCode && shortenedUrls.some(item => item.shortCode === customCode)) {
      toast({
        title: "Custom Code Taken",
        description: "This custom code is already in use",
        variant: "destructive",
      });
      return;
    }

    setIsShortening(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shortCode = customCode || generateShortCode();
      const shortUrl = `https://short.ly/${shortCode}`;
      const title = await extractTitle(url);
      
      const newShortenedUrl: ShortenedURL = {
        id: Date.now().toString(),
        originalUrl: url,
        shortCode,
        shortUrl,
        clicks: 0,
        createdAt: new Date().toLocaleString(),
        title
      };

      setShortenedUrls(prev => [newShortenedUrl, ...prev]);
      setSelectedUrl(newShortenedUrl);
      
      toast({
        title: "URL Shortened!",
        description: "Your short URL has been created successfully",
      });

      // Clear form
      setUrl("");
      setCustomCode("");
    } catch (error) {
      toast({
        title: "Shortening Failed",
        description: "Failed to create short URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const simulateClick = (id: string) => {
    setShortenedUrls(prev =>
      prev.map(item =>
        item.id === id ? { ...item, clicks: item.clicks + 1 } : item
      )
    );
    
    const url = shortenedUrls.find(item => item.id === id);
    if (url) {
      window.open(url.originalUrl, '_blank');
      toast({
        title: "Redirecting...",
        description: "Opening original URL",
      });
    }
  };

  const deleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(item => item.id !== id));
    if (selectedUrl?.id === id) {
      setSelectedUrl(null);
    }
    toast({
      title: "Deleted",
      description: "Short URL has been deleted",
    });
  };

  const clearAll = () => {
    setShortenedUrls([]);
    setSelectedUrl(null);
    toast({
      title: "Cleared",
      description: "All URLs have been cleared",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Link className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">URL Shortener</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create short, memorable URLs for easy sharing. Track clicks, customize codes, 
            and manage your links with built-in analytics.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="url-shortener-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* URL Shortener Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shorten Your URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="url-input">Enter URL to Shorten</Label>
                <Input
                  id="url-input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url-that-needs-shortening"
                  className="font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="custom-code">Custom Code (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">https://short.ly/</span>
                  <Input
                    id="custom-code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="custom-code"
                    className="font-mono"
                    maxLength={20}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for auto-generated code. Only letters and numbers allowed.
                </p>
              </div>

              <Button
                onClick={shortenUrl}
                disabled={isShortening || !url.trim()}
                className="w-full gradient-bg"
              >
                {isShortening ? 'Shortening...' : 'Shorten URL'}
              </Button>
            </CardContent>
          </Card>

          {/* Latest Shortened URL */}
          {selectedUrl && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">✨ Your Shortened URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Short URL</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={selectedUrl.shortUrl}
                        readOnly
                        className="font-mono bg-muted"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(selectedUrl.shortUrl, 'Short URL')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Original URL</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        value={selectedUrl.originalUrl}
                        readOnly
                        className="font-mono bg-muted"
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(selectedUrl.originalUrl, 'Original URL')}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Eye size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium">{selectedUrl.clicks} clicks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">{selectedUrl.createdAt}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => simulateClick(selectedUrl.id)}
                    variant="outline"
                  >
                    Test Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* URL History */}
          {shortenedUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="mr-2" size={20} />
                    Your URLs ({shortenedUrls.length})
                  </div>
                  <Button
                    size="sm"
                    onClick={clearAll}
                    variant="outline"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Clear All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shortenedUrls.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium truncate">{item.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {item.clicks} clicks
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-primary">Short:</span>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {item.shortUrl}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(item.shortUrl, 'Short URL')}
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Original:</span>
                              <code className="text-sm text-muted-foreground truncate max-w-md">
                                {item.originalUrl}
                              </code>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => simulateClick(item.id)}
                            variant="outline"
                          >
                            Visit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteUrl(item.id)}
                            variant="outline"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {item.createdAt}</span>
                        <span>Code: {item.shortCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics Summary */}
          {shortenedUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {shortenedUrls.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total URLs</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {shortenedUrls.reduce((sum, url) => sum + url.clicks, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Clicks</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {shortenedUrls.length > 0 
                        ? Math.round(shortenedUrls.reduce((sum, url) => sum + url.clicks, 0) / shortenedUrls.length)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Avg. Clicks</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {shortenedUrls.filter(url => url.clicks > 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active URLs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="url-shortener-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}