const fs   = require('fs');
const path = require('path');

const apps = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps.json'), 'utf8'));

function buildPage(app) {
  const { name, packageId, playUrl, email, services = {}, updated } = app;
  const { admob, onesignal, premium, firebase } = services;

  const cards = [
    admob && `      <div class="third-party-card">
        <strong>Google AdMob</strong>
        <span>Reklam gösterimi için cihaz ve davranış verisi toplar.</span><br/>
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Gizlilik Politikası →</a>
      </div>`,
    onesignal && `      <div class="third-party-card">
        <strong>OneSignal</strong>
        <span>Push bildirim gönderimi için cihaz token'ı toplar.</span><br/>
        <a href="https://onesignal.com/privacy_policy" target="_blank" rel="noopener">Gizlilik Politikası →</a>
      </div>`,
    premium && `      <div class="third-party-card">
        <strong>Google Play Faturalandırma</strong>
        <span>Premium satın alma işlemleri Google Play üzerinden gerçekleştirilir.</span><br/>
        <a href="https://payments.google.com/payments/apis-secure/get_legal_document?ldo=0&ldt=privacynotice&ldl=tr" target="_blank" rel="noopener">Gizlilik Bildirimi →</a>
      </div>`,
    firebase && `      <div class="third-party-card">
        <strong>Firebase / Google Analytics</strong>
        <span>Kullanım istatistikleri ve çökme raporları için anonim analitik verisi toplar.</span><br/>
        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">Gizlilik Politikası →</a>
      </div>`,
  ].filter(Boolean).join('\n');

  const admobSection = admob ? `
  <section>
    <h2><span class="icon">📢</span> Reklamlar (AdMob)</h2>
    <p>Uygulamamızda Google AdMob aracılığıyla reklamlar gösterilmektedir.</p>
    <p>Kişiselleştirilmiş reklamları devre dışı bırakmak için Android cihazınızda
    <strong>Ayarlar → Google → Reklamlar → Reklam kişiselleştirmeyi devre dışı bırak</strong> seçeneğini kullanabilirsiniz.</p>
  </section>` : '';

  const onesignalSection = onesignal ? `
  <section>
    <h2><span class="icon">🔔</span> Push Bildirimler (OneSignal)</h2>
    <p>Güncellemeler ve duyurular için OneSignal aracılığıyla bildirim gönderebiliriz.</p>
    <p>Bildirim izni isteğe bağlıdır; <strong>Ayarlar → Uygulamalar → ${name} → Bildirimler</strong> bölümünden kapatabilirsiniz.</p>
  </section>` : '';

  const premiumSection = premium ? `
  <section>
    <h2><span class="icon">💎</span> Premium Satın Alma</h2>
    <p>Tüm ödeme işlemleri <strong>yalnızca Google Play Faturalandırma</strong> altyapısı aracılığıyla gerçekleştirilmekte olup ödeme detayları tarafımızca görülmemekte ya da depolanmamaktadır.</p>
    <ul>
      <li>Satın alma Google hesabınız üzerinden yönetilir.</li>
      <li>İptal ve iade için Google Play politikaları geçerlidir.</li>
    </ul>
    <p>İade talebi: <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener">Google Play Aboneliklerim</a></p>
  </section>` : '';

  const packageBlock = packageId
    ? `    <div class="highlight-box">Uygulama Kimliği: <strong>${packageId}</strong></div>` : '';

  const playBlock = playUrl
    ? `      <strong>Uygulama:</strong> <a href="${playUrl}" target="_blank" rel="noopener">Google Play Store'da Görüntüle</a><br/>` : '';

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gizlilik Politikası – ${name}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f7fa; color: #1a1a2e; line-height: 1.75; }
    .topbar { background: #1a1a2e; padding: 12px 24px; font-size: 0.83rem; }
    .topbar a { color: #a0b4d6; text-decoration: none; }
    .topbar a:hover { color: #fff; }
    header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); color: #fff; padding: 60px 24px 48px; text-align: center; }
    header h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700; }
    header p { margin-top: 10px; font-size: 0.95rem; opacity: 0.75; }
    .badge { display: inline-block; margin-top: 20px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 6px 18px; font-size: 0.82rem; }
    main { max-width: 820px; margin: 0 auto; padding: 48px 24px 80px; }
    section { background: #fff; border-radius: 14px; padding: 32px 36px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    section h2 { font-size: 1.15rem; font-weight: 700; color: #0f3460; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
    section h2 .icon { width: 32px; height: 32px; border-radius: 8px; background: #e8f0fe; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
    p { margin-bottom: 12px; font-size: 0.95rem; }
    p:last-child { margin-bottom: 0; }
    ul { margin: 10px 0 12px 20px; font-size: 0.95rem; }
    ul li { margin-bottom: 6px; }
    a { color: #0f3460; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .highlight-box { background: #f0f4ff; border-left: 4px solid #0f3460; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 14px 0; font-size: 0.93rem; }
    .third-party-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 16px; }
    .third-party-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px; }
    .third-party-card strong { display: block; margin-bottom: 6px; color: #0f3460; }
    .third-party-card span { font-size: 0.84rem; color: #555; }
    footer { text-align: center; padding: 32px 24px; font-size: 0.83rem; color: #888; }
    footer a { color: #0f3460; }
    @media (max-width: 500px) { section { padding: 24px 20px; } }
  </style>
</head>
<body>

<div class="topbar"><a href="/">← Tüm Uygulamalar</a></div>

<header>
  <h1>Gizlilik Politikası</h1>
  <p>${name}</p>
  <span class="badge">Son güncelleme: ${updated}</span>
</header>

<main>

  <section>
    <h2><span class="icon">📋</span> Genel Bakış</h2>
    <p><strong>${name}</strong> uygulaması bu gizlilik politikası kapsamında hizmet vermektedir. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.</p>
${packageBlock}
  </section>

  <section>
    <h2><span class="icon">📊</span> Toplanan Veriler</h2>
    <ul>
      <li><strong>Cihaz bilgileri:</strong> Model, işletim sistemi sürümü, benzersiz cihaz tanımlayıcıları</li>
      <li><strong>Kullanım verileri:</strong> Açılan ekranlar, oturum süresi, uygulama içi etkileşimler</li>${admob ? '\n      <li><strong>Reklam tanımlayıcıları:</strong> Google Reklam Kimliği (GAID)</li>' : ''}${onesignal ? "\n      <li><strong>Bildirim token'ı:</strong> Push bildirim gönderimi için</li>" : ''}${premium ? '\n      <li><strong>Satın alma durumu:</strong> Google Play üzerinden premium bilgisi</li>' : ''}
      <li><strong>IP adresi ve yaklaşık konum:</strong> Analitik ve reklam hedeflemesi için</li>
    </ul>
    <p>Uygulama; ad, soyad, e-posta veya telefon gibi kişisel kimlik bilgilerini <strong>doğrudan toplamamaktadır</strong>.</p>
  </section>

  <section>
    <h2><span class="icon">🔗</span> Üçüncü Taraf Hizmetler</h2>
    <div class="third-party-grid">
${cards}
    </div>
  </section>
${admobSection}${onesignalSection}${premiumSection}

  <section>
    <h2><span class="icon">🔒</span> Veri Güvenliği</h2>
    <ul>
      <li>Veriler şifreli kanallar üzerinden iletilmektedir.</li>
      <li>Verileriniz üçüncü taraflara <strong>satılmamaktadır</strong>.</li>
    </ul>
  </section>

  <section>
    <h2><span class="icon">👶</span> Çocukların Gizliliği</h2>
    <p>Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir.</p>
  </section>

  <section>
    <h2><span class="icon">🔄</span> Politika Değişiklikleri</h2>
    <p>Bu politikayı zaman zaman güncelleyebiliriz. Değişikliklerde "Son güncelleme" tarihi revize edilecektir.</p>
  </section>

  <section>
    <h2><span class="icon">✉️</span> İletişim</h2>
    <div class="highlight-box">
      <strong>E-posta:</strong> <a href="mailto:${email}">${email}</a><br/>
${playBlock}
    </div>
  </section>

</main>

<footer>
  <p>© ${year} ${name}. Tüm hakları saklıdır.</p>
</footer>

</body>
</html>`;
}

for (const app of apps) {
  const dir = path.join(__dirname, '..', app.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, 'index.html');
  fs.writeFileSync(dest, buildPage(app), 'utf8');
  console.log(`✅ ${app.slug}/index.html`);
}

console.log(`\nToplam ${apps.length} sayfa oluşturuldu.`);
