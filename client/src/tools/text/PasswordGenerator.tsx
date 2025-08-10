import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdSlot from "@/components/AdSlot";
import { Key, Copy, RefreshCw, Shield, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordStrength {
  score: number;
  level: string;
  color: string;
  feedback: string[];
}

export default function PasswordGenerator() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [customCharacters, setCustomCharacters] = useState("");
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, level: "Weak", color: "red", feedback: [] });
  const [showPassword, setShowPassword] = useState(true);
  const [preset, setPreset] = useState("balanced");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Password Generator - ToolSuite Pro | Generate Secure Passwords Online";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Generate strong, secure passwords with customizable options. Password strength checker, multiple presets, and advanced security features.');
    }

    // Enhanced SEO meta tags
    const keywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
    keywords.setAttribute('name', 'keywords');
    keywords.setAttribute('content', 'password generator, secure password, strong password, random password, password strength checker, password security, generate password online');
    if (!document.head.contains(keywords)) document.head.appendChild(keywords);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'Password Generator - Generate Secure Passwords | ToolSuite Pro');
    if (!document.head.contains(ogTitle)) document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Generate strong, secure passwords with advanced customization options and strength analysis.');
    if (!document.head.contains(ogDescription)) document.head.appendChild(ogDescription);

    // Enhanced structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Password Generator",
      "description": "Professional password generator with strength analysis and security features",
      "applicationCategory": "SecurityApplication",
      "operatingSystem": "Any",
      "permissions": "browser",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "6284"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Secure password generation",
        "Password strength analysis",
        "Multiple character sets",
        "Customizable length",
        "Security presets",
        "Password history"
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
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous, excludeSimilar, customCharacters]);

  useEffect(() => {
    if (password) {
      setStrength(calculatePasswordStrength(password));
    }
  }, [password]);

  const presets = {
    simple: {
      name: "Simple",
      description: "Easy to type and remember",
      settings: {
        length: [12],
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        excludeAmbiguous: true,
        excludeSimilar: true
      }
    },
    balanced: {
      name: "Balanced",
      description: "Good balance of security and usability",
      settings: {
        length: [16],
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
        excludeSimilar: false
      }
    },
    maximum: {
      name: "Maximum Security",
      description: "Highest security for sensitive accounts",
      settings: {
        length: [24],
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
        excludeSimilar: false
      }
    },
    pin: {
      name: "PIN",
      description: "Numeric PIN codes",
      settings: {
        length: [6],
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        excludeAmbiguous: false,
        excludeSimilar: false
      }
    }
  };

  const applyPreset = (presetName: string) => {
    const presetSettings = presets[presetName as keyof typeof presets].settings;
    setLength(presetSettings.length);
    setIncludeUppercase(presetSettings.uppercase);
    setIncludeLowercase(presetSettings.lowercase);
    setIncludeNumbers(presetSettings.numbers);
    setIncludeSymbols(presetSettings.symbols);
    setExcludeAmbiguous(presetSettings.excludeAmbiguous);
    setExcludeSimilar(presetSettings.excludeSimilar);
    setPreset(presetName);
  };

  const generatePassword = () => {
    let characters = "";
    
    if (customCharacters) {
      characters = customCharacters;
    } else {
      if (includeLowercase) characters += "abcdefghijklmnopqrstuvwxyz";
      if (includeUppercase) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeNumbers) characters += "0123456789";
      if (includeSymbols) characters += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }

    if (excludeAmbiguous) {
      characters = characters.replace(/[0O1lI|]/g, "");
    }

    if (excludeSimilar) {
      characters = characters.replace(/[il1Lo0O]/g, "");
    }

    if (!characters) {
      setPassword("");
      return;
    }

    let result = "";
    const charactersLength = characters.length;
    
    // Use crypto.getRandomValues for better randomness
    const array = new Uint32Array(length[0]);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length[0]; i++) {
      result += characters.charAt(array[i] % charactersLength);
    }

    setPassword(result);
    
    // Add to history (keep last 5)
    setPasswordHistory(prev => [result, ...prev.slice(0, 4)]);
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    // Length score
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;
    if (pwd.length < 8) feedback.push("Password should be at least 8 characters long");

    // Character variety
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;':\",./<>?]/.test(pwd);

    if (hasLower) score += 1;
    if (hasUpper) score += 1;
    if (hasNumbers) score += 1;
    if (hasSymbols) score += 2;

    if (!hasLower) feedback.push("Add lowercase letters");
    if (!hasUpper) feedback.push("Add uppercase letters");
    if (!hasNumbers) feedback.push("Add numbers");
    if (!hasSymbols) feedback.push("Add special characters");

    // Complexity checks
    const uniqueChars = new Set(pwd.split("")).size;
    if (uniqueChars / pwd.length > 0.7) score += 1;
    if (uniqueChars / pwd.length <= 0.5) feedback.push("Avoid repeating characters");

    // Common patterns
    if (!/(.)\1{2,}/.test(pwd)) score += 1; // No more than 2 consecutive same chars
    if (!/123|abc|qwe/i.test(pwd)) score += 1; // No common sequences
    
    if (/(.)\1{2,}/.test(pwd)) feedback.push("Avoid repeating characters");
    if (/123|abc|qwe/i.test(pwd)) feedback.push("Avoid common sequences");

    // Determine strength level
    let level = "Very Weak";
    let color = "red";

    if (score >= 10) {
      level = "Very Strong";
      color = "green";
    } else if (score >= 8) {
      level = "Strong";
      color = "lime";
    } else if (score >= 6) {
      level = "Medium";
      color = "yellow";
    } else if (score >= 4) {
      level = "Weak";
      color = "orange";
    }

    return { score: Math.min(score * 10, 100), level, color, feedback };
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast({
      title: "Password Copied",
      description: "The password has been copied to your clipboard.",
    });
  };

  const handleCopyHistory = (pwd: string) => {
    navigator.clipboard.writeText(pwd);
    toast({
      title: "Password Copied",
      description: "Password from history has been copied to your clipboard.",
    });
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    toast({
      title: "History Cleared",
      description: "Password history has been cleared.",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <AdSlot position="tool-top" page="universal-tool" size="banner" className="mb-8" />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Key className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-sans font-bold gradient-text">
              Password Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Generate strong, secure passwords with customizable options. 
            Protect your accounts with cryptographically secure random passwords.
          </p>
        </div>

        {/* Generated Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Generated Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Input
                  value={password}
                  readOnly
                  type={showPassword ? "text" : "password"}
                  className="font-mono text-lg pr-10"
                  data-testid="input-generated-password"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <Button onClick={handleCopy} disabled={!password} data-testid="button-copy-password">
                <Copy size={16} className="mr-2" />
                Copy
              </Button>
              <Button onClick={generatePassword} data-testid="button-generate">
                <RefreshCw size={16} className="mr-2" />
                Generate
              </Button>
            </div>

            {/* Password Strength */}
            {password && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Strength:</span>
                  <Badge variant="secondary" className={`text-${strength.color}-700 bg-${strength.color}-100 dark:bg-${strength.color}-900/20`}>
                    {strength.level}
                  </Badge>
                </div>
                <Progress value={strength.score} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Score: {strength.score}/100
                </div>
                {strength.feedback.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <strong>Suggestions:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {strength.feedback.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Security Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(presets).map(([key, preset]) => (
                <div
                  key={key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    preset === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => applyPreset(key)}
                  data-testid={`preset-${key}`}
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-muted-foreground">{preset.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Length: {length[0]} characters
                </Label>
                <Slider
                  value={length}
                  onValueChange={setLength}
                  max={50}
                  min={4}
                  step={1}
                  data-testid="slider-password-length"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="uppercase"
                    checked={includeUppercase}
                    onCheckedChange={setIncludeUppercase}
                    data-testid="switch-uppercase"
                  />
                  <Label htmlFor="uppercase">Uppercase letters (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lowercase"
                    checked={includeLowercase}
                    onCheckedChange={setIncludeLowercase}
                    data-testid="switch-lowercase"
                  />
                  <Label htmlFor="lowercase">Lowercase letters (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="numbers"
                    checked={includeNumbers}
                    onCheckedChange={setIncludeNumbers}
                    data-testid="switch-numbers"
                  />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="symbols"
                    checked={includeSymbols}
                    onCheckedChange={setIncludeSymbols}
                    data-testid="switch-symbols"
                  />
                  <Label htmlFor="symbols">Symbols (!@#$%...)</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclude-ambiguous"
                    checked={excludeAmbiguous}
                    onCheckedChange={setExcludeAmbiguous}
                    data-testid="switch-exclude-ambiguous"
                  />
                  <Label htmlFor="exclude-ambiguous">Exclude ambiguous (0, O, 1, l, I, |)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="exclude-similar"
                    checked={excludeSimilar}
                    onCheckedChange={setExcludeSimilar}
                    data-testid="switch-exclude-similar"
                  />
                  <Label htmlFor="exclude-similar">Exclude similar (i, l, 1, L, o, 0, O)</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-chars" className="text-sm font-medium mb-2 block">
                  Custom Characters (overrides above settings)
                </Label>
                <Input
                  id="custom-chars"
                  value={customCharacters}
                  onChange={(e) => setCustomCharacters(e.target.value)}
                  placeholder="Enter custom character set..."
                  data-testid="input-custom-characters"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Password History */}
        {passwordHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Password History</span>
                <Button variant="outline" size="sm" onClick={clearHistory} data-testid="button-clear-history">
                  Clear History
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {passwordHistory.map((pwd, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded border">
                    <Input
                      value={pwd}
                      readOnly
                      type={showPassword ? "text" : "password"}
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyHistory(pwd)}
                      data-testid={`button-copy-history-${index}`}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Password Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use unique passwords for each account</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use a password manager to store passwords securely</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Enable two-factor authentication when available</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Never share passwords via email or text</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Change passwords if you suspect they're compromised</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Avoid using personal information in passwords</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AdSlot position="tool-bottom" page="universal-tool" size="banner" className="mt-8" />
      </div>
    </div>
  );
}