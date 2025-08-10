import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tool } from "@/lib/searchData";
import { Search, ExternalLink, FileText, Image, Volume2, Type, Briefcase } from "lucide-react";

interface SearchResultsProps {
  results: Tool[];
  isVisible: boolean;
  onClose: () => void;
  searchQuery: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'pdf':
      return <FileText className="w-4 h-4" />;
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'audio':
      return <Volume2 className="w-4 h-4" />;
    case 'text':
      return <Type className="w-4 h-4" />;
    case 'productivity':
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Search className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'pdf':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'image':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'audio':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'text':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'productivity':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export default function SearchResults({ results, isVisible, onClose, searchQuery }: SearchResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20 px-4">
        <div 
          ref={resultsRef}
          className="w-full max-w-4xl glassmorphism rounded-xl border border-white/20 max-h-[70vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  Search Results for "{searchQuery}"
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Found {results.length} tool{results.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[50vh] p-4">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2">No tools found</h4>
                <p className="text-muted-foreground">
                  Try searching for "PDF", "Image", "Audio", "Text", or "Productivity" tools
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.route}
                    onClick={onClose}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-card/80 border-white/10 bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${getCategoryColor(tool.category)}`}
                              >
                                <span className="flex items-center space-x-1">
                                  {getCategoryIcon(tool.category)}
                                  <span>{tool.category}</span>
                                </span>
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                              {tool.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tool.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tool.keywords.slice(0, 4).map((keyword) => (
                                <span 
                                  key={keyword}
                                  className="text-xs px-2 py-1 bg-muted/50 rounded-md text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                              {tool.keywords.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{tool.keywords.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground ml-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-xs text-muted-foreground">
                Click on any tool to start using it instantly
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}