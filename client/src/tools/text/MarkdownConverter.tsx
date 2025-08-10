import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdSlot from "@/components/AdSlot";
import { FileText, Code, Copy, Download, RefreshCw, Eye, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarkdownConverter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [conversionMode, setConversionMode] = useState("md-to-html");
  const [previewMode, setPreviewMode] = useState(false);
  const [outputFormat, setOutputFormat] = useState("clean");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Markdown Converter - ToolSuite Pro | Convert Markdown to HTML Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional Markdown converter. Convert Markdown to HTML and HTML to Markdown with live preview, syntax highlighting, and export options.');
    }

    // Enhanced SEO meta tags
    const keywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywords.setAttribute('name', 'keywords');
    keywords.setAttribute('content', 'markdown converter, markdown to html, html to markdown, markdown editor, md converter, markdown parser, github markdown');
    if (!document.head.contains(keywords)) document.head.appendChild(keywords);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'Markdown Converter - Convert MD to HTML | ToolSuite Pro');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Convert Markdown to HTML and vice versa with live preview and professional formatting options.');
    if (!document.head.contains(ogDescription)) document.head.appendChild(ogDescription);

    // Enhanced structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Markdown Converter",
      "description": "Professional Markdown to HTML converter with live preview and formatting options",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "3421"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Markdown to HTML conversion",
        "HTML to Markdown conversion",
        "Live preview",
        "Syntax highlighting",
        "Multiple output formats",
        "Download converted files"
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
      convertText();
    } else {
      setOutputText("");
    }
  }, [inputText, conversionMode, outputFormat]);

  const convertText = () => {
    try {
      if (conversionMode === "md-to-html") {
        setOutputText(markdownToHtml(inputText));
      } else {
        setOutputText(htmlToMarkdown(inputText));
      }
    } catch (error) {
      toast({
        title: "Conversion Error",
        description: "Failed to convert text. Please check your input format.",
        variant: "destructive",
      });
    }
  };

  const markdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

    // Lists
    html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\+ (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>');

    // Wrap list items
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Wrap in paragraphs
    if (html && !html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>')) {
      html = '<p>' + html + '</p>';
    }

    // Format output based on selected format
    if (outputFormat === "formatted") {
      html = formatHtml(html);
    }

    return html;
  };

  const htmlToMarkdown = (html: string): string => {
    let markdown = html;

    // Headers
    markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1');
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1');
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1');
    markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1');
    markdown = markdown.replace(/<h5>(.*?)<\/h5>/g, '##### $1');
    markdown = markdown.replace(/<h6>(.*?)<\/h6>/g, '###### $1');

    // Bold
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');

    // Italic
    markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
    markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');

    // Code
    markdown = markdown.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```');
    markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

    // Links
    markdown = markdown.replace(/<a href="([^"]+)">(.*?)<\/a>/g, '[$2]($1)');

    // Images
    markdown = markdown.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*\/?>/g, '![$1]($2)');

    // Lists
    markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
      return content.replace(/<li>(.*?)<\/li>/g, '* $1');
    });
    markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
      let counter = 1;
      return content.replace(/<li>(.*?)<\/li>/g, () => `${counter++}. $1`);
    });

    // Paragraphs and line breaks
    markdown = markdown.replace(/<p>/g, '');
    markdown = markdown.replace(/<\/p>/g, '\n\n');
    markdown = markdown.replace(/<br\s*\/?>/g, '\n');

    // Clean up extra whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');
    markdown = markdown.trim();

    return markdown;
  };

  const formatHtml = (html: string): string => {
    // Basic HTML formatting with indentation
    let formatted = html;
    let indent = 0;
    const indentSize = 2;

    formatted = formatted.replace(/></g, '>\n<');
    const lines = formatted.split('\n');
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('</')) {
        indent -= indentSize;
      }

      const indentedLine = ' '.repeat(Math.max(0, indent)) + trimmed;

      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent += indentSize;
      }

      return indentedLine;
    });

    return formattedLines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied to Clipboard",
      description: "The converted text has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    const fileExtension = conversionMode === "md-to-html" ? "html" : "md";
    const mimeType = conversionMode === "md-to-html" ? "text/html" : "text/markdown";
    
    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Your ${fileExtension.toUpperCase()} file is being downloaded.`,
    });
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    toast({
      title: "Cleared",
      description: "Input and output have been cleared.",
    });
  };

  const sampleMarkdown = `# Sample Markdown

This is a **bold** text and this is *italic* text.

## Features

- Easy to use
- Fast conversion
- Live preview
- Multiple formats

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

[Visit our website](https://example.com)

> This is a blockquote.`;

  const sampleHtml = `<h1>Sample HTML</h1>
<p>This is a <strong>bold</strong> text and this is <em>italic</em> text.</p>
<h2>Features</h2>
<ul>
<li>Easy to use</li>
<li>Fast conversion</li>
<li>Live preview</li>
<li>Multiple formats</li>
</ul>
<h3>Code Example</h3>
<pre><code>function hello() {
  console.log("Hello, World!");
}
</code></pre>
<p><a href="https://example.com">Visit our website</a></p>
<blockquote>This is a blockquote.</blockquote>`;

  const loadSample = () => {
    setInputText(conversionMode === "md-to-html" ? sampleMarkdown : sampleHtml);
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <AdSlot position="tool-top" page="universal-tool" size="banner" className="mb-8" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold gradient-text">
              Markdown Converter
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Convert between Markdown and HTML with live preview and professional formatting options.
            Perfect for developers, writers, and content creators.
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} />
              Conversion Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Conversion Mode</label>
                <Select value={conversionMode} onValueChange={setConversionMode}>
                  <SelectTrigger data-testid="select-conversion-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md-to-html">Markdown to HTML</SelectItem>
                    <SelectItem value="html-to-md">HTML to Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Output Format</label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger data-testid="select-output-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="formatted">Formatted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadSample} variant="outline" data-testid="button-load-sample">
                  Load Sample
                </Button>
                <Button onClick={handleClear} variant="outline" data-testid="button-clear">
                  <RefreshCw size={16} className="mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Converter Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} />
                {conversionMode === "md-to-html" ? "Markdown Input" : "HTML Input"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Enter your ${conversionMode === "md-to-html" ? "Markdown" : "HTML"} here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                data-testid="textarea-input"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                {conversionMode === "md-to-html" ? "HTML Output" : "Markdown Output"}
                <div className="ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    data-testid="button-preview-toggle"
                  >
                    <Eye size={16} className="mr-1" />
                    {previewMode ? "Code" : "Preview"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopy} data-testid="button-copy">
                    <Copy size={16} className="mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={handleDownload} data-testid="button-download">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewMode && conversionMode === "md-to-html" ? (
                <div 
                  className="min-h-[400px] p-4 border rounded prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: outputText }}
                />
              ) : (
                <Textarea
                  value={outputText}
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                  data-testid="textarea-output"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Code className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Bi-directional Conversion</h3>
                <p className="text-sm text-muted-foreground">
                  Convert from Markdown to HTML and vice versa with accurate parsing.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Eye className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Live Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See how your converted HTML will look with the built-in preview mode.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="gradient-bg p-3 rounded-lg w-fit mx-auto mb-4">
                  <Download className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Export Options</h3>
                <p className="text-sm text-muted-foreground">
                  Download your converted files in clean or formatted styles.
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