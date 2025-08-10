import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Trash2, Plus, Settings, BarChart3, Users, Target, Eye, MousePointer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useAdProviders, useCreateAdProvider, useUpdateAdProvider, useDeleteAdProvider,
  useAdCampaigns, useCreateAdCampaign, useUpdateAdCampaign, useDeleteAdCampaign,
  useAdSlotsAdmin, useCreateAdSlot, useUpdateAdSlot, useDeleteAdSlot,
  useSlotAssignments, useCreateSlotAssignment, useUpdateSlotAssignment, useDeleteSlotAssignment,
  useAdAnalytics
} from '@/hooks/useAdManagement';
import type { InsertAdProvider, InsertAdCampaign, InsertAdSlot, InsertAdSlotAssignment } from '@shared/schema';

// Form schemas
const adProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  type: z.enum(['adsense', 'medianet', 'custom']),
  isActive: z.boolean().default(true),
  credentials: z.string().optional(),
  settings: z.any().optional(),
});

const adCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  providerId: z.string().min(1, 'Provider is required'),
  adType: z.enum(['banner', 'video', 'native', 'popup']),
  adCode: z.string().min(1, 'Ad code is required'),
  dimensions: z.string().optional(),
  isActive: z.boolean().default(true),
  clickUrl: z.string().url().optional().or(z.literal('')),
  cpmRate: z.number().optional(),
});

const adSlotSchema = z.object({
  name: z.string().min(1, 'Slot name is required'),
  position: z.string().min(1, 'Position is required'),
  page: z.string().min(1, 'Page is required'),
  isActive: z.boolean().default(true),
});

const slotAssignmentSchema = z.object({
  slotId: z.string().min(1, 'Slot is required'),
  campaignId: z.string().min(1, 'Campaign is required'),
  assignedBy: z.string().min(1, 'Assigned by is required'),
  priority: z.number().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export default function AdminPortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('providers');

  // Queries
  const { data: providers = [] } = useAdProviders();
  const { data: campaigns = [] } = useAdCampaigns();
  const { data: slots = [] } = useAdSlotsAdmin();
  const { data: assignments = [] } = useSlotAssignments();
  const { data: analytics = [] } = useAdAnalytics();

  // Mutations
  const createProvider = useCreateAdProvider();
  const updateProvider = useUpdateAdProvider();
  const deleteProvider = useDeleteAdProvider();
  const createCampaign = useCreateAdCampaign();
  const updateCampaign = useUpdateAdCampaign();
  const deleteCampaign = useDeleteAdCampaign();
  const createSlot = useCreateAdSlot();
  const updateSlot = useUpdateAdSlot();
  const deleteSlot = useDeleteAdSlot();
  const createAssignment = useCreateSlotAssignment();
  const updateAssignment = useUpdateSlotAssignment();
  const deleteAssignment = useDeleteSlotAssignment();

  // Forms
  const providerForm = useForm<InsertAdProvider>({
    resolver: zodResolver(adProviderSchema),
    defaultValues: { isActive: true },
  });

  const campaignForm = useForm<InsertAdCampaign>({
    resolver: zodResolver(adCampaignSchema),
    defaultValues: { isActive: true },
  });

  const slotForm = useForm<InsertAdSlot>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: { isActive: true },
  });

  const assignmentForm = useForm<InsertAdSlotAssignment>({
    resolver: zodResolver(slotAssignmentSchema),
    defaultValues: { priority: 1, isActive: true, assignedBy: 'admin' },
  });

  // Handlers
  const handleCreateProvider = async (data: InsertAdProvider) => {
    try {
      await createProvider.mutateAsync(data);
      toast({ title: "Success", description: "Ad provider created successfully" });
      providerForm.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create ad provider", variant: "destructive" });
    }
  };

  const handleCreateCampaign = async (data: InsertAdCampaign) => {
    try {
      await createCampaign.mutateAsync(data);
      toast({ title: "Success", description: "Ad campaign created successfully" });
      campaignForm.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create ad campaign", variant: "destructive" });
    }
  };

  const handleCreateSlot = async (data: InsertAdSlot) => {
    try {
      await createSlot.mutateAsync(data);
      toast({ title: "Success", description: "Ad slot created successfully" });
      slotForm.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create ad slot", variant: "destructive" });
    }
  };

  const handleCreateAssignment = async (data: InsertAdSlotAssignment) => {
    try {
      await createAssignment.mutateAsync(data);
      toast({ title: "Success", description: "Ad assignment created successfully" });
      assignmentForm.reset();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create ad assignment", variant: "destructive" });
    }
  };

  const handleToggleProvider = async (id: string, isActive: boolean) => {
    try {
      await updateProvider.mutateAsync({ id, updates: { isActive } });
      toast({ title: "Success", description: `Ad provider ${isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update ad provider", variant: "destructive" });
    }
  };

  const handleToggleCampaign = async (id: string, isActive: boolean) => {
    try {
      await updateCampaign.mutateAsync({ id, updates: { isActive } });
      toast({ title: "Success", description: `Campaign ${isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update campaign", variant: "destructive" });
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteProvider.mutateAsync(id);
      toast({ title: "Success", description: "Ad provider deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete ad provider", variant: "destructive" });
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign.mutateAsync(id);
      toast({ title: "Success", description: "Campaign deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete campaign", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Ad Management Portal</h1>
        <p className="text-muted-foreground">
          Manage ad providers, campaigns, and slot assignments for ToolSuite Pro
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="slots" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Ad Slots
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Ad Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Ad Provider</CardTitle>
              <CardDescription>
                Configure ad providers like Google AdSense, Media.net, or custom solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...providerForm}>
                <form onSubmit={providerForm.handleSubmit(handleCreateProvider)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={providerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Google AdSense" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={providerForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Provider Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="adsense">Google AdSense</SelectItem>
                              <SelectItem value="medianet">Media.net</SelectItem>
                              <SelectItem value="custom">Custom HTML</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={providerForm.control}
                    name="credentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credentials (JSON)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='{"publisherId": "pub-123456", "adClientId": "ca-pub-123456"}'
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter provider credentials as JSON (will be encrypted)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createProvider.isPending}>
                    {createProvider.isPending ? 'Creating...' : 'Create Provider'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Providers</CardTitle>
              <CardDescription>Manage your ad network providers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(checked) => handleToggleProvider(provider.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>
                Create ad campaigns with specific targeting and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...campaignForm}>
                <form onSubmit={campaignForm.handleSubmit(handleCreateCampaign)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={campaignForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Sale Banner" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={campaignForm.control}
                      name="providerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id}>
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={campaignForm.control}
                      name="adType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ad type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="banner">Banner</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="native">Native</SelectItem>
                              <SelectItem value="popup">Popup</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={campaignForm.control}
                      name="dimensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dimensions</FormLabel>
                          <FormControl>
                            <Input placeholder="728x90" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={campaignForm.control}
                      name="clickUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Click URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={campaignForm.control}
                    name="adCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Code (HTML/JS)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="<div>Your ad HTML content here</div>"
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createCampaign.isPending}>
                    {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Campaigns</CardTitle>
              <CardDescription>Manage your advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const provider = providers.find(p => p.id === campaign.providerId);
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{provider?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{campaign.adType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={campaign.isActive}
                            onCheckedChange={(checked) => handleToggleCampaign(campaign.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Slots Tab */}
        <TabsContent value="slots" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Ad Slot</CardTitle>
              <CardDescription>
                Define ad placement positions on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...slotForm}>
                <form onSubmit={slotForm.handleSubmit(handleCreateSlot)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={slotForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slot Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Home Page Header" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={slotForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="header-banner">Header Banner</SelectItem>
                              <SelectItem value="sidebar-top">Sidebar Top</SelectItem>
                              <SelectItem value="sidebar-bottom">Sidebar Bottom</SelectItem>
                              <SelectItem value="footer-banner">Footer Banner</SelectItem>
                              <SelectItem value="tool-top">Tool Top</SelectItem>
                              <SelectItem value="tool-bottom">Tool Bottom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={slotForm.control}
                      name="page"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select page" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="pdf-tools">PDF Tools</SelectItem>
                              <SelectItem value="image-tools">Image Tools</SelectItem>
                              <SelectItem value="audio-tools">Audio Tools</SelectItem>
                              <SelectItem value="text-tools">Text Tools</SelectItem>
                              <SelectItem value="productivity-tools">Productivity Tools</SelectItem>
                              <SelectItem value="tool-page">Individual Tool Page</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createSlot.isPending}>
                    {createSlot.isPending ? 'Creating...' : 'Create Ad Slot'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ad Slots</CardTitle>
              <CardDescription>Manage ad placement slots across your website</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{slot.position}</Badge>
                      </TableCell>
                      <TableCell>{slot.page}</TableCell>
                      <TableCell>
                        <Badge variant={slot.isActive ? "default" : "secondary"}>
                          {slot.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(slot.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slot Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Campaign to Slot</CardTitle>
              <CardDescription>
                Map advertising campaigns to specific ad slots with priority settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...assignmentForm}>
                <form onSubmit={assignmentForm.handleSubmit(handleCreateAssignment)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={assignmentForm.control}
                      name="slotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Slot</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {slots.map((slot) => (
                                <SelectItem key={slot.id} value={slot.id}>
                                  {slot.name} ({slot.page})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assignmentForm.control}
                      name="campaignId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select campaign" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {campaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assignmentForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="10" 
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={createAssignment.isPending}>
                    {createAssignment.isPending ? 'Assigning...' : 'Assign Campaign'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slot Assignments</CardTitle>
              <CardDescription>Active campaign assignments to ad slots</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const slot = slots.find(s => s.id === assignment.slotId);
                    const campaign = campaigns.find(c => c.id === assignment.campaignId);
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {slot?.name || 'Unknown Slot'}
                        </TableCell>
                        <TableCell>{campaign?.name || 'Unknown Campaign'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.isActive ? "default" : "secondary"}>
                            {assignment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.length > 0 ? (
                    (analytics.reduce((sum, a) => sum + a.clicks, 0) / 
                     analytics.reduce((sum, a) => sum + a.impressions, 0) * 100).toFixed(2)
                  ) : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.isActive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Ad Performance</CardTitle>
              <CardDescription>Daily ad analytics for the past period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.slice(0, 10).map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>{stat.date}</TableCell>
                      <TableCell>{stat.page}</TableCell>
                      <TableCell>{stat.impressions}</TableCell>
                      <TableCell>{stat.clicks}</TableCell>
                      <TableCell>
                        {stat.impressions > 0 ? ((stat.clicks / stat.impressions) * 100).toFixed(2) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}