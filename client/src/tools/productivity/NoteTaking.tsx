import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Trash2, Search, Plus, StickyNote, Clock, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  category: string;
}

const categories = [
  'General',
  'Work',
  'Personal',
  'Ideas',
  'Todo',
  'Meeting Notes',
  'Research',
  'Projects'
];

const tagColors = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-cyan-100 text-cyan-800'
];

export default function NoteTaking() {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note>({
    id: '',
    title: '',
    content: '',
    tags: [],
    createdAt: '',
    updatedAt: '',
    category: 'General'
  });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    document.title = "Note Taking - ToolSuite Pro | Quick Notes with Rich Text Formatting";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional note-taking app with rich text formatting, tags, categories, and search. Organize your thoughts, ideas, and important information efficiently.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Note Taking App",
      "description": "Professional note-taking and organization tool",
      "applicationCategory": "ProductivityApplication",
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

    // Load notes from localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Save notes to localStorage whenever notes change
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const now = new Date().toLocaleString();
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
      category: 'General'
    };
    
    setCurrentNote(newNote);
    setSelectedNote(newNote.id);
  };

  const saveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please add a title or content to save the note",
        variant: "destructive",
      });
      return;
    }

    const now = new Date().toLocaleString();
    const noteToSave = {
      ...currentNote,
      updatedAt: now,
      createdAt: currentNote.createdAt || now
    };

    const existingIndex = notes.findIndex(note => note.id === currentNote.id);
    
    if (existingIndex >= 0) {
      // Update existing note
      setNotes(prev => prev.map(note => 
        note.id === currentNote.id ? noteToSave : note
      ));
      toast({
        title: "Note Updated",
        description: "Your note has been saved successfully",
      });
    } else {
      // Add new note
      setNotes(prev => [noteToSave, ...prev]);
      toast({
        title: "Note Saved",
        description: "Your new note has been created",
      });
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote === noteId) {
      setCurrentNote({
        id: '',
        title: '',
        content: '',
        tags: [],
        createdAt: '',
        updatedAt: '',
        category: 'General'
      });
      setSelectedNote(null);
    }
    toast({
      title: "Note Deleted",
      description: "Note has been removed",
    });
  };

  const selectNote = (note: Note) => {
    setCurrentNote(note);
    setSelectedNote(note.id);
  };

  const addTag = () => {
    if (newTag.trim() && !currentNote.tags.includes(newTag.trim())) {
      setCurrentNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const exportNote = (note: Note) => {
    const content = `# ${note.title}\n\n${note.content}\n\n---\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}\nCategory: ${note.category}\nTags: ${note.tags.join(', ')}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Note Exported",
      description: "Note has been downloaded as Markdown",
    });
  };

  const exportAllNotes = () => {
    const content = notes.map(note => 
      `# ${note.title}\n\n${note.content}\n\n---\nCreated: ${note.createdAt}\nUpdated: ${note.updatedAt}\nCategory: ${note.category}\nTags: ${note.tags.join(', ')}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "All Notes Exported",
      description: "All notes have been downloaded as Markdown",
    });
  };

  const clearAllNotes = () => {
    setNotes([]);
    setCurrentNote({
      id: '',
      title: '',
      content: '',
      tags: [],
      createdAt: '',
      updatedAt: '',
      category: 'General'
    });
    setSelectedNote(null);
    localStorage.removeItem('notes');
    
    toast({
      title: "All Notes Cleared",
      description: "All notes have been deleted",
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <StickyNote className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Note Taking</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Capture your thoughts, ideas, and important information with our professional note-taking app. 
            Organize with tags, categories, and powerful search.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="note-taking-top" page="productivity-tools" size="banner" />

        <div className="space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <Button onClick={createNewNote} className="gradient-bg">
                  <Plus size={16} className="mr-2" />
                  New Note
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Search size={16} className="text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="All">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                {notes.length > 0 && (
                  <>
                    <Button onClick={exportAllNotes} variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Export All
                    </Button>
                    <Button onClick={clearAllNotes} variant="outline" size="sm">
                      <Trash2 size={16} className="mr-2" />
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notes List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StickyNote className="mr-2" size={20} />
                  Notes ({filteredNotes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedNote === note.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                        onClick={() => selectNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{note.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {note.content || 'No content'}
                            </p>
                            <div className="flex items-center mt-2 space-x-2 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{note.updatedAt}</span>
                            </div>
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {note.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{note.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No notes match your search' : 'No notes yet. Create your first note!'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Note Editor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedNote ? 'Edit Note' : 'New Note'}
                  </span>
                  <div className="flex space-x-2">
                    <Button onClick={saveNote} size="sm">
                      <Save size={16} className="mr-2" />
                      Save
                    </Button>
                    {selectedNote && (
                      <Button
                        onClick={() => {
                          const note = notes.find(n => n.id === selectedNote);
                          if (note) exportNote(note);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Download size={16} className="mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    value={currentNote.title}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter note title..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="note-category">Category</Label>
                    <select
                      id="note-category"
                      value={currentNote.category}
                      onChange={(e) => setCurrentNote(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="new-tag">Add Tags</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="new-tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} size="sm">
                        <Tag size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {currentNote.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentNote.tags.map((tag, index) => (
                        <Badge
                          key={tag}
                          className={`${getTagColor(index)} cursor-pointer`}
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    value={currentNote.content}
                    onChange={(e) => setCurrentNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Start writing your note..."
                    rows={15}
                    className="font-mono"
                  />
                </div>

                {currentNote.createdAt && (
                  <div className="text-xs text-muted-foreground">
                    Created: {currentNote.createdAt} | Updated: {currentNote.updatedAt}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          {notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{notes.length}</div>
                    <div className="text-sm text-muted-foreground">Total Notes</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {notes.reduce((total, note) => total + note.content.split(' ').length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Words</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {[...new Set(notes.flatMap(note => note.tags))].length}
                    </div>
                    <div className="text-sm text-muted-foreground">Unique Tags</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-500/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {[...new Set(notes.map(note => note.category))].length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="note-taking-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}