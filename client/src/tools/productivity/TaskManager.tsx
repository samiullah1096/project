import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Plus, Trash2, Calendar, Clock, Flag, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  category: string;
  tags: string[];
}

const priorities = {
  low: { color: 'bg-green-100 text-green-800', icon: '🟢' },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  high: { color: 'bg-red-100 text-red-800', icon: '🔴' }
};

const statuses = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
  'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed' }
};

const categories = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Finance',
  'Education',
  'Travel',
  'Home',
  'Other'
];

export default function TaskManager() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    category: 'Work',
    tags: []
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    document.title = "Task Manager - ToolSuite Pro | Organize and Track Your Daily Tasks";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional task management tool to organize, prioritize, and track your daily tasks. Features include due dates, priorities, categories, and progress tracking.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Task Manager",
      "description": "Professional task management and organization tool",
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

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Save tasks to localStorage whenever tasks change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      status: 'pending',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate || '',
      createdAt: new Date().toISOString(),
      category: newTask.category || 'Work',
      tags: newTask.tags || []
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      category: 'Work',
      tags: []
    });

    toast({
      title: "Task Added",
      description: "Your task has been created successfully",
    });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updatedTask = { 
          ...task, 
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined
        };
        return updatedTask;
      }
      return task;
    }));

    if (status === 'completed') {
      toast({
        title: "Task Completed",
        description: "Great job! Task marked as completed",
      });
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "Task Deleted",
      description: "Task has been removed",
    });
  };

  const addTagToNewTask = () => {
    if (newTag.trim() && !newTask.tags?.includes(newTag.trim())) {
      setNewTask(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTagFromNewTask = (tagToRemove: string) => {
    setNewTask(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isDueToday = (dueDate: string) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const filteredAndSortedTasks = () => {
    let filtered = tasks;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const overdue = tasks.filter(task => isOverdue(task.dueDate) && task.status !== 'completed').length;
    const dueToday = tasks.filter(task => isDueToday(task.dueDate) && task.status !== 'completed').length;
    
    return { total, completed, pending, inProgress, overdue, dueToday };
  };

  const exportTasks = () => {
    const csv = [
      ['Title', 'Description', 'Status', 'Priority', 'Due Date', 'Category', 'Tags', 'Created At', 'Completed At'].join(','),
      ...tasks.map(task => [
        task.title,
        task.description,
        task.status,
        task.priority,
        task.dueDate,
        task.category,
        task.tags.join(';'),
        task.createdAt,
        task.completedAt || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Tasks Exported",
      description: "Tasks have been exported to CSV",
    });
  };

  const clearCompletedTasks = () => {
    setTasks(prev => prev.filter(task => task.status !== 'completed'));
    toast({
      title: "Completed Tasks Cleared",
      description: "All completed tasks have been removed",
    });
  };

  const stats = getTaskStats();
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <CheckSquare className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Task Manager</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Organize and track your daily tasks with priorities, due dates, and categories. 
            Stay productive and never miss important deadlines.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="task-manager-top" page="productivity-tools" size="banner" />

        <div className="space-y-8">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center p-3 bg-green-500/5 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{stats.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-3 bg-gray-500/5 rounded-lg">
                  <div className="text-xl font-bold text-gray-600">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-3 bg-red-500/5 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </div>
                <div className="text-center p-3 bg-yellow-500/5 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{stats.dueToday}</div>
                  <div className="text-xs text-muted-foreground">Due Today</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="add-task">Add Task</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add-task" className="space-y-6">
              {/* Add New Task */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2" size={20} />
                    Add New Task
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title || ''}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter task title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="task-description">Description (Optional)</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter task description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <select
                        id="task-priority"
                        value={newTask.priority || 'medium'}
                        onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="task-category">Category</Label>
                      <select
                        id="task-category"
                        value={newTask.category || 'Work'}
                        onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="task-due-date">Due Date</Label>
                      <Input
                        id="task-due-date"
                        type="date"
                        value={newTask.dueDate || ''}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-tag">Tags</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        id="new-tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTagToNewTask()}
                      />
                      <Button onClick={addTagToNewTask} size="sm">Add</Button>
                    </div>
                    {newTask.tags && newTask.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newTask.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTagFromNewTask(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button onClick={addTask} className="w-full gradient-bg">
                    <Plus size={16} className="mr-2" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              {/* Filters and Controls */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Filter size={16} className="text-muted-foreground" />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="all">All Tasks</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority</option>
                        <option value="created">Created Date</option>
                      </select>
                    </div>

                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />

                    <div className="ml-auto flex space-x-2">
                      {tasks.length > 0 && (
                        <Button onClick={exportTasks} variant="outline" size="sm">
                          <Download size={16} className="mr-2" />
                          Export
                        </Button>
                      )}
                      {stats.completed > 0 && (
                        <Button onClick={clearCompletedTasks} variant="outline" size="sm">
                          Clear Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks List */}
              <div className="space-y-4">
                {filteredAndSortedTasks().length > 0 ? (
                  filteredAndSortedTasks().map((task) => (
                    <Card key={task.id} className={`${task.status === 'completed' ? 'opacity-75' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <input
                                type="checkbox"
                                checked={task.status === 'completed'}
                                onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'pending')}
                                className="rounded"
                              />
                              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                              <Badge className={priorities[task.priority].color}>
                                {priorities[task.priority].icon} {task.priority}
                              </Badge>
                              <Badge className={statuses[task.status].color}>
                                {statuses[task.status].label}
                              </Badge>
                            </div>

                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              {task.dueDate && (
                                <div className={`flex items-center space-x-1 ${
                                  isOverdue(task.dueDate) ? 'text-red-600' : 
                                  isDueToday(task.dueDate) ? 'text-yellow-600' : ''
                                }`}>
                                  <Calendar size={12} />
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  {isOverdue(task.dueDate) && <span>(Overdue)</span>}
                                  {isDueToday(task.dueDate) && <span>(Due Today)</span>}
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                              </div>
                              <span>Category: {task.category}</span>
                            </div>

                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-2 ml-4">
                            {task.status !== 'completed' && task.status !== 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                                variant="outline"
                              >
                                Start
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                variant="outline"
                              >
                                Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              variant="outline"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
                      <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No tasks match your search criteria' : 'Add your first task to get started!'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="task-manager-bottom" page="productivity-tools" size="banner" />
        </div>
      </div>
    </div>
  );
}