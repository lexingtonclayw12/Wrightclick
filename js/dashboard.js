/* ============================================
   WRIGHT CLICK STUDIO — dashboard.js
   Social Media Content Generator + Video Scripts
   ============================================ */

(function () {
  'use strict';

  const API_BASE = 'http://localhost:3001';

  /* ------------------------------------------
     TOAST
  ------------------------------------------ */
  function toast(msg, type = 'success') {
    const c = document.getElementById('toastContainer');
    if (!c) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  /* ------------------------------------------
     SIDEBAR NAVIGATION
  ------------------------------------------ */
  const sidebarItems = document.querySelectorAll('.sdash-sidebar-item');
  const panels = document.querySelectorAll('.sdash-panel');

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.dataset.panel;
      sidebarItems.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      const panel = document.getElementById(`panel-${panelId}`);
      if (panel) panel.classList.add('active');
      if (panelId === 'calendar') buildCalendar();
      if (panelId === 'leads') loadLeads();
      if (panelId === 'scripts') renderScript('website_roast');
    });
  });

  /* ------------------------------------------
     COPY BUTTONS
  ------------------------------------------ */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const targetId = btn.dataset.target;
    let text = '';
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) text = el.dataset.rawText || el.textContent;
    }
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
    });
  });

  /* ------------------------------------------
     CONTENT TEMPLATES
  ------------------------------------------ */
  const TEMPLATES = {
    facebook: {
      diagnostic: {
        professional: [
          `Is your website actually working for your business — or just sitting there?

We're offering FREE website diagnostics for a limited number of businesses this month. Here's what you get:

✦ A real design score (1-10) across 6 key areas
✦ Your top 3 biggest design problems identified
✦ A custom concept sketch showing how your site could look
✦ An action plan you can use immediately

No sales pitch. No obligation. Just honest feedback from a professional designer.

If you're tired of wondering why your site doesn't convert visitors into clients, this is for you.

👉 Claim your free diagnostic: [link in bio / comment FREE below]`,
          `I reviewed over 50 small business websites this year. The same problems show up over and over again.

Weak calls-to-action. Cluttered layouts. Mobile experiences that drive customers away. Hero sections that communicate nothing about the business in the first 3 seconds.

The worst part? Most of these businesses have no idea.

That's why we're offering FREE website audits this month.

You'll get a full written report with your score, specific issues, and a custom redesign concept — delivered to your inbox within 48 hours.

↓ Comment "AUDIT" or click the link below to claim yours.`
        ],
        bold: [
          `Your website has 3 seconds to impress. Most small business sites fail in under one.

We're giving away free website audits this month — and we're not pulling punches.

You'll get a brutally honest score, your real problems explained, and a concept showing what your site COULD look like.

This is not a bot scan. A real designer will review your site.

Drop your website URL in the comments or click the link. Let's see what we're working with.`
        ]
      },
      pain_point: {
        professional: [
          `Question: When's the last time someone called you directly from your website?

If you're struggling to answer that, your website probably isn't doing its job.

Most small business websites look fine — but they're missing the things that actually make people pick up the phone or fill out a contact form.

We can tell you exactly what those things are. For free.

→ Free website diagnostic, limited spots available. Link below.`
        ],
        bold: [
          `Hard truth: your website might be your #1 sales problem and you don't know it.

Confusing navigation. No clear CTA. Looks terrible on mobile. Loads slow. Doesn't explain what you do in 5 seconds.

Any of those sound familiar?

We'll audit your site for FREE and tell you exactly what's wrong. No fluff.

Comment "FIX IT" to get the link.`
        ]
      },
      value: {
        professional: [
          `Quick design tip that can increase your website's conversion rate today:

Your hero section (the first thing people see) should answer ONE question immediately: "What do you do and why should I care?"

Most business websites fail this test. They lead with the company name, a vague tagline, and a beautiful photo that tells visitors nothing useful.

Instead, try: "[What you do] for [who you help] so they can [outcome]."

Example: "Custom web design for local restaurants that want to turn their website into their best table."

Clear. Specific. Compelling.

---
If you want to know whether your site passes this test, we're offering free audits this month. Link in bio.`,
        ],
        conversational: [
          `Real talk — here's one thing that would instantly make most small business websites better:

👉 Add one clear, specific call-to-action above the fold.

Not "Learn More." Not "Welcome to our website." Something like "Book a free consultation" or "Get your quote in 2 minutes."

People need to be told exactly what to do next. If your site doesn't do that, they'll just leave.

Anyway — if you want a full honest look at your site, we're doing free audits this month. Comment below and I'll send you the link!`
        ]
      },
      social_proof: {
        professional: [
          `We redesigned a local law firm's website last month. Their inquiry rate doubled in 30 days.

The changes weren't dramatic — but they were strategic. Better hierarchy. Clearer calls-to-action. Trust signals moved to the right places.

Sometimes it's not about a complete overhaul. Sometimes it's 5 targeted changes.

That's why we're offering free website diagnostics this month. We'll identify your specific opportunities — no guesswork.

→ Grab your free audit: [link in bio]`
        ]
      },
      urgency: {
        professional: [
          `We're accepting 10 more free website diagnostic requests before closing the list for this month.

If you've been wondering why your website isn't generating leads — or just want an objective outside opinion from a professional designer — this is your chance.

What you get:
→ Design score (1-10) across 6 criteria
→ Top 3 problems with specific explanations
→ Custom redesign concept sketch
→ Actionable improvement plan

10 spots. First come, first served.

Click the link before they're gone.`
        ]
      },
      transformation: {
        professional: [
          `Before: A local contractor's website. Dark background, tiny text, no photos of their work, contact form buried at the bottom. 2 inquiries per month.

After: Clean layout. Big hero image of their best project. Clear pricing tiers. Phone number prominent in the header. Testimonials up front. 14 inquiries in the first month.

Same business. Same area. Same traffic. Different website.

Your website is your hardest-working employee — or it should be.

If you're not sure which category yours falls into, we're doing free audits right now. Link below.`
        ]
      }
    },

    instagram: {
      diagnostic: {
        professional: [
          `FREE website audit — limited spots 🔍

Your website score. Your 3 biggest design problems. A custom redesign concept. All free, delivered to your inbox in 48 hours.

This is for small business owners who want honest feedback from a real designer — not a generic SEO tool.

Tap the link in bio to claim yours.

#websitedesign #smallbusiness #webdesign #digitalmarketing #websiteredesign #freelancedesigner #webdesigner`,
          `Is your website doing its job? 🤔

Most small business sites look fine on the surface — but they're leaking leads every single day.

We're running free website diagnostics this month. A real designer reviews your site and tells you:

→ Your design score (out of 10)
→ Your 3 biggest conversion problems
→ A concept showing how it could look

No strings. No pitch. Just honest, useful feedback.

Link in bio to grab one of the remaining spots.

#websiteaudit #webdesign #smallbusinessowner #digitalstrategy #conversionoptimization`
        ],
        bold: [
          `Your website has 3 seconds ⏱️

3 seconds to make someone stay or bounce.

Most small business sites fail this test — and the owners have no idea.

We're giving away FREE website audits. Drop your URL, get a score, find out exactly what to fix.

Link in bio 👆

#webdesign #websitemakeover #smallbusiness #designtips`
        ]
      },
      value: {
        professional: [
          `🔑 The one design change that makes people stay on your website longer:

White space.

Not more content. Not more images. Fewer things on the page, with room to breathe.

When everything competes for attention, nothing gets attention. When you give key messages room, they land.

Most small business websites are cluttered because the owner thinks "more info = more trust." The opposite is true.

Clean = confident. Spacious = professional.

→ Want to know what YOUR site's design is doing right and wrong? Free audits in bio.

#webdesignthoughts #designtips #ux #smallbusinessmarketing`
        ]
      },
      pain_point: {
        bold: [
          `🚨 Your website might be your #1 sales problem.

Slow load time? They're gone.
Confusing navigation? They're gone.
No clear next step? They're gone.
Looks bad on mobile? 60% of your visitors are on mobile.

You work hard to get people to your site. Don't lose them once they arrive.

Free audit — link in bio. Let's fix it.

#websiteproblems #smallbusiness #webdesign #digitalmarketing #conversionrate`
        ]
      },
      social_proof: {
        conversational: [
          `Client result I'm proud of 🙌

Before working with us: a restaurant was getting about 8 online reservations per week through their website.

After redesign: 31 per week. Same menu. Same city. Same ad spend.

The difference was a site that actually communicated the vibe of the place, made reservations dead simple, and worked beautifully on mobile.

Good design isn't decoration. It's function.

If you want to know what your site could do with the right approach, free audits are open. Link in bio.

#webdesign #clientresults #restaurantmarketing #websiteredesign #ux`
        ]
      }
    },

    tiktok: {
      diagnostic: {
        bold: [
          `POV: You just found out your website is costing you clients every single day 😬

I'm a web designer and I'm giving away free website audits this month.

Drop your website in the comments and I'll tell you:
→ What score I'd give it out of 10
→ The #1 thing that's hurting your conversions
→ What I'd change first

Or grab the full free diagnostic in my bio — you get a score, your top 3 problems, AND a custom redesign concept.

Limited spots. Drop a 🔥 if you want one.

#webdesign #smallbusiness #websitedesign #businesstips #fyp #foryou`,
          `Stitch this if you own a small business with a website 👀

I rated 20 small business websites this week.

Only 3 of them had a clear call-to-action above the fold.
Only 4 of them looked good on mobile.
11 of them took over 4 seconds to load.

The wild part? These are real businesses spending money on ads — sending people to these sites.

I'm doing free website audits this month. Comment your URL and I'll rate it live. Or grab the full free report in my bio.

#webdesigner #websiteaudit #smallbusiness #digitalmarketing #fyp`
        ],
        conversational: [
          `Real talk — most small business websites are broken and the owners don't know it

I'm not talking about ugly. I'm talking about:
- No clear "what to do next"
- Looks terrible on your phone
- Takes forever to load
- Doesn't explain what you do in 5 seconds

I'm a web designer and I'm auditing sites for free this month. You get a score + your specific problems + a concept for what it could look like.

Link in bio. No sales call. Promise.

#webdesign #fyp #smallbusiness #websitetips`
        ]
      },
      value: {
        conversational: [
          `Web designer here 👋 Here's the #1 mistake I see on small business websites:

The homepage tries to explain EVERYTHING about the business.

Your services. Your history. Your team. Your values. All crammed onto one page competing for attention.

Your homepage has one job: get the right person to take ONE specific action.

Everything else goes on its own page.

This one change — removing the clutter and creating a clear single CTA — can double your inquiry rate.

Want me to look at YOUR site? Free audits are open this month. Link in bio.

#webdesign #digitalmarketing #websitetips #smallbusiness #fyp`
        ],
        bold: [
          `5-second website test — try this RIGHT NOW 🔥

Go to your website on your phone.

Can you immediately tell:
1. What the business does?
2. Who it's for?
3. What to do next?

If you're hesitating on any of those — you're losing clients.

I'm a web designer offering free website audits this month. Comment "TEST" and I'll check yours.

#webdesign #smallbusiness #ux #fyp #businesstips`
        ]
      }
    }
  };

  const HASHTAG_SETS = {
    facebook: { core: [], optional: [] },
    instagram: {
      diagnostic: ['#websitedesign', '#smallbusiness', '#webdesign', '#digitalmarketing', '#websiteredesign', '#webdesigner', '#businessgrowth', '#websiteaudit', '#conversionoptimization', '#ux'],
      value: ['#webdesignthoughts', '#designtips', '#ux', '#smallbusinessmarketing', '#webdesign', '#uiux', '#digitaltips', '#businessadvice'],
      social_proof: ['#webdesign', '#clientresults', '#websiteredesign', '#smallbusiness', '#designstudio', '#realresults'],
      pain_point: ['#websiteproblems', '#smallbusiness', '#webdesign', '#digitalmarketing', '#conversionrate', '#businesstips'],
      urgency: ['#webdesign', '#limitedoffer', '#freereview', '#smallbusiness', '#websiteaudit', '#designstudio']
    },
    tiktok: {
      core: ['#webdesign', '#smallbusiness', '#websitedesign', '#fyp', '#foryou', '#businesstips', '#digitaltips', '#webdesigner']
    }
  };

  const CHAR_LIMITS = { facebook: 63206, instagram: 2200, tiktok: 2200 };

  /* ------------------------------------------
     CONTENT GENERATOR
  ------------------------------------------ */
  let currentPlatform = 'facebook';

  const platformTabs = document.getElementById('platformTabs');
  const campaignTypeEl = document.getElementById('campaignType');
  const postToneEl = document.getElementById('postTone');
  const generateBtn = document.getElementById('generateBtn');
  const generateAllBtn = document.getElementById('generateAllBtn');

  if (platformTabs) {
    platformTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.platform-tab');
      if (!tab) return;
      platformTabs.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPlatform = tab.dataset.platform;
    });
  }

  function getPost(platform, campaignType, tone) {
    const platformPosts = TEMPLATES[platform];
    if (!platformPosts) return null;
    const campaignPosts = platformPosts[campaignType] || platformPosts['diagnostic'];
    if (!campaignPosts) return null;
    const tonePosts = campaignPosts[tone] || campaignPosts['professional'] || campaignPosts['bold'] || campaignPosts['conversational'];
    if (!tonePosts || !tonePosts.length) return null;
    return tonePosts[Math.floor(Math.random() * tonePosts.length)];
  }

  function getHashtags(platform, campaignType) {
    if (platform === 'facebook') return [];
    const sets = HASHTAG_SETS[platform];
    if (!sets) return [];
    const tags = sets[campaignType] || sets.core || [];
    if (platform === 'tiktok') return [...tags, ...HASHTAG_SETS.tiktok.core].filter((v, i, a) => a.indexOf(v) === i);
    return tags;
  }

  function renderPost(postText, platform, campaignType, mainEl, hashEl, countEl) {
    if (!postText) { mainEl.textContent = 'No template for this combination. Try a different tone or campaign type.'; return; }
    mainEl.textContent = postText;
    mainEl.dataset.rawText = postText;

    const tags = getHashtags(platform, campaignType);
    if (hashEl) {
      hashEl.dataset.rawText = tags.join(' ');
      hashEl.innerHTML = tags.map(t => `<span class="hashtag">${t}</span>`).join('');
    }

    const limit = CHAR_LIMITS[platform] || 2200;
    const len = postText.length;
    if (countEl) {
      countEl.textContent = `${len} / ${limit} characters`;
      countEl.classList.toggle('over', len > limit);
    }
  }

  function generatePosts() {
    const platform = currentPlatform;
    const campaignType = campaignTypeEl ? campaignTypeEl.value : 'diagnostic';
    const tone = postToneEl ? postToneEl.value : 'professional';

    const mainPost = getPost(platform, campaignType, tone);
    const altTone = tone === 'professional' ? 'bold' : 'professional';
    const altPost = getPost(platform, campaignType, altTone);

    document.getElementById('previewPlatformName').textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    renderPost(mainPost, platform, campaignType,
      document.getElementById('mainPostText'),
      document.getElementById('mainHashtagsText'),
      document.getElementById('mainCharCount')
    );

    const altCard = document.getElementById('altPreview');
    if (altPost && altPost !== mainPost) {
      altCard.style.display = '';
      document.getElementById('altPreviewName').textContent = `${altTone.charAt(0).toUpperCase() + altTone.slice(1)} variation`;
      renderPost(altPost, platform, campaignType,
        document.getElementById('altPostText'),
        null,
        document.getElementById('altCharCount')
      );
    } else {
      altCard.style.display = 'none';
    }
  }

  if (generateBtn) generateBtn.addEventListener('click', generatePosts);
  if (generateAllBtn) {
    generateAllBtn.addEventListener('click', () => {
      ['facebook', 'instagram', 'tiktok'].forEach(p => {
        const campaignType = campaignTypeEl ? campaignTypeEl.value : 'diagnostic';
        const tone = postToneEl ? postToneEl.value : 'professional';
        const post = getPost(p, campaignType, tone);
        if (post) {
          const key = `draft_${p}_${Date.now()}`;
          localStorage.setItem(key, post);
        }
      });
      toast('All platform posts generated and saved to drafts!');
    });
  }

  /* ------------------------------------------
     VIDEO SCRIPTS
  ------------------------------------------ */
  const VIDEO_SCRIPTS = {
    website_roast: {
      title: 'Website Roast / Live Review',
      duration: '30–45 seconds',
      shots: [
        {
          label: 'HOOK (0–3 sec)',
          text: 'Look directly at camera. Say: "I\'m going to rate small business websites right now. Here\'s one I just found."',
          onscreen: 'RATING YOUR WEBSITE: 10/10 or BUST'
        },
        {
          label: 'PROBLEM REVEAL (3–15 sec)',
          text: 'Show screen recording of a (generic/example) website. Point out: "No clear CTA, looks terrible on mobile, hero image tells me nothing about the business." React honestly — not cruelly.',
          onscreen: 'CTA CLARITY: 2/10 ❌  MOBILE UX: 3/10 ❌'
        },
        {
          label: 'QUICK FIX (15–28 sec)',
          text: 'Cut back to yourself. "The fix for this is actually pretty simple. You need one clear action above the fold, a headline that explains what you do in 5 words, and a phone number people can actually tap."',
          onscreen: '3 FIXES THAT TAKE 1 HOUR'
        },
        {
          label: 'CTA (28–40 sec)',
          text: 'Hold up your phone / point to screen. "Want me to do this for YOUR site? I\'m giving away free website audits this month — full score, your problems, and a concept for free. Link in bio."',
          onscreen: '🔗 FREE AUDIT → LINK IN BIO'
        }
      ],
      aiPrompt: 'I need a TikTok/Reels script for a web designer offering free website audits. Hook: reviewing a bad website live. Middle: identify 2-3 specific problems quickly. End: offer free audit CTA. Tone: confident, helpful, not mean. 35-40 seconds when spoken aloud. First-person, conversational, no jargon.'
    },
    '3_mistakes': {
      title: '3 Mistakes Killing Your Sales',
      duration: '45–60 seconds',
      shots: [
        {
          label: 'HOOK (0–3 sec)',
          text: 'To camera: "3 website mistakes that are costing you sales right now — number 3 surprises everyone."',
          onscreen: '3 WEBSITE MISTAKES KILLING YOUR SALES 🚨'
        },
        {
          label: 'MISTAKE 1 (3–18 sec)',
          text: 'Hold up 1 finger. "Number one: your headline doesn\'t say what you do. If I land on your homepage and I can\'t figure out what your business does in 3 seconds, I\'m gone." Show example (screen recording).',
          onscreen: 'MISTAKE #1: NO CLEAR HEADLINE ❌'
        },
        {
          label: 'MISTAKE 2 (18–33 sec)',
          text: 'Hold up 2 fingers. "Number two: one call to action button. Not three. Not \'Learn More\', \'Get Started\', \'Contact Us\' all competing. ONE button. Make it obvious."',
          onscreen: 'MISTAKE #2: TOO MANY CTAs ❌'
        },
        {
          label: 'MISTAKE 3 (33–48 sec)',
          text: 'Hold up 3 fingers. "Number three, the one nobody talks about: your site looks completely different on mobile than desktop — and 60% of your visitors are on mobile. Check yours right now."',
          onscreen: 'MISTAKE #3: BROKEN MOBILE VIEW ❌  (60% of traffic is mobile!)'
        },
        {
          label: 'CTA (48–58 sec)',
          text: '"If you\'re making any of these mistakes and want a full free audit — score, specific problems, custom concept — grab one this month. Free. Link in bio."',
          onscreen: 'FREE WEBSITE AUDIT → LINK IN BIO 🔗'
        }
      ],
      aiPrompt: 'Write a TikTok script about "3 website mistakes killing small business sales." The 3 mistakes should be: no clear headline, too many competing CTAs, broken mobile experience. Each point needs to be 10-15 seconds of speaking. End with a free website audit offer CTA. Punchy, direct, 50-55 seconds total. No filler words. Numbered list format for the body.'
    },
    before_after: {
      title: 'Before & After Transformation',
      duration: '30–45 seconds',
      shots: [
        {
          label: 'HOOK (0–3 sec)',
          text: 'Point to screen: "This website was getting 2 calls a month. Watch what happened after we redesigned it."',
          onscreen: '2 CALLS/MONTH → BEFORE'
        },
        {
          label: 'BEFORE (3–15 sec)',
          text: 'Show the "before" site (use a generic example or client site with permission). Briefly note: "Cluttered. No clear CTA. Looks like it was made in 2012. Mobile is a disaster."',
          onscreen: 'BEFORE: ❌ No CTA  ❌ Cluttered  ❌ Not mobile-friendly'
        },
        {
          label: 'AFTER (15–28 sec)',
          text: 'Cut to the redesigned version. "Clean. Clear headline. One obvious button. Great on mobile. Trust signals right where they need to be." Pan or scroll slowly.',
          onscreen: 'AFTER: ✅ Clear headline  ✅ One CTA  ✅ Mobile-first'
        },
        {
          label: 'RESULT (28–35 sec)',
          text: '"They went from 2 calls a month to 11 in the first 30 days. Same traffic. Same ads. Just a better website."',
          onscreen: '11 CALLS IN MONTH 1 📈'
        },
        {
          label: 'CTA (35–45 sec)',
          text: '"Want to know what YOUR site could do? Free website audit — I\'ll score it, tell you the problems, and show you a concept. Link in bio."',
          onscreen: 'FREE AUDIT → LINK IN BIO 🔗'
        }
      ],
      aiPrompt: 'Write a TikTok/Reels script showing a small business website before and after a redesign. The result should be a clear business improvement (more calls, more leads). No specific company names. Hook is the result number. Tone: confident and inspiring. 35-40 seconds of speech. End with free website audit CTA.'
    },
    question_hook: {
      title: '5-Second Test Hook',
      duration: '20–30 seconds',
      shots: [
        {
          label: 'HOOK (0–4 sec)',
          text: '"Okay I need you to go to your website right now and I\'m going to ask you 3 questions."',
          onscreen: 'PULL UP YOUR WEBSITE RIGHT NOW ⬆️'
        },
        {
          label: 'THE 3 QUESTIONS (4–18 sec)',
          text: 'Count on fingers: "One — can you tell what this business does in 3 seconds? Two — is there ONE clear action to take? Three — does it look good on your phone?" Pause after each.',
          onscreen: '1. What do you do?\n2. What should I do next?\n3. Does mobile look good?'
        },
        {
          label: 'PUNCHLINE (18–24 sec)',
          text: '"If you hesitated on ANY of those, your website is losing you money every single day."',
          onscreen: 'EVERY DAY = LOST CLIENTS 💸'
        },
        {
          label: 'CTA (24–30 sec)',
          text: '"Free website audit in my bio. I\'ll score it and tell you exactly what to fix."',
          onscreen: 'FREE AUDIT → LINK IN BIO'
        }
      ],
      aiPrompt: 'Write a short TikTok/Reels script (25-30 seconds) that starts with "Go to your website right now." Asks 3 quick yes/no questions that make business owners realize their site has problems. Ends with free website audit CTA. Super punchy, no fluff, conversational. Makes people feel seen, not attacked.'
    },
    tip_value: {
      title: 'Design Tip (Value First)',
      duration: '30–45 seconds',
      shots: [
        {
          label: 'HOOK (0–4 sec)',
          text: '"Web designer here. Here\'s one change you can make to your website TODAY that will immediately make it more professional."',
          onscreen: 'FREE DESIGN TIP 👇 (save this)'
        },
        {
          label: 'THE TIP (4–25 sec)',
          text: 'Explain clearly: "Add more white space. More. Add more. I know it feels weird to have \'empty\' space but here\'s the thing — when everything is jammed together, nothing stands out. When you give your key messages room to breathe, they actually get read." Show example if possible.',
          onscreen: 'WHITE SPACE = TRUST\nCLUTTER = CONFUSION'
        },
        {
          label: 'QUICK PROOF (25–35 sec)',
          text: '"Apple, Tesla, every premium brand — look at their websites. Huge white space. Minimal text. One clear CTA. They know what they\'re doing."',
          onscreen: 'PREMIUM BRANDS ALL DO THIS ☝️'
        },
        {
          label: 'SOFT CTA (35–42 sec)',
          text: '"If you want me to look at your site and tell you exactly where to add space — and what else might be hurting you — I\'m doing free audits this month. Link in bio, no catch."',
          onscreen: 'FREE AUDIT → LINK IN BIO'
        }
      ],
      aiPrompt: 'Write a TikTok/Reels educational script for a web designer. Topic: the importance of white space in website design. Should feel genuine and helpful, not salesy. Give a real usable tip. Include a soft CTA at the end for a free website audit offer. 35-40 seconds when spoken naturally. Conversational tone, no jargon.'
    }
  };

  function renderScript(type) {
    const script = VIDEO_SCRIPTS[type];
    if (!script) return;

    const titleEl = document.getElementById('scriptOutputTitle');
    const outputEl = document.getElementById('scriptOutput');
    const copyBtn = document.getElementById('copyScriptBtn');
    const promptBtn = document.getElementById('copyPromptBtn');

    if (titleEl) titleEl.textContent = `${script.title} (${script.duration})`;

    if (outputEl) {
      outputEl.innerHTML = script.shots.map((shot, i) => `
        <div class="script-shot">
          <div class="shot-num">${i + 1}</div>
          <div class="shot-content">
            <div class="shot-label">${shot.label}</div>
            <div class="shot-text">${shot.text}</div>
            ${shot.onscreen ? `<div class="shot-onscreen">${shot.onscreen}</div>` : ''}
          </div>
        </div>
      `).join('');
    }

    if (copyBtn) {
      copyBtn.onclick = () => {
        const fullText = script.shots.map((s, i) => `[${s.label}]\n${s.text}${s.onscreen ? '\nON SCREEN: ' + s.onscreen : ''}`).join('\n\n');
        navigator.clipboard.writeText(fullText).then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => { copyBtn.textContent = orig; copyBtn.classList.remove('copied'); }, 2000);
        });
      };
    }

    if (promptBtn) {
      promptBtn.onclick = () => {
        navigator.clipboard.writeText(script.aiPrompt).then(() => {
          const orig = promptBtn.textContent;
          promptBtn.textContent = '✓ Prompt Copied!';
          promptBtn.classList.add('copied');
          setTimeout(() => { promptBtn.textContent = orig; promptBtn.classList.remove('copied'); }, 2000);
        });
      };
    }
  }

  const scriptTypeSelector = document.getElementById('scriptTypeSelector');
  if (scriptTypeSelector) {
    scriptTypeSelector.addEventListener('click', (e) => {
      const card = e.target.closest('.vscript-type-card');
      if (!card) return;
      scriptTypeSelector.querySelectorAll('.vscript-type-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      renderScript(card.dataset.script);
    });
    renderScript('website_roast');
  }

  /* ------------------------------------------
     30-DAY CALENDAR
  ------------------------------------------ */
  const CAL_PLAN = [
    // Week 1 — Introduction, value, awareness
    { day: 1, type: 'diag', platforms: ['FB', 'IG'], label: 'Diagnostic Launch' },
    { day: 2, type: 'value', platforms: ['IG', 'TT'], label: '5-Second Test' },
    { day: 3, type: 'behind', platforms: ['TT'], label: 'My Process' },
    { day: 4, type: 'value', platforms: ['FB'], label: 'White Space Tip' },
    { day: 5, type: 'diag', platforms: ['IG', 'TT'], label: 'Free Audit CTA' },
    // Week 2 — Pain points, social proof
    { day: 8, type: 'pain', platforms: ['FB', 'IG'], label: '3 Mistakes Hook' },
    { day: 9, type: 'social', platforms: ['TT'], label: 'Before/After Reel' },
    { day: 10, type: 'value', platforms: ['IG'], label: 'CTA Design Tip' },
    { day: 11, type: 'diag', platforms: ['FB', 'TT'], label: 'Spots Filling Fast' },
    { day: 12, type: 'behind', platforms: ['IG', 'TT'], label: 'Behind the Screen' },
    // Week 3 — Transformation, testimonials
    { day: 15, type: 'social', platforms: ['FB', 'IG'], label: 'Client Result' },
    { day: 16, type: 'value', platforms: ['TT'], label: 'Mobile UX Tip' },
    { day: 17, type: 'diag', platforms: ['IG', 'FB'], label: 'Audit Promo' },
    { day: 18, type: 'behind', platforms: ['TT'], label: 'Design Process' },
    { day: 19, type: 'pain', platforms: ['IG'], label: 'Site Losing Leads?' },
    // Week 4 — Urgency, conversion
    { day: 22, type: 'diag', platforms: ['FB', 'IG', 'TT'], label: 'Last Week of Month' },
    { day: 23, type: 'social', platforms: ['TT'], label: 'Testimonial Short' },
    { day: 24, type: 'value', platforms: ['FB', 'IG'], label: 'Hero Section Tips' },
    { day: 25, type: 'diag', platforms: ['IG', 'TT'], label: 'Urgency: 3 Spots Left' },
    { day: 26, type: 'behind', platforms: ['FB'], label: 'Studio Day BTS' },
    { day: 29, type: 'diag', platforms: ['FB', 'IG', 'TT'], label: 'Final Audit Call' },
    { day: 30, type: 'social', platforms: ['IG', 'TT'], label: 'Month Recap' },
  ];

  const TYPE_MAP = {
    diag: { cls: 'cal-post-chip--diag', short: 'Diagnostic' },
    value: { cls: 'cal-post-chip--value', short: 'Value' },
    social: { cls: 'cal-post-chip--social', short: 'Proof' },
    pain: { cls: 'cal-post-chip--diag', short: 'Pain Point' },
    behind: { cls: 'cal-post-chip--behind', short: 'BTS' }
  };

  function buildCalendar() {
    const grid = document.getElementById('calGrid');
    if (!grid || grid.dataset.built) return;
    grid.dataset.built = '1';

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headerRow = document.createElement('div');
    headerRow.className = 'cal-week';
    headerRow.innerHTML = '<div class="cal-week-label">Week</div>' + days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
    grid.appendChild(headerRow);

    for (let w = 0; w < 5; w++) {
      const row = document.createElement('div');
      row.className = 'cal-week';
      row.innerHTML = `<div class="cal-week-label">W${w + 1}</div>`;
      for (let d = 0; d < 7; d++) {
        const dayNum = w * 7 + d + 1;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell';
        cell.innerHTML = `<div class="cal-day-num">${dayNum}</div>`;
        const postsForDay = CAL_PLAN.filter(p => p.day === dayNum);
        postsForDay.forEach(p => {
          const m = TYPE_MAP[p.type];
          const chip = document.createElement('div');
          chip.className = `cal-post-chip ${m.cls}`;
          chip.title = `${p.label} — ${p.platforms.join(', ')}`;
          chip.textContent = p.label;
          cell.appendChild(chip);
        });
        row.appendChild(cell);
      }
      grid.appendChild(row);
    }
  }

  /* ------------------------------------------
     LEADS
  ------------------------------------------ */
  async function loadLeads() {
    try {
      const res = await fetch(`${API_BASE}/api/leads`);
      if (!res.ok) return renderSampleLeads();
      const leads = await res.json();
      renderLeads(leads);
    } catch {
      renderSampleLeads();
    }
  }

  function renderSampleLeads() {
    const sampleLeads = [
      { first_name: 'Maria', last_name: 'Garcia', email: 'maria@example.com', website_url: 'mariasbakery.com', business_type: 'Restaurant / Food & Beverage', created_at: '2026-06-07', status: 'new' },
      { first_name: 'Tom', last_name: 'Mitchell', email: 'tom@example.com', website_url: 'mitchellplumbing.com', business_type: 'Construction / Trades', created_at: '2026-06-06', status: 'sent' },
      { first_name: 'Sara', last_name: 'Chen', email: 'sara@example.com', website_url: 'sarafitness.co', business_type: 'Fitness / Personal Training', created_at: '2026-06-05', status: 'done' },
    ];
    renderLeads(sampleLeads, true);
  }

  function renderLeads(leads, isSample = false) {
    const tbody = document.getElementById('leadsTableBody');
    const total = document.getElementById('statTotal');
    const newEl = document.getElementById('statNew');
    const converted = document.getElementById('statConverted');
    const sent = document.getElementById('statSent');

    if (!tbody) return;

    if (total) total.textContent = leads.length + (isSample ? ' (sample)' : '');
    if (newEl) newEl.textContent = leads.filter(l => l.status === 'new').length;
    if (converted) converted.textContent = leads.filter(l => l.status === 'done').length;
    if (sent) sent.textContent = leads.filter(l => l.status === 'sent').length;

    tbody.innerHTML = leads.map(lead => `
      <tr>
        <td>${lead.first_name || ''} ${lead.last_name || ''}</td>
        <td>${lead.email || ''}</td>
        <td><a href="https://${lead.website_url}" target="_blank" style="color:var(--secondary)">${lead.website_url || ''}</a></td>
        <td style="color:var(--text-muted);font-size:0.8rem">${lead.business_type || ''}</td>
        <td style="color:var(--text-muted);font-size:0.8rem">${lead.created_at ? lead.created_at.split('T')[0] : ''}</td>
        <td><span class="lead-status lead-status--${lead.status || 'new'}">${lead.status || 'new'}</span></td>
        <td>
          <button class="copy-btn" style="font-size:0.72rem" onclick="window.open('mailto:${lead.email}?subject=Your Free Website Audit from Wright Click Studio')">Send Report</button>
        </td>
      </tr>
    `).join('');
  }

  const exportBtn = document.getElementById('exportLeadsBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leads`);
        const leads = res.ok ? await res.json() : [];
        if (!leads.length) { toast('No leads to export yet', 'error'); return; }
        const csv = ['Name,Email,Website,Business Type,Date,Status']
          .concat(leads.map(l => `${l.first_name} ${l.last_name},${l.email},${l.website_url},${l.business_type},${l.created_at},${l.status}`))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click();
        URL.revokeObjectURL(url);
      } catch { toast('Connect server to export leads', 'error'); }
    });
  }

  /* ------------------------------------------
     API SETUP
  ------------------------------------------ */
  function saveToStorage(key, value) { try { localStorage.setItem(key, value); } catch {} }

  const testMetaBtn = document.getElementById('testMetaBtn');
  if (testMetaBtn) {
    testMetaBtn.addEventListener('click', async () => {
      const token = document.getElementById('metaToken').value.trim();
      const pageId = document.getElementById('metaPageId').value.trim();
      const igId = document.getElementById('metaIgId').value.trim();
      if (!token || !pageId) { toast('Enter token and Page ID', 'error'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/config/meta`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, pageId, igId })
        });
        if (res.ok) {
          saveToStorage('meta_configured', '1');
          document.getElementById('metaStatus').textContent = 'Connected';
          document.getElementById('metaStatus').classList.replace('api-status-badge--pending', 'api-status-badge--connected');
          toast('Meta connection saved!');
        } else { throw new Error(); }
      } catch { toast('Could not connect — is the server running?', 'error'); }
    });
  }

  const testTikTokBtn = document.getElementById('testTikTokBtn');
  if (testTikTokBtn) {
    testTikTokBtn.addEventListener('click', async () => {
      const token = document.getElementById('tiktokToken').value.trim();
      const clientKey = document.getElementById('tiktokClientKey').value.trim();
      const clientSecret = document.getElementById('tiktokClientSecret').value.trim();
      if (!token) { toast('Enter TikTok access token', 'error'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/config/tiktok`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, clientKey, clientSecret })
        });
        if (res.ok) {
          document.getElementById('tiktokStatus').textContent = 'Connected';
          document.getElementById('tiktokStatus').classList.replace('api-status-badge--pending', 'api-status-badge--connected');
          toast('TikTok connection saved!');
        } else { throw new Error(); }
      } catch { toast('Could not connect — is the server running?', 'error'); }
    });
  }

  const checkServerBtn = document.getElementById('checkServerBtn');
  async function checkServer() {
    const statusBadge = document.getElementById('serverStatus');
    const ping = document.getElementById('serverPing');
    try {
      const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        if (statusBadge) { statusBadge.textContent = 'Online'; statusBadge.classList.replace('api-status-badge--pending', 'api-status-badge--connected'); }
        if (ping) ping.textContent = 'server: online ✓';
      } else { throw new Error(); }
    } catch {
      if (statusBadge) statusBadge.textContent = 'Offline';
      if (ping) ping.textContent = 'server: offline — run npm start in /server';
    }
  }
  if (checkServerBtn) checkServerBtn.addEventListener('click', checkServer);
  checkServer();

  /* ------------------------------------------
     PUBLISH NOW BUTTON (top nav)
  ------------------------------------------ */
  const publishNowBtn = document.getElementById('publishNowBtn');
  if (publishNowBtn) {
    publishNowBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const post = document.getElementById('mainPostText');
      if (!post || !post.textContent || post.textContent.includes('Click "Generate')) {
        toast('Generate a post first', 'error'); return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/posts/publish`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: currentPlatform, text: post.textContent, hashtags: document.getElementById('mainHashtagsText')?.dataset.rawText || '' })
        });
        if (res.ok) { toast(`Published to ${currentPlatform}! ✦`); }
        else { const d = await res.json(); toast(d.error || 'Publish failed', 'error'); }
      } catch { toast('Server offline — configure API in Settings first', 'error'); }
    });
  }

})();
