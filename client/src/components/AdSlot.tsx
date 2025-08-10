import { useEffect, useState } from 'react';
import { useSlotAd, useRecordAdView } from '@/hooks/useAdManagement';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface AdSlotProps {
  slotId: string;
  position: string;
  page: string;
  className?: string;
}

export default function AdSlot({ slotId, position, page, className = '' }: AdSlotProps) {
  const { data: slotWithAd, isLoading } = useSlotAd(slotId);
  const recordView = useRecordAdView();
  const [hasRecordedView, setHasRecordedView] = useState(false);
  const [sessionId] = useState(() => 
    localStorage.getItem('session-id') || (() => {
      const id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('session-id', id);
      return id;
    })()
  );

  // Generate IP hash (simple hash for demo purposes)
  const ipHash = useState(() => {
    const ip = '127.0.0.1'; // In production, get from server
    return btoa(ip).slice(0, 10);
  })[0];

  useEffect(() => {
    if (slotWithAd && !hasRecordedView) {
      // Record impression
      recordView.mutate({
        slotId,
        campaignId: slotWithAd.campaign?.id || null,
        sessionId,
        ipHash,
        page,
        viewType: 'impression',
        userAgent: navigator.userAgent,
      });
      setHasRecordedView(true);
    }
  }, [slotWithAd, hasRecordedView, slotId, sessionId, ipHash, page, recordView]);

  const handleAdClick = () => {
    if (slotWithAd?.campaign) {
      // Record click
      recordView.mutate({
        slotId,
        campaignId: slotWithAd.campaign.id,
        sessionId,
        ipHash,
        page,
        viewType: 'click',
        userAgent: navigator.userAgent,
      });

      // Navigate to click URL if available
      if (slotWithAd.campaign.clickUrl) {
        window.open(slotWithAd.campaign.clickUrl, '_blank');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`ad-slot ad-slot-${position} ${className}`}>
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!slotWithAd || !slotWithAd.campaign) {
    // No ad campaign assigned, return empty div or placeholder
    return (
      <div className={`ad-slot ad-slot-${position} ${className}`} style={{ display: 'none' }}>
        {/* Hidden when no ad */}
      </div>
    );
  }

  const { slot, campaign } = slotWithAd;

  return (
    <div className={`ad-slot ad-slot-${position} ${className}`}>
      <Card 
        className="glassmorphism border-border/30 cursor-pointer hover:border-primary/50 transition-all duration-200"
        onClick={handleAdClick}
      >
        <div className="p-3">
          {/* Ad Content */}
          <div className="ad-content">
            {campaign.adType === 'banner' && (
              <div 
                className="banner-ad"
                dangerouslySetInnerHTML={{ __html: campaign.adCode }}
              />
            )}
            
            {campaign.adType === 'native' && (
              <div className="native-ad">
                <div className="text-xs text-muted-foreground mb-1">Sponsored</div>
                <div 
                  className="native-ad-content"
                  dangerouslySetInnerHTML={{ __html: campaign.adCode }}
                />
              </div>
            )}

            {campaign.adType === 'custom' && (
              <div 
                className="custom-ad"
                dangerouslySetInnerHTML={{ __html: campaign.adCode }}
              />
            )}
          </div>

          {/* Ad Label */}
          <div className="text-xs text-muted-foreground mt-2 text-center opacity-60">
            Advertisement
          </div>
        </div>
      </Card>
    </div>
  );
}