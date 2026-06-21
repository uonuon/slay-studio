// Ready-to-send WhatsApp/DM message templates for the owner to copy & paste.
// These are NOT tied to a single booking (the Schedule cards already generate
// per-booking confirm/remind messages). They're reusable canned replies in both
// languages, warm and on-brand, with [bracketed] blanks the owner fills in and
// real studio details (address, maps, InstaPay, promo) pulled from settings.

const WEB = "slay-studio.com";

// Build the templates, interpolating live studio details from settings so the
// owner never has to paste their address / link / code by hand.
export function messageTemplates(settings = {}) {
  const addrAr = (settings.address || "فيلا ١٩، النرجس ٥، التجمع الخامس").trim();
  const addrEn = (settings.addressEn || "Villa 19, Nargis 5, Fifth Settlement").trim();
  const maps = (settings.mapsUrl || "").trim();
  const instapay = (settings.instapay || "").trim();
  const promo = (settings.promos || []).find((p) => p.active && (p.code || "").trim());
  const code = promo ? promo.code.trim().toUpperCase() : "LOCAL";
  const pct = promo ? promo.pct : 10;

  // a maps line that disappears cleanly if no link is set
  const mapsAr = maps ? `\n📍 ${maps}` : "";
  const mapsEn = maps ? `\n📍 ${maps}` : "";

  const groups = [
    {
      id: "booking",
      icon: "📅",
      title: { en: "Booking & appointment", ar: "الحجز والميعاد" },
      items: [
        {
          id: "confirmed",
          icon: "✅",
          title: { en: "Booking confirmed", ar: "تأكيد الحجز" },
          en:
`Hi [name] 💜 Your Slay Studio booking is confirmed!

✨ [style]
📅 [day] at [time]

We've received your deposit, so your spot is all yours. To help us stay right on time, please wash your hair beforehand and come with it detangled in a simple bun or braid.

Our studio: ${addrEn}${mapsEn}

Can't wait to see you! 😊`,
          ar:
`أهلاً [الاسم] 💜 حجزك في سلاي استوديو اتأكد!

✨ [الستايل]
📅 [اليوم] الساعة [الساعة]

استلمنا المقدّم، يبقى ميعادك محجوز ليكي. وعشان نفضل في معادنا بالظبط، ياريت تغسلي شعرك قبل الموعد وتيجي وهو متسرّح وفي كعكة أو ضفيرة بسيطة.

مكاننا: ${addrAr}${mapsAr}

مستنيينك! 😊`,
        },
        {
          id: "prep",
          icon: "💇",
          title: { en: "How to prep before the appointment", ar: "تجهيز الشعر قبل الموعد" },
          en:
`Hi [name] 💜 Looking forward to seeing you on [day] at [time]!

To make the most of your appointment time, please:
• Wash your hair the night before or the morning of
• Come with it fully detangled and blow-dried
• Put it in a loose bun or braid

This way we don't spend your appointment detangling — we stay on schedule and your braids come out perfect ✨

See you soon! 😊`,
          ar:
`أهلاً [الاسم] 💜 مستنيينك يوم [اليوم] الساعة [الساعة]!

عشان نستغل وقت الموعد كله صح، ياريت:
• تغسلي شعرك الليلة اللي قبلها أو الصبح
• تيجي وهو متسرّح ومنشّف كويس
• وحطّيه في كعكة أو ضفيرة بسيطة

كده مش هنضيّع وقت الموعد في فك التشابك — هنفضل في معادنا وضفايرك تطلع مظبوطة ✨

في انتظارك! 😊`,
        },
        {
          id: "deposit",
          icon: "💳",
          title: { en: "Deposit / payment details", ar: "تفاصيل المقدّم والدفع" },
          en:
`To lock in your slot, please send the deposit on InstaPay 💳

Number: ${instapay || "[InstaPay number]"} (choose Account, not Wallet)

Then send me a screenshot here and I'll confirm your booking right away 💜`,
          ar:
`عشان نثبّت ميعادك، ياريت تبعتي المقدّم على إنستاباي 💳

الرقم: ${instapay || "[رقم إنستاباي]"} (اختاري حساب مش محفظة)

وبعدين ابعتيلي صورة التحويل هنا وأنا أأكدلك الحجز على طول 💜`,
        },
        {
          id: "location",
          icon: "📍",
          title: { en: "Location & directions", ar: "العنوان والاتجاهات" },
          en:
`Here's how to find us 📍

Slay Studio — ${addrEn}, New Cairo${mapsEn}

When you arrive, just message me here and I'll guide you in 💜`,
          ar:
`مكاننا بالظبط 📍

سلاي استوديو — ${addrAr}، القاهرة الجديدة${mapsAr}

أول ما توصلي ابعتيلي هنا وأنا أوجّهك 💜`,
        },
        {
          id: "reminder",
          icon: "⏰",
          title: { en: "Day-before reminder", ar: "تذكير قبل الموعد بيوم" },
          en:
`Hi [name] 💜 Just a little reminder of your appointment tomorrow, [day] at [time].

Please come with clean, detangled hair in a loose bun or braid so we can start right on time ✨ See you then!`,
          ar:
`أهلاً [الاسم] 💜 تذكير بسيط بميعادك بكرة يوم [اليوم] الساعة [الساعة].

ياريت تيجي وشعرك نضيف ومتسرّح وفي كعكة أو ضفيرة بسيطة عشان نبدأ في معادنا بالظبط ✨ في انتظارك!`,
        },
        {
          id: "late",
          icon: "🕒",
          title: { en: "Running a little behind", ar: "اعتذار عن التأخير" },
          en:
`Hi [name] 💜 So sorry — we're running about [x] minutes behind today, so your appointment may start a little later than planned.

Thank you so much for your patience 🌸 We'll make sure your braids are absolutely perfect.`,
          ar:
`أهلاً [الاسم] 💜 آسفين جدًا — إحنا متأخرين حوالي [دقايق] دقيقة النهاردة، فممكن ميعادك يبدأ متأخر شوية عن المحدد.

شكرًا لسعة صدرك 🌸 ووعد ضفايرك تطلع مظبوطة على الآخر.`,
        },
      ],
    },
    {
      id: "funnel",
      icon: "💬",
      title: { en: "Turn chats into bookings", ar: "حوّلي الرسائل لحجوزات" },
      items: [
        {
          id: "howToBook",
          icon: "🌸",
          title: { en: "How do I book?", ar: "إزاي أحجز؟" },
          en:
`Hi gorgeous 💗 All our styles, prices and open times are on the website — you can book in two taps 👇

🌸 ${WEB}

Pick your style and time, then a small deposit on WhatsApp locks it in. Here if you need anything ✨`,
          ar:
`أهلاً يا قمر 💗 كل التسريحات والأسعار والمواعيد المتاحة على موقعنا، وتقدري تحجزي في خطوتين 👇

🌸 ${WEB}

بتختاري الستايل والميعاد، وبيتأكد الحجز بمقدّم بسيط على واتساب. لو محتاجة أي مساعدة أنا هنا ✨`,
        },
        {
          id: "priceTime",
          icon: "💰",
          title: { en: "Price / availability question", ar: "سؤال عن السعر أو المواعيد" },
          en:
`All our prices and the live open slots are right on the site (it updates in real time) 📅

👉 ${WEB}

Pick your style and you'll see the exact price and available times instantly 💕`,
          ar:
`كل الأسعار والمواعيد الفاضية بتظهرلك مباشرة على الموقع (بتتحدّث لحظياً) 📅

👉 ${WEB}

اختاري الستايل وهتشوفي السعر والمواعيد المتاحة على طول 💕`,
        },
        {
          id: "loyal",
          icon: "🤍",
          title: { en: "Loyal-client discount", ar: "خصم العميلة الدائمة" },
          en:
`Because you're one of our loyal clients 🤍 here's a special discount just for you!

Book at ${WEB} and enter code: ${code}

It drops your total and deposit automatically ✨ (limited time)`,
          ar:
`لأنك من عملائنا الأوفياء 🤍 ليكي خصم خاص!

احجزي من ${WEB} واكتبي كود الخصم: ${code}

هيقلّل الإجمالي والمقدّم أوتوماتيك ✨ (الكود لفترة محدودة)`,
        },
        {
          id: "moved",
          icon: "🎉",
          title: { en: "We've moved / new studio", ar: "نقلنا لمكان جديد" },
          en:
`Exciting news — we've moved to a beautiful new studio! 🎉

You can now book online anytime at ${WEB} — pick your style, your time, in-studio or at home.

${addrEn}${mapsEn}

As a thank-you, use code ${code} for ${pct}% off 💜`,
          ar:
`خبر حلو — إحنا نقلنا لمكان جديد وجميل! 🎉

دلوقتي تقدري تحجزي أونلاين في أي وقت من ${WEB} — اختاري الستايل والميعاد، في الاستوديو أو في البيت.

${addrAr}${mapsAr}

وهدية ليكي، استخدمي كود ${code} وخدي خصم ${pct}% 💜`,
        },
        {
          id: "welcome",
          icon: "👋",
          title: { en: "Welcome / auto-reply", ar: "ترحيب / رد تلقائي" },
          en:
`Welcome to Slay Studio 🌸

The fastest way to book: see all our styles, prices and open times and reserve your spot on our site 👇
${WEB}

We'll reply here as soon as we can 💗`,
          ar:
`أهلاً بيكي في سلاي استوديو 🌸

أسرع طريقة للحجز: شوفي كل الستايلات والأسعار والمواعيد واحجزي مكانك من موقعنا 👇
${WEB}

وهنردّ عليكي هنا في أقرب وقت 💗`,
        },
      ],
    },
    {
      id: "after",
      icon: "✨",
      title: { en: "After the appointment", ar: "بعد الموعد" },
      items: [
        {
          id: "thanks",
          icon: "💜",
          title: { en: "Thank you + braid aftercare", ar: "شكر + العناية بالضفائر" },
          en:
`Thank you for coming to Slay Studio 💜 Your braids look gorgeous!

To keep them fresh and protect your hair:
• Wrap your hair in a satin or silk scarf/bonnet at night
• Keep your scalp moisturised with a light oil
• Don't pull the braids too tight
• They'll look their best for about 4–6 weeks ✨

Tag us in your photos 📸 and book your refresh anytime at ${WEB} 💗`,
          ar:
`شكرًا إنك زرتينا في سلاي استوديو 💜 ضفايرك شكلها تحفة!

عشان تفضل جديدة وتحافظي على شعرك:
• غطّي شعرك بإيشارب أو بونيه ساتان أو حرير بالليل
• رطّبي فروة راسك بزيت خفيف
• متشدّيش الضفائر أوي
• هتفضل في أحلى شكل حوالي ٤–٦ أسابيع ✨

اعمليلنا تاج في صورك 📸 واحجزي تجديدك في أي وقت من ${WEB} 💗`,
        },
        {
          id: "review",
          icon: "⭐",
          title: { en: "Ask for a review", ar: "طلب تقييم" },
          en:
`Hope you're loving your braids 💜

If you have a moment, it would mean the world to us if you shared a quick photo or a few words about your experience — it really helps our little studio grow 🌸

Thank you so much! 💗`,
          ar:
`أتمنى تكوني مبسوطة بضفايرك 💜

لو معاكي دقيقة، هيفرق معانا جدًا لو تشاركينا صورة سريعة أو كلمتين عن تجربتك — ده بيساعد الاستوديو الصغير بتاعنا يكبر 🌸

شكرًا جدًا ليكي! 💗`,
        },
        {
          id: "refresh",
          icon: "🔁",
          title: { en: "Refresh reminder (rebook)", ar: "تذكير بالتجديد" },
          en:
`Hi [name] 💜 It's been a few weeks — your braids are probably ready for a refresh!

Want to book your next look? You can pick a style and time at ${WEB}, or just reply here and I'll find you a spot ✨`,
          ar:
`أهلاً [الاسم] 💜 بقالك كام أسبوع — ضفايرك غالبًا جاهزة للتجديد!

تحبي تحجزي إطلالتك الجديدة؟ اختاري ستايل وميعاد من ${WEB}، أو ردّي هنا وأنا أدبّرلك ميعاد ✨`,
        },
      ],
    },
  ];

  // Apply the owner's saved edits (settings.msgTemplates) over the defaults.
  // Stored text is literal — once edited, a template no longer re-interpolates
  // live studio details (use "Reset to default" to go back to the generated one).
  const ov = settings.msgTemplates || {};
  for (const g of groups) {
    for (const it of g.items) {
      const o = ov[it.id];
      if (!o) continue;
      if (typeof o.ar === "string") it.ar = o.ar;
      if (typeof o.en === "string") it.en = o.en;
      it.edited = true;
    }
  }
  return groups;
}

// Flat list of templates worth sending to a specific booking — everything
// except the acquisition/funnel group (those aren't tied to one client).
export function bookingTemplates(settings = {}) {
  return messageTemplates(settings)
    .filter((g) => g.id !== "funnel")
    .flatMap((g) => g.items);
}

// Replace [name]/[day]/[time]/[style] (and their Arabic equivalents) with this
// booking's real values. Blank/unknown vars are left in place for manual edit.
export function fillTemplate(text, vars = {}) {
  const map = {
    "[name]": vars.name, "[الاسم]": vars.name,
    "[day]": vars.day, "[اليوم]": vars.day,
    "[time]": vars.time, "[الساعة]": vars.time,
    "[style]": vars.style, "[الستايل]": vars.style,
  };
  let out = text || "";
  for (const k in map) {
    if (map[k] != null && map[k] !== "") out = out.split(k).join(map[k]);
  }
  return out;
}
