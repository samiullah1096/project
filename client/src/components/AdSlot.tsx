import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adQueries } from '@/lib/supabase';
import { AdNetworkIntegrator } from '@/lib/adNetworkIntegrations';

interface AdSlotProps {
  slotId: string;
  fallbackContent?: React.ReactNode;
  className?: string;
}

export default function AdSlot({ slotId, fallbackContent, className = '' }: AdSlotProps) {
  const [isRendered, setIsRendered] = useState(false);

  // Fetch ad slot data with active campaign from Supabase
  const { data: slotData, isLoading, error } = useQuery({
    queryKey: ['ad-slot', slotId],
    queryFn: async () => {
      const { data, error } = await adQueries.getSlotWithActiveCampaign(slotId);
      if (error) throw error;
      return data;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  useEffect(() => {
    if (slotData?.campaign && slotData.campaign.is_active) {
      // Track ad view in Supabase
      adQueries.recordAdView({
        slotId: slotData.slot.id,
        campaignId: slotData.campaign.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }).catch(err => {
        console.warn('Failed to track ad view:', err);
      });

      setIsRendered(true);
    }
  }, [slotData]);

  // Don't render anything while loading or if no active campaign
  if (isLoading) {
    return null;
  }

  if (error) {
    console.warn('Ad slot error:', error);
    return fallbackContent || null;
  }

  if (!slotData?.campaign || !slotData.campaign.is_active) {
    return fallbackContent || null;
  }

  const { slot, campaign } = slotData;

  // Parse ad code from campaign
  let adCode;
  try {
    adCode = JSON.parse(campaign.ad_code);
  } catch (e) {
    console.warn('Failed to parse ad code for campaign:', campaign.id);
    return fallbackContent || null;
  }

  // Generate ad content
  const generateAdContent = () => {
    const containerClass = `ad-slot ad-slot-${slot.position} ${className}`;
    
    return (
      <div className={containerClass} data-slot-id={slotId} data-campaign-id={campaign.id}>
        <div 
          dangerouslySetInnerHTML={{ __html: adCode.html || '' }}
          className="ad-content"
        />
        {adCode.script && (
          <div dangerouslySetInnerHTML={{ __html: adCode.script }} />
        )}
        {adCode.style && (
          <style dangerouslySetInnerHTML={{ __html: adCode.style }} />
        )}
      </div>
    );
  };

  return generateAdContent();
}

// Ad Blocker Detection Component
export function AdBlockerDetector({ children }: { children?: React.ReactNode }) {
  const [adBlockerDetected, setAdBlockerDetected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdBlocker = () => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      testAd.style.height = '1px';
      testAd.style.width = '1px';
      
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        setAdBlockerDetected(isBlocked);
        testAd.remove();
        
        if (isBlocked) {
          console.log('Ad blocker detected');
          // You can implement fallback content or messaging here
        }
      }, 100);
    };

    checkAdBlocker();
  }, []);

  if (adBlockerDetected === null) {
    return null; // Still checking
  }

  if (adBlockerDetected) {
    return (
      <div className="ad-blocker-detected p-4 bg-gray-100 rounded-lg text-center text-sm text-gray-600">
        <p>Please consider disabling your ad blocker to support our free tools.</p>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

// Pre-configured ad slots for common positions
export const HeroAdSlot = () => <AdSlot slotId="hero-banner" className="hero-ad mb-8" />;
export const SidebarAdSlot = () => <AdSlot slotId="sidebar-top" className="sidebar-ad mb-6" />;
export const FooterAdSlot = () => <AdSlot slotId="footer-top" className="footer-ad mt-8" />;
export const ContentAdSlot = () => <AdSlot slotId="content-middle" className="content-ad my-6" />;
export const FeatureAdSlot = () => <AdSlot slotId="feature-banner" className="feature-ad my-4" />;
export const BottomAdSlot = () => <AdSlot slotId="bottom-banner" className="bottom-ad mt-8" />;

// Ad Performance Tracker (for analytics)
export function trackAdClick(slotId: string, campaignId?: string) {
  fetch('/api/ads/track/click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      slotId,
      campaignId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    }),
  }).catch(err => {
    console.warn('Failed to track ad click:', err);
  });
}