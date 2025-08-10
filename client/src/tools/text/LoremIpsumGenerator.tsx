import { useState } from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import AdSlot from "@/components/AdSlot";
import { FileText, Copy, Download, Settings, RefreshCw, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoremIpsumGenerator() {
  const [generatedText, setGeneratedText] = useState("");
  const [textType, setTextType] = useState("paragraphs");
  const [amount, setAmount] = useState(5);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [includeHtml, setIncludeHtml] = useState(false);
  const [variation, setVariation] = useState("classic");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Lorem Ipsum Generator - ToolSuite Pro | Generate Placeholder Text";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional Lorem Ipsum generator with multiple text variations, HTML formatting options, and customizable length settings for design and development.');
    }

    // Generate initial text
    generateText();
  }, []);

  const loremVariations = {
    classic: {
      name: "Classic Lorem Ipsum",
      description: "Traditional Latin placeholder text",
      words: [
        "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
        "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
        "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
        "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
        "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
        "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
        "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
        "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
        "accusamus", "accusantium", "doloremque", "laudantium", "totam", "rem", "aperiam",
        "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis", "et", "quasi",
        "architecto", "beatae", "vitae", "dicta", "sunt", "explicabo", "nemo", "ipsam",
        "voluptatem", "quia", "voluptas", "aspernatur", "aut", "odit", "fugit"
      ]
    },
    hipster: {
      name: "Hipster Ipsum",
      description: "Trendy, artisanal placeholder text",
      words: [
        "artisan", "craft", "beer", "organic", "sustainable", "locally", "sourced",
        "vintage", "retro", "authentic", "handcrafted", "small", "batch", "farm",
        "table", "ethical", "fair", "trade", "gluten", "free", "vegan", "quinoa",
        "kale", "kombucha", "sriracha", "mason", "jar", "flannel", "beard", "mustache",
        "bicycle", "fixed", "gear", "vinyl", "records", "typewriter", "polaroid",
        "instagram", "coffee", "shop", "coworking", "space", "startup", "brooklyn",
        "portland", "austin", "craft", "cocktail", "speakeasy", "food", "truck",
        "artisanal", "cheese", "charcuterie", "microbrewery", "distillery", "rooftop",
        "loft", "warehouse", "industrial", "minimalist", "scandinavian", "mid", "century",
        "modern", "reclaimed", "wood", "exposed", "brick", "edison", "bulb", "succulents"
      ]
    },
    bacon: {
      name: "Bacon Ipsum",
      description: "Meaty, delicious placeholder text",
      words: [
        "bacon", "ham", "sausage", "pork", "beef", "chicken", "turkey", "ribeye",
        "steak", "brisket", "pastrami", "salami", "jerky", "meatball", "frankfurter",
        "kielbasa", "andouille", "bratwurst", "chorizo", "pancetta", "prosciutto",
        "capicola", "bresaola", "corned", "beef", "ground", "round", "sirloin",
        "tenderloin", "filet", "mignon", "t", "bone", "porterhouse", "drumstick",
        "wing", "thigh", "breast", "leg", "shoulder", "belly", "chop", "cutlet",
        "rump", "flank", "shank", "hock", "loin", "chuck", "rib", "short", "plate",
        "biltong", "venison", "swine", "pig", "cow", "turkey", "chicken", "duck",
        "goose", "lamb", "mutton", "veal", "buffalo", "elk", "moose", "deer"
      ]
    },
    pirate: {
      name: "Pirate Ipsum",
      description: "Swashbuckling maritime placeholder text",
      words: [
        "ahoy", "matey", "shiver", "me", "timbers", "yo", "ho", "avast", "ye",
        "scurvy", "dog", "landlubber", "bilge", "rat", "walk", "the", "plank",
        "keelhaul", "batten", "down", "hatches", "all", "hands", "on", "deck",
        "captain", "first", "mate", "bosun", "quartermaster", "cabin", "boy",
        "buccaneer", "privateer", "corsair", "sea", "legs", "crow's", "nest",
        "jolly", "roger", "skull", "crossbones", "treasure", "chest", "doubloon",
        "piece", "of", "eight", "spanish", "main", "caribbean", "cutlass", "cutlass",
        "flintlock", "pistol", "cannon", "ship", "vessel", "galleon", "frigate",
        "sloop", "brigantine", "schooner", "port", "starboard", "bow", "stern"
      ]
    },
    corporate: {
      name: "Corporate Ipsum",
      description: "Business jargon placeholder text",
      words: [
        "synergy", "paradigm", "shift", "leverage", "utilize", "optimize",
        "streamline", "efficiency", "productivity", "roi", "kpi", "metrics",
        "analytics", "data", "driven", "insights", "actionable", "scalable",
        "sustainable", "innovative", "disruptive", "cutting", "edge", "best",
        "practices", "core", "competencies", "value", "proposition", "stakeholders",
        "shareholders", "ecosystem", "holistic", "approach", "end", "to", "end",
        "solutions", "turnkey", "seamless", "integration", "cross", "functional",
        "collaboration", "ideation", "brainstorming", "workshop", "deep", "dive",
        "roadmap", "milestone", "deliverables", "bandwidth", "capacity", "pipeline",
        "funnel", "conversion", "acquisition", "retention", "engagement"
      ]
    }
  };

  const generateText = () => {
    const variation = loremVariations[variation as keyof typeof loremVariations] || loremVariations.classic;
    const words = variation.words;
    let result = "";

    if (textType === "words") {
      const selectedWords = [];
      for (let i = 0; i < amount; i++) {
        selectedWords.push(words[Math.floor(Math.random() * words.length)]);
      }
      result = selectedWords.join(" ");
      
      if (startWithLorem && variation === loremVariations.classic) {
        result = "Lorem ipsum " + result;
      }
    } 
    else if (textType === "sentences") {
      const sentences = [];
      for (let i = 0; i < amount; i++) {
        const sentenceLength = Math.floor(Math.random() * 15) + 5; // 5-20 words
        const sentenceWords = [];
        
        for (let j = 0; j < sentenceLength; j++) {
          sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
        }
        
        let sentence = sentenceWords.join(" ");
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
        
        if (i === 0 && startWithLorem && variation === loremVariations.classic) {
          sentence = "Lorem ipsum " + sentence.toLowerCase();
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        }
        
        sentences.push(sentence);
      }
      result = sentences.join(" ");
    }
    else if (textType === "paragraphs") {
      const paragraphs = [];
      for (let i = 0; i < amount; i++) {
        const sentenceCount = Math.floor(Math.random() * 6) + 3; // 3-8 sentences
        const sentences = [];
        
        for (let j = 0; j < sentenceCount; j++) {
          const sentenceLength = Math.floor(Math.random() * 12) + 8; // 8-20 words
          const sentenceWords = [];
          
          for (let k = 0; k < sentenceLength; k++) {
            sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
          }
          
          let sentence = sentenceWords.join(" ");
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
          sentences.push(sentence);
        }
        
        let paragraph = sentences.join(" ");
        
        if (i === 0 && startWithLorem && variation === loremVariations.classic) {
          paragraph = "Lorem ipsum " + paragraph.toLowerCase();
          paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
        }
        
        paragraphs.push(paragraph);
      }
      result = paragraphs.join("\n\n");
    }

    // Add HTML formatting if requested
    if (includeHtml) {
      if (textType === "paragraphs") {
        result = result.split("\n\n").map(p => `<p>${p}</p>`).join("\n");
      } else if (textType === "sentences") {
        result = `<p>${result}</p>`;
      } else if (textType === "words") {
        result = `<span>${result}</span>`;
      }
    }

    setGeneratedText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    toast({
      title: "Copied",
      description: "Generated text copied to clipboard.",
    });
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lorem-ipsum-${textType}-${amount}.${includeHtml ? 'html' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getTextStats = () => {
    if (!generatedText) return null;
    
    const cleanText = generatedText.replace(/<[^>]*>/g, ''); // Remove HTML tags for counting
    const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = cleanText.length;
    const charactersNoSpaces = cleanText.replace(/\s/g, '').length;
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    return { words, characters, charactersNoSpaces, sentences, paragraphs };
  };

  const stats = getTextStats();

  const presets = [
    { name: "Short Article", type: "paragraphs", amount: 3 },
    { name: "Medium Article", type: "paragraphs", amount: 8 },
    { name: "Long Article", type: "paragraphs", amount: 15 },
    { name: "Card Content", type: "sentences", amount: 3 },
    { name: "Button Text", type: "words", amount: 3 },
    { name: "Navigation", type: "words", amount: 5 },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTextType(preset.type);
    setAmount(preset.amount);
    setTimeout(generateText, 100);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Package className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Lorem Ipsum Generator</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional placeholder text generator with multiple variations, HTML formatting, and customizable options for design and development projects.
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
                  Generator Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Text Type</label>
                  <Select value={textType} onValueChange={setTextType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraphs">Paragraphs</SelectItem>
                      <SelectItem value="sentences">Sentences</SelectItem>
                      <SelectItem value="words">Words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={100}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Variation</label>
                  <Select value={variation} onValueChange={setVariation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(loremVariations).map(([key, variant]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{variant.name}</div>
                            <div className="text-xs text-muted-foreground">{variant.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Start with "Lorem ipsum"</label>
                    <Switch
                      checked={startWithLorem}
                      onCheckedChange={setStartWithLorem}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Include HTML tags</label>
                    <Switch
                      checked={includeHtml}
                      onCheckedChange={setIncludeHtml}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateText}
                  className="w-full gradient-bg"
                >
                  <RefreshCw className="mr-2" size={16} />
                  Generate Text
                </Button>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="text-xs justify-start h-8"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Text Statistics */}
            {stats && (
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="text-sm">Text Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words:</span>
                      <span className="font-medium">{stats.words}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Characters:</span>
                      <span className="font-medium">{stats.characters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">No spaces:</span>
                      <span className="font-medium">{stats.charactersNoSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sentences:</span>
                      <span className="font-medium">{stats.sentences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paragraphs:</span>
                      <span className="font-medium">{stats.paragraphs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Generated Text */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="glassmorphism border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="mr-2" size={20} />
                    Generated Text
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="secondary">
                      {loremVariations[variation as keyof typeof loremVariations]?.name || "Classic"}
                    </Badge>
                    {includeHtml && (
                      <Badge variant="outline">HTML</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {includeHtml ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">HTML Preview:</div>
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: generatedText }}
                        />
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">HTML Code:</div>
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {generatedText}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={generatedText}
                      readOnly
                      className="min-h-[400px] resize-none font-mono text-sm"
                    />
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    {stats && (
                      <span>{stats.words} words • {stats.characters} characters</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-2" size={16} />
                      Copy
                    </Button>
                    <Button
                      onClick={downloadText}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Examples */}
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-sm">Common Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Design & Development:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Website wireframes and mockups</li>
                      <li>• Typography and layout testing</li>
                      <li>• Content management systems</li>
                      <li>• Email templates</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Marketing & Publishing:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Brochures and print materials</li>
                      <li>• Template designs</li>
                      <li>• Publishing layouts</li>
                      <li>• Presentation slides</li>
                    </ul>
                  </div>
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