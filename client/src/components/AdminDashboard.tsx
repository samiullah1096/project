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
import { Pencil, Trash2, Plus, Settings, BarChart3, Users, Target, Eye, MousePointer, LogOut, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  type: z.enum(['adsense', 'medianet', 'amazon', 'propellerads', 'bidvertiser', 'chitika', 'infolinks', 'yllix', 'exoclick', 'adnow', 'revenuehits', 'popads', 'adsterra', 'trafficstars', 'ero-advertising', 'plugrush', 'juicyads', 'clickadilla', 'hilltopads', 'adcash', 'custom']),
  isActive: z.boolean().default(true),
  credentials: z.string().optional().default(''),
  settings: z.any().optional(),
});

const adCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  providerId: z.string().min(1, 'Provider is required'),
  adType: z.enum(['banner', 'video', 'native', 'popup']),
  adCode: z.string().min(1, 'Ad code is required'),
  dimensions: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  clickUrl: z.string().url().optional().or(z.literal('')).default(''),
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

export default function AdminDashboard() {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('providers');

  const handleLogout = () => {
    logout();
    toast({ title: "Success", description: "Logged out successfully" });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ToolSuite Pro - Admin Portal
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {user?.username}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Providers</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="slots" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Slots</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Provider</CardTitle>
                  <CardDescription>Create a new ad network provider</CardDescription>
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
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select provider type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="adsense">Google AdSense</SelectItem>
                                    <SelectItem value="medianet">Media.net</SelectItem>
                                    <SelectItem value="amazon">Amazon Associates</SelectItem>
                                    <SelectItem value="propellerads">PropellerAds</SelectItem>
                                    <SelectItem value="bidvertiser">BidVertiser</SelectItem>
                                    <SelectItem value="chitika">Chitika</SelectItem>
                                    <SelectItem value="infolinks">InfoLinks</SelectItem>
                                    <SelectItem value="yllix">Yllix</SelectItem>
                                    <SelectItem value="exoclick">ExoClick</SelectItem>
                                    <SelectItem value="adnow">AdNow</SelectItem>
                                    <SelectItem value="revenuehits">RevenueHits</SelectItem>
                                    <SelectItem value="popads">PopAds</SelectItem>
                                    <SelectItem value="adsterra">Adsterra</SelectItem>
                                    <SelectItem value="trafficstars">TrafficStars</SelectItem>
                                    <SelectItem value="ero-advertising">Ero-Advertising</SelectItem>
                                    <SelectItem value="plugrush">PlugRush</SelectItem>
                                    <SelectItem value="juicyads">JuicyAds</SelectItem>
                                    <SelectItem value="clickadilla">ClickAdilla</SelectItem>
                                    <SelectItem value="hilltopads">HilltopAds</SelectItem>
                                    <SelectItem value="adcash">AdCash</SelectItem>
                                    <SelectItem value="custom">Custom HTML</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
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
                                value={field.value || ''}
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
                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{provider.name}</h3>
                          <p className="text-sm text-gray-500">{provider.type}</p>
                        </div>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                    {providers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No providers found. Create your first provider above.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs placeholder */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Ad Campaigns</CardTitle>
                <CardDescription>Manage your ad campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Campaign management interface will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slots">
            <Card>
              <CardHeader>
                <CardTitle>Ad Slots</CardTitle>
                <CardDescription>Manage ad placement slots</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Ad slot management interface will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Slot Assignments</CardTitle>
                <CardDescription>Assign campaigns to ad slots</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Assignment management interface will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View ad performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Analytics dashboard will be here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}