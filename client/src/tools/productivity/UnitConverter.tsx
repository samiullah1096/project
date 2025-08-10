import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowLeftRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

// Conversion factors to base units
const conversions = {
  length: {
    name: "Length",
    units: {
      meters: { name: "Meters", factor: 1 },
      kilometers: { name: "Kilometers", factor: 1000 },
      centimeters: { name: "Centimeters", factor: 0.01 },
      millimeters: { name: "Millimeters", factor: 0.001 },
      inches: { name: "Inches", factor: 0.0254 },
      feet: { name: "Feet", factor: 0.3048 },
      yards: { name: "Yards", factor: 0.9144 },
      miles: { name: "Miles", factor: 1609.344 },
    }
  },
  weight: {
    name: "Weight",
    units: {
      grams: { name: "Grams", factor: 1 },
      kilograms: { name: "Kilograms", factor: 1000 },
      pounds: { name: "Pounds", factor: 453.592 },
      ounces: { name: "Ounces", factor: 28.3495 },
      tons: { name: "Tons", factor: 1000000 },
      stones: { name: "Stones", factor: 6350.29 },
    }
  },
  temperature: {
    name: "Temperature",
    units: {
      celsius: { name: "Celsius", factor: 1 },
      fahrenheit: { name: "Fahrenheit", factor: 1 },
      kelvin: { name: "Kelvin", factor: 1 },
    }
  },
  volume: {
    name: "Volume",
    units: {
      liters: { name: "Liters", factor: 1 },
      milliliters: { name: "Milliliters", factor: 0.001 },
      gallons: { name: "Gallons (US)", factor: 3.78541 },
      quarts: { name: "Quarts", factor: 0.946353 },
      pints: { name: "Pints", factor: 0.473176 },
      cups: { name: "Cups", factor: 0.236588 },
      fluid_ounces: { name: "Fluid Ounces", factor: 0.0295735 },
    }
  },
  area: {
    name: "Area",
    units: {
      square_meters: { name: "Square Meters", factor: 1 },
      square_kilometers: { name: "Square Kilometers", factor: 1000000 },
      square_feet: { name: "Square Feet", factor: 0.092903 },
      square_inches: { name: "Square Inches", factor: 0.00064516 },
      acres: { name: "Acres", factor: 4046.86 },
      hectares: { name: "Hectares", factor: 10000 },
    }
  },
  speed: {
    name: "Speed",
    units: {
      meters_per_second: { name: "Meters/Second", factor: 1 },
      kilometers_per_hour: { name: "Kilometers/Hour", factor: 0.277778 },
      miles_per_hour: { name: "Miles/Hour", factor: 0.44704 },
      feet_per_second: { name: "Feet/Second", factor: 0.3048 },
      knots: { name: "Knots", factor: 0.514444 },
    }
  }
};

export default function UnitConverter() {
  const { toast } = useToast();
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("meters");
  const [toUnit, setToUnit] = useState("feet");
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");

  useEffect(() => {
    document.title = "Unit Converter - ToolSuite Pro | Convert Length, Weight, Temperature & More";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional unit converter for length, weight, temperature, volume, area, and speed. Accurate conversions with real-time results for engineering and everyday use.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Unit Converter",
      "description": "Professional unit converter tool",
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

  const convertValue = (value: string, from: string, to: string, cat: string) => {
    if (!value || isNaN(parseFloat(value))) return "";
    
    const numValue = parseFloat(value);
    const categoryData = conversions[cat as keyof typeof conversions];
    
    if (cat === "temperature") {
      return convertTemperature(numValue, from, to).toFixed(6).replace(/\.?0+$/, "");
    }
    
    const fromFactor = categoryData.units[from as keyof typeof categoryData.units]?.factor || 1;
    const toFactor = categoryData.units[to as keyof typeof categoryData.units]?.factor || 1;
    
    const baseValue = numValue * fromFactor;
    const convertedValue = baseValue / toFactor;
    
    return convertedValue.toFixed(6).replace(/\.?0+$/, "");
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius = value;
    
    // Convert to Celsius first
    if (from === "fahrenheit") {
      celsius = (value - 32) * 5/9;
    } else if (from === "kelvin") {
      celsius = value - 273.15;
    }
    
    // Convert from Celsius to target
    if (to === "fahrenheit") {
      return celsius * 9/5 + 32;
    } else if (to === "kelvin") {
      return celsius + 273.15;
    }
    
    return celsius;
  };

  useEffect(() => {
    if (fromValue) {
      const result = convertValue(fromValue, fromUnit, toUnit, category);
      setToValue(result);
    }
  }, [fromValue, fromUnit, toUnit, category]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const firstUnit = Object.keys(conversions[newCategory as keyof typeof conversions].units)[0];
    const secondUnit = Object.keys(conversions[newCategory as keyof typeof conversions].units)[1];
    setFromUnit(firstUnit);
    setToUnit(secondUnit);
    setFromValue("");
    setToValue("");
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(toValue);
    toast({
      title: "Copied!",
      description: "Conversion result copied to clipboard",
    });
  };

  const clearAll = () => {
    setFromValue("");
    setToValue("");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <ArrowLeftRight className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Unit Converter</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Convert between different units of measurement with precision and ease. 
            Support for length, weight, temperature, volume, area, and speed conversions.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="unit-converter-top" size="banner" />

        <div className="space-y-8">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Conversion Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={category} onValueChange={handleCategoryChange}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  {Object.entries(conversions).map(([key, value]) => (
                    <TabsTrigger key={key} value={key} className="text-xs lg:text-sm">
                      {value.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Converter Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* From Unit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  From
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapUnits}
                    className="ml-auto"
                  >
                    <ArrowLeftRight size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="from-unit">Unit</Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conversions[category as keyof typeof conversions].units).map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="from-value">Value</Label>
                  <Input
                    id="from-value"
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    placeholder="Enter value to convert"
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* To Unit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  To
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyResult}
                    className="ml-auto"
                    disabled={!toValue}
                  >
                    <Copy size={16} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="to-unit">Unit</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conversions[category as keyof typeof conversions].units).map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="to-value">Result</Label>
                  <Input
                    id="to-value"
                    type="text"
                    value={toValue}
                    readOnly
                    placeholder="Conversion result"
                    className="text-lg font-mono bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button onClick={clearAll} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              Clear
            </Button>
          </div>

          {/* Quick Conversion Table */}
          {fromValue && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(conversions[category as keyof typeof conversions].units).map(([key, unit]) => {
                    const result = convertValue(fromValue, fromUnit, key, category);
                    return (
                      <div key={key} className="p-3 border rounded-lg">
                        <div className="font-medium">{unit.name}</div>
                        <div className="text-lg font-mono">{result}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="unit-converter-bottom" size="banner" />
        </div>
      </div>
    </div>
  );
}