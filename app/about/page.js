import PageShell from "@/components/PageShell";
import { getSeoData } from "@/lib/seo-data";

export const revalidate = 3600;

export const metadata = {
  title: "About — Healthy Braids in New Cairo · عن الاستوديو",
  description:
    "Slay Studio is a hair braiding studio in Fifth Settlement, New Cairo — knotless, box braids, boho, cornrows and colored strands (خصل), for adults and kids, in-studio or home service across Cairo.",
  alternates: { canonical: "https://slay-studio.com/about" },
};

export default async function Page() {
  const data = await getSeoData();
  const mapsUrl = data.settings.mapsUrl || "https://www.google.com/maps?q=30.011137008666992,31.46440315246582&z=17&hl=en";
  return (
    <PageShell data={data}>
      <h1>About Slay Studio · <span lang="ar">عن الاستوديو</span></h1>
      <div className="seo-cols">
        <p lang="en" dir="ltr">
          <strong>Slay Studio</strong> is a hair braiding studio in Fifth Settlement
          (El Tagamoa El Khames), New Cairo. We specialise in knotless braids, box
          braids, boho braids, cornrows and colored strands — what Egyptians search
          as <em>dafayer</em> (ضفاير) and <em>5osal</em> (خصل) — for adults and kids,
          in the studio or with home service across Cairo. Our philosophy is
          <strong> healthy braids</strong>: gentle, no-tension braiding that protects
          your hair and your edges. Clients rate us on{" "}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">Google reviews</a>,
          and you can book your appointment online in minutes.
        </p>
        <p lang="ar" dir="rtl">
          <strong>سلاي ستوديو</strong> — ستوديو ضفاير في التجمع الخامس، القاهرة
          الجديدة. متخصصين في الضفاير الافريقية: نوتلس، بوكس برايدز، بوهو، كورن
          رو، وخصل ملونة — للكبار والأطفال، في الاستوديو أو بخدمة منزلية في
          القاهرة. فلسفتنا «ضفاير صحية»: ضفر لطيف من غير شد بيحافظ على شعرك
          وحوافه. عملاؤنا بيقيّمونا على جوجل، وتقدري تحجزي معادك أونلاين في دقايق.
        </p>
      </div>
      <img
        className="seo-img"
        src="/hero-braids.jpg"
        alt="Knotless braids by Slay Studio — hair braiding salon in Fifth Settlement, New Cairo · ضفاير نوتلس في التجمع الخامس"
        width="1200"
        height="800"
        loading="lazy"
      />
      <p className="seo-note">
        Read more: <a href="/braids-cairo">Braids in Cairo — the 2026 guide</a>
        {" · "}
        <a href="/dafayer-cairo" lang="ar" dir="rtl">دليل الضفاير في القاهرة</a>
        {" · "}
        <a href="/prices">Prices · الأسعار</a>
      </p>
    </PageShell>
  );
}
