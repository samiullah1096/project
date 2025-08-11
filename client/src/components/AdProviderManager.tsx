import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Settings, TrendingUp, DollarSign, Eye, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { getAllProviderConfigs } from '@/lib/adProviderConfigs';
import { AdNetworkIntegrator } from '@/lib/adNetworkIntegrations';

interface AdProvider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  credentials: string;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

interface AdCampaign {
  id: string;
  name: string;
  providerId: string;
  adType: string;
  adCode: string;
  dimensions: string;
  isActive: boolean;
  cpmRate: number;
  startDate?: string;
  endDate?: string;
}

interface AdSlot {
  id: string;
  name: string;
  position: string;
  page: string;
  isActive: boolean;
  adProvider: string;
  adCode: string;
}

export default function AdProviderManager() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ad providers
  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['/api/admin/ad-providers'],
  });

  // Fetch ad campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['/api/admin/ad-campaigns'],
  });

  // Fetch ad slots
  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/admin/ad-slots'],
  });

  // Fetch analytics
  const { data: analytics = [] } = useQuery({
    queryKey: ['/api/admin/ad-analytics'],
  });

  const addProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/ad-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-providers'] });
      setShowAddProvider(false);
    },
  });

  const addCampaignMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/ad-campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-campaigns'] });
      setShowAddCampaign(false);
    },
  });

  const handleAddProvider = (formData: FormData) => {
    const type = formData.get('type') as string;
    const credentials: Record<string, string> = {};
    
    // Get provider config
    const config = getAllProviderConfigs().find(p => p.name === type);
    if (config) {
      config.fields.forEach(field => {
        const value = formData.get(field.name) as string;
        if (value) {
          credentials[field.name] = value;
        }
      });
    }

    addProviderMutation.mutate({
      name: formData.get('name'),
      type,
      isActive: formData.get('isActive') === 'on',
      credentials: JSON.stringify(credentials),
      settings: {}
    });
  };

  const handleAddCampaign = (formData: FormData) => {
    const providerId = formData.get('providerId') as string;
    const provider = providers.find((p: AdProvider) => p.id === providerId);
    
    if (provider) {
      const credentials = JSON.parse(provider.credentials || '{}');
      const adType = formData.get('adType') as string;
      const dimensions = formData.get('dimensions') as string;
      
      // Generate ad code using our integration system
      const adCode = AdNetworkIntegrator.generateAdCode(
        provider.type,
        credentials,
        dimensions,
        adType
      );

      addCampaignMutation.mutate({
        name: formData.get('name'),
        providerId,
        adType,
        adCode: JSON.stringify(adCode),
        dimensions,
        isActive: formData.get('isActive') === 'on',
        cpmRate: parseInt(formData.get('cpmRate') as string || '0'),
        startDate: formData.get('startDate') || null,
        endDate: formData.get('endDate') || null,
      });
    }
  };

  if (providersLoading || campaignsLoading || slotsLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ad Provider Management</h1>
          <p className="text-muted-foreground">Manage ad networks, campaigns, and revenue optimization</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <AddProviderDialog onSubmit={handleAddProvider} />
          </Dialog>
          
          <Dialog open={showAddCampaign} onOpenChange={setShowAddCampaign}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <AddCampaignDialog providers={providers} onSubmit={handleAddCampaign} />
          </Dialog>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">$2,345</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ad Views</p>
                <p className="text-2xl font-bold">1.2M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">2.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.filter((c: AdCampaign) => c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Providers ({providers.length})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="slots">Ad Slots ({slots.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          <ProvidersTab providers={providers} />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignsTab campaigns={campaigns} providers={providers} />
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <SlotsTab slots={slots} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual tab components
function ProvidersTab({ providers }: { providers: AdProvider[] }) {
  return (
    <div className="grid gap-6">
      {providers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No ad providers configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first ad provider to start monetizing your platform
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider: AdProvider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                  <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{provider.type.replace('-', ' ')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{provider.type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(provider.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignsTab({ campaigns, providers }: { campaigns: AdCampaign[]; providers: AdProvider[] }) {
  return (
    <div className="grid gap-6">
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No ad campaigns created</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create campaigns to manage your ad placements and optimize revenue
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign: AdCampaign) => {
            const provider = providers.find((p: AdProvider) => p.id === campaign.providerId);
            return (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {provider?.name} • {campaign.adType} • {campaign.dimensions}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">${(campaign.cpmRate / 100).toFixed(2)} CPM</p>
                        <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SlotsTab({ slots }: { slots: AdSlot[] }) {
  return (
    <div className="grid gap-6">
      {slots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No ad slots configured</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create ad slots to define where ads appear on your platform
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slots.map((slot: AdSlot) => (
            <Card key={slot.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{slot.name}</CardTitle>
                  <Badge variant={slot.isActive ? 'default' : 'secondary'}>
                    {slot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="capitalize">{slot.position.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Page:</span>
                    <span className="capitalize">{slot.page}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <span className="capitalize">{slot.adProvider}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ analytics }: { analytics: any[] }) {
  return (
    <div className="space-y-6">
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Analytics data is updated in real-time based on ad performance and user interactions.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6">
        {analytics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No analytics data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Analytics will appear here once your ads start receiving views and clicks
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analytics.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold">Analytics Data</h3>
                  <pre className="text-sm text-muted-foreground mt-2">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Dialog components for adding providers and campaigns
function AddProviderDialog({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [selectedType, setSelectedType] = useState('');
  const providerConfigs = getAllProviderConfigs();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const selectedConfig = providerConfigs.find(config => config.name === selectedType);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add New Ad Provider</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Provider Name</Label>
            <Input id="name" name="name" placeholder="e.g., My AdSense Account" required />
          </div>
          <div>
            <Label htmlFor="type">Network Type</Label>
            <Select name="type" onValueChange={setSelectedType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select ad network" />
              </SelectTrigger>
              <SelectContent>
                {providerConfigs.map(config => (
                  <SelectItem key={config.name} value={config.name}>
                    {config.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedConfig && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium">{selectedConfig.displayName}</h4>
              <p className="text-sm text-muted-foreground">{selectedConfig.description}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {selectedConfig.fields.map(field => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type === 'password' ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="isActive" name="isActive" defaultChecked />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Add Provider</Button>
        </div>
      </form>
    </DialogContent>
  );
}

function AddCampaignDialog({ providers, onSubmit }: { providers: AdProvider[]; onSubmit: (data: FormData) => void }) {
  const [selectedProvider, setSelectedProvider] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  const selectedProviderData = providers.find((p: AdProvider) => p.id === selectedProvider);
  const providerConfig = selectedProviderData ? 
    getAllProviderConfigs().find(config => config.name === selectedProviderData.type) : null;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Create Ad Campaign</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" name="name" placeholder="e.g., Homepage Banner" required />
          </div>
          <div>
            <Label htmlFor="providerId">Ad Provider</Label>
            <Select name="providerId" onValueChange={setSelectedProvider} required>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.filter((p: AdProvider) => p.isActive).map((provider: AdProvider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {providerConfig && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adType">Ad Type</Label>
                <Select name="adType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ad type" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerConfig.adTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dimensions">Dimensions</Label>
                <Select name="dimensions" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerConfig.defaultDimensions.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpmRate">CPM Rate (cents)</Label>
                <Input 
                  id="cpmRate" 
                  name="cpmRate" 
                  type="number" 
                  min="0" 
                  placeholder="e.g., 250 = $2.50"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="isActive" name="isActive" defaultChecked />
          <Label htmlFor="isActive">Active Campaign</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit">Create Campaign</Button>
        </div>
      </form>
    </DialogContent>
  );
}