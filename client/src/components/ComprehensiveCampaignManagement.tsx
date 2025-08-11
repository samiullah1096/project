import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Plus, Pencil, Trash2, Target, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  providerId: z.string().min(1, 'Provider is required'),
  adType: z.enum(['banner', 'video', 'native', 'popup', 'interstitial', 'rewarded']),
  adCode: z.string().min(1, 'Ad code is required'),
  dimensions: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  clickUrl: z.string().url().optional().or(z.literal('')).default(''),
  cpmRate: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  targetAudience: z.record(z.any()).optional(),
  budget: z.number().optional(),
  frequency: z.number().optional(),
});

interface Campaign {
  id: string;
  name: string;
  providerId: string;
  adType: string;
  adCode: string;
  dimensions?: string;
  isActive: boolean;
  clickUrl?: string;
  cpmRate?: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Provider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface CampaignManagementProps {
  providers: Provider[];
  campaigns: Campaign[];
  onCreateCampaign: (data: any) => Promise<void>;
  onUpdateCampaign: (id: string, data: any) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onToggleCampaign: (id: string, isActive: boolean) => Promise<void>;
}

export default function ComprehensiveCampaignManagement({
  providers,
  campaigns,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onToggleCampaign
}: CampaignManagementProps) {
  const { toast } = useToast();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      providerId: '',
      adType: 'banner',
      adCode: '',
      dimensions: '',
      isActive: true,
      clickUrl: '',
      cpmRate: undefined,
      startDate: undefined,
      endDate: undefined,
      targetAudience: {},
      budget: undefined,
      frequency: undefined,
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing && selectedCampaign) {
        await onUpdateCampaign(selectedCampaign.id, data);
        toast({ title: "Success", description: "Campaign updated successfully" });
        setIsEditing(false);
        setSelectedCampaign(null);
      } else {
        await onCreateCampaign(data);
        toast({ title: "Success", description: "Campaign created successfully" });
      }
      form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: isEditing ? "Failed to update campaign" : "Failed to create campaign",
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsEditing(true);
    form.reset({
      name: campaign.name,
      providerId: campaign.providerId,
      adType: campaign.adType as any,
      adCode: campaign.adCode,
      dimensions: campaign.dimensions || '',
      isActive: campaign.isActive,
      clickUrl: campaign.clickUrl || '',
      cpmRate: campaign.cpmRate,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      targetAudience: campaign.targetAudience || {},
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedCampaign(null);
    form.reset();
  };

  const adTypeOptions = [
    { value: 'banner', label: 'Banner Advertisement' },
    { value: 'video', label: 'Video Advertisement' },
    { value: 'native', label: 'Native Advertisement' },
    { value: 'popup', label: 'Popup Advertisement' },
    { value: 'interstitial', label: 'Interstitial Advertisement' },
    { value: 'rewarded', label: 'Rewarded Advertisement' },
  ];

  const dimensionPresets = [
    '300x250', '728x90', '970x250', '320x50', '160x600', 
    '300x600', '336x280', '468x60', '970x90', '320x100'
  ];

  return (
    <div className="space-y-6">
      {/* Campaign Creation/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update campaign details and settings' : 'Create a new advertising campaign with advanced targeting options'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Sale Banner Campaign" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="providerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.filter(p => p.isActive).map((provider) => (
                            <SelectItem key={provider.id} value={provider.id}>
                              {provider.name} ({provider.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ad Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="adType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ad type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {adTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select dimensions" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dimensionPresets.map((preset) => (
                            <SelectItem key={preset} value={preset}>
                              {preset}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cpmRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPM Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2.50" 
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campaign Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="clickUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Click URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/landing-page" {...field} />
                    </FormControl>
                    <FormDescription>Where users will be redirected when they click the ad</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Code (HTML/JavaScript)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="<div>Your advertisement HTML/JavaScript code here</div>"
                        rows={8}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Complete HTML/JavaScript code for the advertisement</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {isEditing ? 'Update Campaign' : 'Create Campaign'}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Manage and monitor your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>CPM</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const provider = providers.find(p => p.id === campaign.providerId);
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.startDate && format(new Date(campaign.startDate), "MMM dd")} - 
                          {campaign.endDate && format(new Date(campaign.endDate), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{provider?.name}</div>
                        <div className="text-sm text-muted-foreground">{provider?.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.adType}</Badge>
                    </TableCell>
                    <TableCell>{campaign.dimensions || 'Auto'}</TableCell>
                    <TableCell>${campaign.cpmRate || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={campaign.isActive}
                          onCheckedChange={(checked) => onToggleCampaign(campaign.id, checked)}
                        />
                        <Badge variant={campaign.isActive ? "default" : "secondary"}>
                          {campaign.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDeleteCampaign(campaign.id)}
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
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found. Create your first campaign above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}