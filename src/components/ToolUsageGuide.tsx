import React, { useState } from 'react';
import type { Tool, Language } from '../types';
import { getToolName } from '../data/i18n';

interface ToolUsageGuideProps {
  tool: Tool;
  language: Language;
}

interface StepItem {
  title: string;
  description: string;
}

interface UsageInfo {
  badge: string;
  steps: StepItem[];
  proTip: string;
}

function getContextualUsage(tool: Tool, language: Language): UsageInfo {
  const isHi = language === 'hi';
  const name = getToolName(tool, language);

  // Category specific usage templates
  switch (tool.cat) {
    case 'pdf':
      return {
        badge: isHi ? 'PDF वर्कफ़्लो' : 'PDF Workflow',
        steps: [
          {
            title: isHi ? '1. अपनी PDF फ़ाइल चुनें' : '1. Select or Drop Your PDF',
            description: isHi
              ? 'अपलोड बटन पर क्लिक करके अपने डिवाइस से PDF फ़ाइल चुनें। फ़ाइल कभी भी किसी सर्वर पर अपलोड नहीं होती।'
              : 'Click the file chooser or drag & drop your PDF file. The file is processed purely in your browser without leaving your computer.',
          },
          {
            title: isHi ? '2. आवश्यक विकल्प सेट करें' : '2. Configure Parameters',
            description: isHi
              ? 'पेज नंबर, रोटेशन डिग्री, वॉटरमार्क टेक्स्ट या कम्प्रेशन सेटिंग्स जैसी ज़रूरी सेटिंग्स चुनें।'
              : 'Select your target options such as page ranges, rotation angle, watermark text, or layout options.',
          },
          {
            title: isHi ? '3. प्रोसेस और डाउनलोड करें' : '3. Process & Download Result',
            description: isHi
              ? 'एक्शन बटन पर क्लिक करें। प्रोसेसिंग पूरी होते ही अपनी नई PDF फ़ाइल तुरंत डाउनलोड करें।'
              : 'Click the action button to process. Once complete, click Download to save the modified PDF directly to your device.',
          },
        ],
        proTip: isHi
          ? 'बड़ी PDF फ़ाइलों को आसानी से देखने और एडिट करने के लिए ऊपर दाईं ओर दिए "Focus Mode" बटन का उपयोग करें।'
          : 'Tip: For multi-page PDFs or detailed form editing, toggle "Focus Mode" at the top right to expand the workspace.',
      };

    case 'image':
      return {
        badge: isHi ? 'इमेज प्रोसेसिंग' : 'Image Processing',
        steps: [
          {
            title: isHi ? '1. फ़ोटो या इमेज अपलोड करें' : '1. Choose an Image File',
            description: isHi
              ? 'अपने डिवाइस से कोई भी PNG, JPEG, WebP या SVG इमेज चुनें।'
              : 'Choose any image file (PNG, JPG, WebP, SVG) from your device. Everything renders in a local HTML5 canvas.',
          },
          {
            title: isHi ? '2. सेटिंग्स और इफ़ेक्ट्स एडजस्ट करें' : '2. Adjust Visual Controls',
            description: isHi
              ? 'आकार (width/height), आस्पेक्ट रेशियो, क्वालिटी स्लाइडर, फ़िल्टर्स या क्रॉप एरिया सेट करें।'
              : 'Tweak dimensions, aspect ratio, quality level, filters, color selection, or crop borders with live feedback.',
          },
          {
            title: isHi ? '3. एक्सपोर्ट और सेव करें' : '3. Inspect & Download',
            description: isHi
              ? 'लाइव रिजल्ट प्रीव्यू देखें और फिर "Download" बटन पर क्लिक करके रिजल्ट को अपने कंप्यूटर/फ़ोन में सेव करें।'
              : 'Review the live canvas preview to verify the modifications, then click Download to export the final asset.',
          },
        ],
        proTip: isHi
          ? 'कलर पिकर या इमेज क्रॉपर इस्तेमाल करते समय फुलस्क्रीन मोड ऑन करके सटीक पिक्सेल चुन सकते हैं।'
          : 'Tip: Click "Focus Mode" above when cropping or picking colors for pixel-perfect precision on wide screens.',
      };

    case 'calc':
      return {
        badge: isHi ? 'लाइव कैलकुलेटर' : 'Live Calculation',
        steps: [
          {
            title: isHi ? '1. इनपुट वैल्यूज़ दर्ज करें' : '1. Enter Your Numerical Values',
            description: isHi
              ? 'दिए गए फ़ील्ड्स में अपनी संख्याएं, प्रतिशत, तिथियां या दरें टाइप करें।'
              : 'Fill in the corresponding values (e.g. principal amount, interest rate, dates, or measurements).',
          },
          {
            title: isHi ? '2. लाइव रिजल्ट देखें' : '2. Instant Automatic Computation',
            description: isHi
              ? 'कैलकुलेशन आपके टाइप करते ही लाइव अपडेट होती है, किसी बटन को दबाने की ज़रूरत नहीं।'
              : 'Calculations evaluate automatically in real time as you type or change input selections.',
          },
          {
            title: isHi ? '3. परिणाम और ब्रेकडाउन का विश्लेषण करें' : '3. Review Summary & Schedule',
            description: isHi
              ? 'मुख्य आउटपुट, तालिकाएं या स्टेप-बाई-स्टेप विवरण देखें और अपने रिकॉर्ड के लिए नोट करें।'
              : 'Examine detailed breakdown schedules, amortizations, or formulas displayed directly below the inputs.',
          },
        ],
        proTip: isHi
          ? 'अगर आप नए सिरे से गणना करना चाहते हैं, तो ऊपर दिए "Reset" बटन पर क्लिक करके इनपुट्स साफ़ कर सकते हैं।'
          : 'Tip: Use the "Reset" button in the top toolbar anytime to restore default values and start a clean calculation.',
      };

    case 'converters':
      return {
        badge: isHi ? 'यूनिट कन्वर्टर' : 'Unit Conversion',
        steps: [
          {
            title: isHi ? '1. मात्रा और प्रारंभिक इकाई चुनें' : '1. Input Magnitude & Source Unit',
            description: isHi
              ? 'जिस मान को बदलना चाहते हैं उसे टाइप करें और ड्रॉपडाउन से उसकी इकाई चुनें।'
              : 'Type the value you want to convert and choose your source measurement unit from the list.',
          },
          {
            title: isHi ? '2. लक्षित इकाई चुनें' : '2. Choose Target Unit',
            description: isHi
              ? 'जिस इकाई में मान देखना चाहते हैं उसे चुनें। दोनों इकाइयों के बीच सटीक रूपांतरण तुरंत दिखाई देगा।'
              : 'Select the desired destination unit. Conversions compute instantaneously with high mathematical precision.',
          },
          {
            title: isHi ? '3. मान कॉपी करें' : '3. Copy Converted Value',
            description: isHi
              ? 'आउटपुट को सीधे अपने प्रोजेक्ट, असाइनमेंट या दस्तावेज़ में उपयोग करने के लिए कॉपी करें।'
              : 'Use the converted figure in your documents, engineering notes, or financial models.',
          },
        ],
        proTip: isHi
          ? 'अधिकांश कन्वर्टर्स में दोनों तरफ मान बदलकर पारस्परिक (reciprocal) रूपांतरण भी देखा जा सकता है।'
          : 'Tip: You can modify values on either side for convenient bidirectional and reciprocal unit conversions.',
      };

    case 'dev':
      return {
        badge: isHi ? 'डेवलपर टूल' : 'Developer Utility',
        steps: [
          {
            title: isHi ? '1. डेटा, कोड या टोकन पेस्ट करें' : '1. Paste Input Payload or Code',
            description: isHi
              ? 'JSON, XML, URL, Base64, कोड स्निपेट या टोकन को इनपुट टेक्स्टएरिया में पेस्ट करें।'
              : 'Paste your payload, raw JSON, encoded string, regex pattern, timestamp, or code snippet into the input field.',
          },
          {
            title: isHi ? '2. मोड या फ़ॉर्मेटिंग चुनें' : '2. Select Action / Mode',
            description: isHi
              ? 'प्रीटी-प्रिंट (Format), मिनिफाई (Minify), एनकोड, डिकोड या वैलिडेट करने का विकल्प चुनें।'
              : 'Select actions such as Pretty-Print, Minify, Encode, Decode, Validate, or Test against sample strings.',
          },
          {
            title: isHi ? '3. रिज़ल्ट कॉपी या डाउनलोड करें' : '3. Copy Formatted Result',
            description: isHi
              ? '"Copy" बटन पर क्लिक करके फ़ॉर्मेटेड आउटपुट को अपने कोड एडिटर में इस्तेमाल करें।'
              : 'Click the "Copy" button to grab the clean result and paste directly into your IDE or terminal.',
          },
        ],
        proTip: isHi
          ? 'बड़ी JSON फाइलों या कोड डिफ की तुलना करते समय "Focus Mode" का उपयोग करें ताकि अधिक स्क्रीन स्पेस मिले।'
          : 'Tip: Hit "Focus Mode" in the top bar to get maximum horizontal viewport width for long JSON files and code diffs.',
      };

    case 'security':
      return {
        badge: isHi ? 'सिक्योरिटी और क्रिप्टो' : 'Security & Crypto',
        steps: [
          {
            title: isHi ? '1. सुरक्षा पैरामीटर्स सेट करें' : '1. Configure Parameters',
            description: isHi
              ? 'पासवर्ड की लंबाई, कैरेक्टर सेट (अंक, सिंबल, कैपिटल) या हैश एल्गोरिदम (SHA-256, SHA-512) चुनें।'
              : 'Choose password/PIN length, character categories (uppercase, numbers, symbols), or cryptographic hash algorithms.',
          },
          {
            title: isHi ? '2. सुरक्षित जनरेशन / हैश बनाएं' : '2. Generate Locally via Web Crypto',
            description: isHi
              ? '"Generate" पर क्लिक करें। यह ब्राउज़र के क्रिप्टोग्राफ़िकली सुरक्षित Web Crypto API का उपयोग करता है।'
              : 'Click Generate or enter plain text. Keys and hashes are calculated using the browser’s native crypto.getRandomValues and SubtleCrypto.',
          },
          {
            title: isHi ? '3. सुरक्षित रूप से कॉपी करें' : '3. Copy to Password Manager',
            description: isHi
              ? 'जनरेट किए गए पासवर्ड या हैश को सुरक्षित रूप से कॉपी करके अपने पासवर्ड मैनेजर में सेव करें।'
              : 'Copy the result straight to your clipboard and store in your secure password manager.',
          },
        ],
        proTip: isHi
          ? 'यह टूल 100% ऑफ़लाइन काम करता है। जनरेट किया गया पासवर्ड या हैश कभी भी इंटरनेट पर नहीं भेजा जाता।'
          : 'Tip: 100% Offline guarantee. Keys, hashes, and passwords are never transmitted across the network.',
      };

    case 'productivity':
      return {
        badge: isHi ? 'प्रोडक्टिविटी टूल' : 'Productivity Tool',
        steps: [
          {
            title: isHi ? '1. कार्य या टाइमर सेट करें' : '1. Set Your Task or Timer',
            description: isHi
              ? 'अपना काम, टाइमर अवधि, टू-डू आइटम या विकल्प सूची दर्ज करें।'
              : 'Input your task name, focus duration, habit goal, or candidate options list.',
          },
          {
            title: isHi ? '2. इंटरैक्टिव सेशन शुरू करें' : '2. Start Session & Track',
            description: isHi
              ? 'टाइमर स्टार्ट करें, काम पूरा होने पर टिक करें, या रैंडम डिसीजन बटन दबाएं।'
              : 'Hit Start, mark checklist items, or trigger random draws. Counters update with sub-second precision.',
          },
          {
            title: isHi ? '3. प्रोग्रेस ऑटो-सेव रहती है' : '3. Automatic Local Saving',
            description: isHi
              ? 'आपका डेटा आपके ब्राउज़र के लोकल स्टोरेज में सुरक्षित रहता है, पेज रिफ्रेश होने पर भी नष्ट नहीं होता।'
              : 'Notes, habits, and tasks persist automatically in your browser’s localStorage across reloads.',
          },
        ],
        proTip: isHi
          ? 'टाइमर चलते समय अगर आप दूसरा टूल खोलते हैं, तो बैकग्राउंड टाइमर सुरक्षित रूप से साफ़ कर दिया जाता है।'
          : 'Tip: Active interval timers automatically perform resource cleanup when navigating between tools to save battery.',
      };

    case 'color':
      return {
        badge: isHi ? 'कलर व CSS जेनरेटर' : 'Color & CSS Tool',
        steps: [
          {
            title: isHi ? '1. बेस कलर या लेआउट चुनें' : '1. Select Color or CSS Layout',
            description: isHi
              ? 'कलर पिकर से रंग चुनें या CSS ग्रिड/फ़्लेक्सबॉक्स के रोज़ और कॉलम्स सेट करें।'
              : 'Pick a color from the visual picker or adjust CSS layout properties (columns, gap, justify, keyframes).',
          },
          {
            title: isHi ? '2. लाइव प्रीव्यू देखें' : '2. Preview Live Output',
            description: isHi
              ? 'कलर शेड्स, कॉन्ट्रास्ट रेशियो (WCAG AA/AAA) या लेआउट का लाइव प्रिव्यू तुरंत देखें।'
              : 'Inspect real-time color variations, contrast ratios, accessibility compliance, or box shadows on screen.',
          },
          {
            title: isHi ? '3. तैयार CSS कोड कॉपी करें' : '3. Copy CSS / Tailwind Code',
            description: isHi
              ? 'एक क्लिक में जनरेट किया गया CSS कोड या क्लास कॉपी करके अपने वेब प्रोजेक्ट में पेस्ट करें।'
              : 'Click Copy to export production-ready CSS rules, Tailwind utility classes, or hex codes directly to your codebase.',
          },
        ],
        proTip: isHi
          ? 'कलर कॉन्ट्रास्ट चेकर से टेक्स्ट और बैकग्राउंड का कॉन्ट्रास्ट मापकर अपनी वेबसाइट को सुलभ (accessible) बनाएं।'
          : 'Tip: Use the contrast checker to ensure your foreground text meets WCAG AA (4.5:1) standards for accessibility.',
      };

    case 'seo':
      return {
        badge: isHi ? 'SEO व मार्केटिंग' : 'SEO & Marketing',
        steps: [
          {
            title: isHi ? '1. वेबपेज विवरण दर्ज करें' : '1. Enter Page Information',
            description: isHi
              ? 'अपने पेज का शीर्षक (Title), विवरण (Description), URL और सोशल इमेज लिंक भरें।'
              : 'Enter your webpage title, meta description, canonical URL, and social share image URL.',
          },
          {
            title: isHi ? '2. लाइव SERP और सोशल प्रीव्यू जांचें' : '2. Check Live Snippet Preview',
            description: isHi
              ? 'Google सर्च और सोशल मीडिया (Twitter/X, Facebook) पर दिखने वाले प्रीव्यू और कैरेक्टर लिमिट्स चेक करें।'
              : 'Preview how your link will render on Google search results and Twitter cards, keeping character limits green.',
          },
          {
            title: isHi ? '3. टैग्स कॉपी करके वेबसाइट में लगाएं' : '3. Copy Meta Tags to HTML',
            description: isHi
              ? 'जनरेट किए गए HTML मेटा टैग्स को कॉपी करके अपने वेबपेज के <head> सेक्शन में पेस्ट करें।'
              : 'Copy the generated <meta> tags or robots.txt syntax directly into your website’s HTML <head> or root.',
          },
        ],
        proTip: isHi
          ? 'Google सर्च के लिए टाइटल 50–60 कैरेक्टर और डिस्क्रिप्शन 150–160 कैरेक्टर के बीच रखना सबसे अच्छा माना जाता है।'
          : 'Tip: Aim for 50–60 characters for SEO titles and 150–160 characters for meta descriptions to avoid snippet truncation.',
      };

    default: // Text & Writing
      return {
        badge: isHi ? 'टेक्स्ट टूल' : 'Text Processing',
        steps: [
          {
            title: isHi ? '1. टेक्स्ट दर्ज या पेस्ट करें' : '1. Type or Paste Your Text',
            description: isHi
              ? 'इनपुट बॉक्स में अपना टेक्स्ट पेस्ट करें या सीधे टाइप करना शुरू करें।'
              : 'Paste your content into the input field or begin typing directly.',
          },
          {
            title: isHi ? '2. एक्शन या ट्रांसफ़ॉर्मेशन चुनें' : '2. Choose Operation',
            description: isHi
              ? 'केस बदलना, डुप्लीकेट लाइन हटाना, सॉर्ट करना, स्लॉग बनाना या कैरेक्टर काउंट जैसी क्रियाएं चुनें।'
              : 'Select your preferred operation (e.g. UPPERCASE, Clean Whitespace, Sort A-Z, Strip Tags, Diff).',
          },
          {
            title: isHi ? '3. परिणाम कॉपी करें' : '3. Copy Clean Output',
            description: isHi
              ? 'रिजल्ट टेक्स्टएरिया से एक क्लिक में "Copy" बटन दबाकर कॉपी करें।'
              : 'Click the "Copy" button to instantly put the transformed text into your clipboard.',
          },
        ],
        proTip: isHi
          ? 'लाइव टूल्स इनपुट बदलते ही तुरंत आउटपुट अपडेट कर देते हैं — कोई पेज रीलोड नहीं होता।'
          : 'Tip: Transformations run live as you type, giving instant zero-latency feedback.',
      };
  }
}

export const ToolUsageGuide: React.FC<ToolUsageGuideProps> = ({ tool, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isHi = language === 'hi';
  const usage = getContextualUsage(tool, language);
  const toolName = getToolName(tool, language);

  return (
    <div
      style={{
        marginTop: 20,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-m)',
        overflow: 'hidden',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Collapsible Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="toolUsageContent"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: isOpen ? 'var(--surface-2)' : 'var(--surface)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '6px',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              {isHi ? `${toolName} का उपयोग कैसे करें` : `How to use ${toolName}`}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginTop: 1 }}>
              {usage.badge} &middot; {isHi ? 'स्टेप-बाई-स्टेप गाइड व टिप्स' : 'Step-by-step instructions & pro tips'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {isOpen ? (isHi ? 'छिपाएं' : 'Hide') : (isHi ? 'देखें' : 'Show Guide')}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              color: 'var(--text-dim)',
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div
          id="toolUsageContent"
          style={{
            padding: '20px 22px 22px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            animation: 'drawerSlide 0.2s ease',
          }}
        >
          {/* Step list */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
              marginBottom: 18,
            }}
          >
            {usage.steps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-s)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--text-dim)',
                    lineHeight: 1.55,
                  }}
                >
                  {step.description}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip & Privacy Assurance Strip */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-s)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              fontSize: '12.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)' }}>
              <span style={{ fontSize: '15px' }}>💡</span>
              <span style={{ fontWeight: 500, color: 'var(--text)' }}>{usage.proTip}</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--success)',
                fontWeight: 600,
                fontSize: '11.5px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{isHi ? '100% प्राइवेट और ब्राउज़र में सुरक्षित' : '100% Private & Browser-Based'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
