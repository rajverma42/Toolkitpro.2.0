import React, { useEffect, useRef, useState } from 'react';

export type AdSlotType =
  | 'top-banner'
  | 'tool-inline'
  | 'in-feed'
  | 'native'
  | 'rectangle-300x250'
  | 'mobile-320x50'
  | 'bottom-anchor';

interface AdBannerProps {
  slotType: AdSlotType;
  adClient?: string;
  adSlot?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

// User's Verified Adsterra / Bauval Ad Keys
const AD_728x90_KEY = 'b6dc7debf459989eb26ba8449901ffe2';
const AD_728x90_SRC = 'https://bauval.org/22/b6dc7debf459989eb26ba8449901ffe2';

const AD_320x50_KEY = 'cdb2b16ac733e4777ae45c2c948daece';
const AD_320x50_SRC = 'https://bauval.org/22/cdb2b16ac733e4777ae45c2c948daece';

const AD_300x250_KEY = '836647e19c8a2fd77c4326e632dd75e9';
const AD_300x250_SRC = 'https://bauval.org/22/836647e19c8a2fd77c4326e632dd75e9';

const NATIVE_CONTAINER_ID = 'container-c2608aed4d10e76bb8072ec639e963f7';
const NATIVE_SRC = 'https://bauval.org/21/c2608aed4d10e76bb8072ec639e963f7';

export const AdBanner: React.FC<AdBannerProps> = ({
  slotType,
  adClient,
  adSlot,
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [isAnchorDismissed, setIsAnchorDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('tp-ad-anchor-closed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // If Google AdSense is active
    if (adClient && adSlot && !pushedRef.current) {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        }
      } catch (err) {
        // Silently catch ad-blocker or duplicate push errors
      }
    }
  }, [adClient, adSlot]);

  // Generate safe isolated iframe HTML for any Bauval ad unit
  const createIframeDoc = (key: string, src: string, width: number, height: number) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe { border: 0 !important; max-width: 100% !important; }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="${src}"></script>
</body>
</html>`;

  // Native In-Feed Widget iframe HTML
  const nativeIframeDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 100%;
      min-height: 100%;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #${NATIVE_CONTAINER_ID} {
      width: 100%;
      min-height: 120px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div id="${NATIVE_CONTAINER_ID}"></div>
  <script async="async" data-cfasync="false" src="${NATIVE_SRC}"></script>
</body>
</html>`;

  // Handle Mobile Sticky Bottom Anchor
  if (slotType === 'bottom-anchor') {
    if (!isMobile || isAnchorDismissed) return null;

    return (
      <div
        className="mobile-sticky-ad-anchor"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 8px 6px',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '8.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-dim)',
              opacity: 0.7,
            }}
          >
            Advertisement
          </span>
          <button
            type="button"
            onClick={() => {
              setIsAnchorDismissed(true);
              try {
                sessionStorage.setItem('tp-ad-anchor-closed', 'true');
              } catch {}
            }}
            aria-label="Close Advertisement"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 4px',
              lineHeight: 1,
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            width: '320px',
            height: '50px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <iframe
            title="Mobile Advertisement"
            srcDoc={createIframeDoc(AD_320x50_KEY, AD_320x50_SRC, 320, 50)}
            width={320}
            height={50}
            style={{
              border: 'none',
              overflow: 'hidden',
              width: '320px',
              height: '50px',
              background: 'transparent',
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Standard inline / feed slots
  const isNative = slotType === 'native' || slotType === 'in-feed';
  const isRectangle = slotType === 'rectangle-300x250';
  const isDedicatedMobile = slotType === 'mobile-320x50';

  let activeWidth = 728;
  let activeHeight = 90;
  let activeKey = AD_728x90_KEY;
  let activeSrc = AD_728x90_SRC;

  if (isRectangle) {
    activeWidth = 300;
    activeHeight = 250;
    activeKey = AD_300x250_KEY;
    activeSrc = AD_300x250_SRC;
  } else if (isDedicatedMobile || (isMobile && (slotType === 'top-banner' || slotType === 'tool-inline'))) {
    // Automatically switch to crisp 320x50 mobile banner on phone screens
    activeWidth = 320;
    activeHeight = 50;
    activeKey = AD_320x50_KEY;
    activeSrc = AD_320x50_SRC;
  }

  return (
    <div
      ref={adRef}
      className={`ad-container-wrap ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: isNative ? '24px auto' : isRectangle ? '20px auto' : '16px auto',
        boxSizing: 'border-box',
      }}
      aria-label="Advertisement"
    >
      {/* Label */}
      <span
        style={{
          fontSize: '9.5px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          marginBottom: '4px',
          userSelect: 'none',
          opacity: 0.65,
        }}
      >
        {isNative ? 'Sponsored Links' : 'Advertisement'}
      </span>

      {adClient && adSlot ? (
        /* Google AdSense responsive unit */
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', textAlign: 'center' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : isNative ? (
        /* Native In-Feed Widget */
        <div
          style={{
            width: '100%',
            maxWidth: '1000px',
            minHeight: '160px',
            borderRadius: 'var(--radius-m)',
            overflow: 'hidden',
          }}
        >
          <iframe
            title="Sponsored"
            srcDoc={nativeIframeDoc}
            width="100%"
            height="180"
            style={{
              border: 'none',
              width: '100%',
              minHeight: '180px',
              background: 'transparent',
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      ) : (
        /* Bauval Banner (320x50 mobile, 300x250 rectangle, or 728x90 desktop) */
        <div
          style={{
            width: `${activeWidth}px`,
            maxWidth: '100%',
            height: `${activeHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 'var(--radius-s)',
          }}
        >
          <iframe
            title="Advertisement"
            srcDoc={createIframeDoc(activeKey, activeSrc, activeWidth, activeHeight)}
            width={activeWidth}
            height={activeHeight}
            style={{
              border: 'none',
              overflow: 'hidden',
              width: `${activeWidth}px`,
              height: `${activeHeight}px`,
              background: 'transparent',
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default AdBanner;
