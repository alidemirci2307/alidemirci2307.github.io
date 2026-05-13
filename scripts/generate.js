const fs   = require('fs');
const path = require('path');

// ── Service database (TR + EN) ─────────────────────────────────────────────
const SERVICES = {
  admob:              { cat:'ads',       icon:'📢', plats:['android','ios'],  privacyUrl:'https://policies.google.com/privacy',
    tr:{ name:'Google AdMob',               desc:'Kişiselleştirilmiş reklam gösterimi için cihaz tanımlayıcıları, konum ve kullanım verisi toplar.', data:['Reklam Kimliği (GAID/IDFA)','Cihaz model ve OS','Yaklaşık konum','Uygulama kullanım süresi'] },
    en:{ name:'Google AdMob',               desc:'Collects device identifiers, location, and usage data for personalized ad delivery.',             data:['Advertising ID (GAID/IDFA)','Device model & OS','Approximate location','App usage time'] } },
  facebook_audience:  { cat:'ads',       icon:'📢', plats:['android','ios'],  privacyUrl:'https://www.facebook.com/about/privacy',
    tr:{ name:'Facebook Audience Network',  desc:'Mobil reklam gösterimi için cihaz tanımlayıcıları ve ilgi alanı verisi toplar.',                  data:['Reklam Kimliği','Cihaz bilgileri','İlgi alanları'] },
    en:{ name:'Facebook Audience Network',  desc:'Collects device identifiers and interest data for mobile ad delivery.',                            data:['Advertising ID','Device information','Interests'] } },
  unity_ads:          { cat:'ads',       icon:'📢', plats:['android','ios'],  privacyUrl:'https://unity.com/legal/game-player-and-app-user-privacy-policy',
    tr:{ name:'Unity Ads',                  desc:'Oyun içi reklam gösterimi için etkileşim ve cihaz verisi toplar.',                                data:['Cihaz tanımlayıcıları','Reklam etkileşimleri','Oyun içi davranış'] },
    en:{ name:'Unity Ads',                  desc:'Collects interaction and device data for in-game ad display.',                                     data:['Device identifiers','Ad interactions','In-game behaviour'] } },
  applovin:           { cat:'ads',       icon:'📢', plats:['android','ios'],  privacyUrl:'https://www.applovin.com/privacy/',
    tr:{ name:'AppLovin MAX',               desc:'En yüksek gelirli reklamı sunmak için reklam mediation verisi toplar.',                           data:['Reklam Kimliği','Cihaz bilgileri','Coğrafi bölge'] },
    en:{ name:'AppLovin MAX',               desc:'Collects ad mediation data to serve the highest-yielding ad.',                                     data:['Advertising ID','Device information','Geographic region'] } },
  ironsource:         { cat:'ads',       icon:'📢', plats:['android','ios'],  privacyUrl:'https://www.is.com/privacy-policy/',
    tr:{ name:'ironSource (LevelPlay)',      desc:'Oyun monetizasyonu için reklam mediation hizmeti sağlar.',                                        data:['Cihaz tanımlayıcıları','Reklam etkileşimleri','Coğrafi veriler'] },
    en:{ name:'ironSource (LevelPlay)',      desc:'Provides ad mediation service for game monetization.',                                            data:['Device identifiers','Ad interactions','Geographic data'] } },
  firebase_analytics: { cat:'analytics', icon:'📊', plats:['android','ios'],  privacyUrl:'https://firebase.google.com/support/privacy',
    tr:{ name:'Firebase Analytics',         desc:'Uygulama kullanım istatistikleri ve davranış analizi için anonim veri toplar.',                   data:['Ekran görüntülemeleri','Oturum süresi','Kullanıcı eventleri','Cihaz bilgileri'] },
    en:{ name:'Firebase Analytics',         desc:'Collects anonymous data for app usage statistics and behaviour analysis.',                          data:['Screen views','Session duration','User events','Device information'] } },
  firebase_crashlytics:{ cat:'analytics',icon:'🐛', plats:['android','ios'],  privacyUrl:'https://firebase.google.com/terms/crashlytics',
    tr:{ name:'Firebase Crashlytics',       desc:'Uygulama kararlılığını artırmak için çökme raporları toplar.',                                    data:['Çökme raporları','Stack trace','Cihaz durumu','Uygulama sürümü'] },
    en:{ name:'Firebase Crashlytics',       desc:'Collects crash reports to improve app stability.',                                                 data:['Crash reports','Stack trace','Device state','App version'] } },
  amplitude:          { cat:'analytics', icon:'📈', plats:['android','ios'],  privacyUrl:'https://amplitude.com/privacy',
    tr:{ name:'Amplitude',                  desc:'Ürün analitiği ve kullanıcı davranış takibi için event tabanlı veri toplar.',                     data:['Kullanıcı eventleri','Funnel verisi','Retention metrikleri'] },
    en:{ name:'Amplitude',                  desc:'Collects event-based data for product analytics and user behaviour tracking.',                       data:['User events','Funnel data','Retention metrics'] } },
  mixpanel:           { cat:'analytics', icon:'📉', plats:['android','ios'],  privacyUrl:'https://mixpanel.com/legal/privacy-policy/',
    tr:{ name:'Mixpanel',                   desc:'Ürün analitiği ve dönüşüm takibi için event verisi toplar.',                                      data:['Kullanıcı eventleri','Segmentasyon verisi','A/B test sonuçları'] },
    en:{ name:'Mixpanel',                   desc:'Collects event data for product analytics and conversion tracking.',                                data:['User events','Segmentation data','A/B test results'] } },
  sentry:             { cat:'analytics', icon:'🔍', plats:['android','ios'],  privacyUrl:'https://sentry.io/privacy/',
    tr:{ name:'Sentry',                     desc:'Gerçek zamanlı hata izleme ve performans takibi için veri toplar.',                               data:['Hata raporları','Stack trace','Kullanıcı bağlamı (isteğe bağlı)'] },
    en:{ name:'Sentry',                     desc:'Collects data for real-time error monitoring and performance tracking.',                            data:['Error reports','Stack trace','User context (optional)'] } },
  adjust:             { cat:'marketing', icon:'🎯', plats:['android','ios'],  privacyUrl:'https://www.adjust.com/privacy/',
    tr:{ name:'Adjust',                     desc:'Uygulama yükleme atıflandırması ve kampanya performansı için veri toplar.',                       data:['Yükleme atıflandırması','Cihaz tanımlayıcıları','IP adresi'] },
    en:{ name:'Adjust',                     desc:'Collects data for app install attribution and campaign performance.',                               data:['Install attribution','Device identifiers','IP address'] } },
  appsflyer:          { cat:'marketing', icon:'🎯', plats:['android','ios'],  privacyUrl:'https://www.appsflyer.com/trust/privacy/',
    tr:{ name:'AppsFlyer',                  desc:'Mobil atıflandırma ve pazarlama analitiği için veri toplar.',                                     data:['Yükleme atıflandırması','Cihaz tanımlayıcıları','In-app eventler'] },
    en:{ name:'AppsFlyer',                  desc:'Collects data for mobile attribution and marketing analytics.',                                     data:['Install attribution','Device identifiers','In-app events'] } },
  onesignal:          { cat:'push',      icon:'🔔', plats:['android','ios'],  privacyUrl:'https://onesignal.com/privacy_policy',
    tr:{ name:'OneSignal',                  desc:"Push bildirim gönderimi için cihaz push token'ı ve etkileşim verisi toplar.",                     data:["Cihaz push token'ı",'Bildirim etkileşim verisi','Cihaz dili ve bölgesi'] },
    en:{ name:'OneSignal',                  desc:'Collects device push token and interaction data for push notification delivery.',                   data:['Device push token','Notification interaction data','Device language and region'] } },
  fcm:                { cat:'push',      icon:'🔔', plats:['android','ios'],  privacyUrl:'https://firebase.google.com/support/privacy',
    tr:{ name:'Firebase Cloud Messaging',   desc:"Push bildirim iletimi için FCM token'larını kullanır.",                                           data:["FCM registration token'ı",'Mesaj iletim verisi'] },
    en:{ name:'Firebase Cloud Messaging',   desc:'Uses FCM tokens for push notification delivery.',                                                  data:['FCM registration token','Message delivery data'] } },
  firebase_auth:      { cat:'auth',      icon:'🔑', plats:['android','ios'],  privacyUrl:'https://firebase.google.com/support/privacy',
    tr:{ name:'Firebase Authentication',    desc:"Kullanıcı hesabı ve oturum yönetimi için kimlik bilgilerini güvenli şekilde işler.",              data:['E-posta adresi',"Kimlik doğrulama token'ları",'Hesap oluşturma tarihi'] },
    en:{ name:'Firebase Authentication',    desc:'Securely processes credentials for user account and session management.',                           data:['Email address','Auth tokens','Account creation date'] } },
  google_signin:      { cat:'auth',      icon:'🔑', plats:['android','ios'],  privacyUrl:'https://policies.google.com/privacy',
    tr:{ name:'Google ile Giriş Yap',       desc:'Google hesabıyla hızlı giriş yapmanızı sağlar.',                                                  data:['Google profil bilgileri','E-posta adresi','Profil fotoğrafı'] },
    en:{ name:'Sign in with Google',        desc:'Allows quick sign-in with your Google account.',                                                   data:['Google profile info','Email address','Profile photo'] } },
  apple_signin:       { cat:'auth',      icon:'🍎', plats:['ios'],            privacyUrl:'https://www.apple.com/privacy/',
    tr:{ name:'Apple ile Giriş Yap',        desc:'Apple kimliğiyle güvenli ve gizli giriş yapmanızı sağlar.',                                       data:['Apple ID (gizlenmiş e-posta opsiyonu)','Ad soyad (isteğe bağlı)'] },
    en:{ name:'Sign in with Apple',         desc:'Allows secure and private sign-in with your Apple identity.',                                      data:['Apple ID (hide-my-email option)','Name (optional)'] } },
  facebook_login:     { cat:'auth',      icon:'👤', plats:['android','ios'],  privacyUrl:'https://www.facebook.com/about/privacy',
    tr:{ name:'Facebook Login',             desc:'Facebook hesabıyla giriş yapmanızı sağlar.',                                                       data:['Facebook profil bilgileri','E-posta adresi'] },
    en:{ name:'Facebook Login',             desc:'Allows sign-in with your Facebook account.',                                                       data:['Facebook profile info','Email address'] } },
  play_billing:       { cat:'payment',   icon:'💳', plats:['android'],        privacyUrl:'https://policies.google.com/privacy',
    tr:{ name:'Google Play Faturalandırma', desc:'Premium içerik satın alma işlemleri Google Play altyapısı üzerinden gerçekleştirilir.',            data:['Satın alma geçmişi','Google Hesap bilgisi (Google işler)'] },
    en:{ name:'Google Play Billing',        desc:'Premium content purchases are processed through Google Play infrastructure.',                       data:['Purchase history','Google Account info (processed by Google)'] } },
  apple_iap:          { cat:'payment',   icon:'💳', plats:['ios'],            privacyUrl:'https://www.apple.com/privacy/',
    tr:{ name:'Apple In-App Purchase',      desc:'Premium içerik satın alma işlemleri Apple StoreKit üzerinden gerçekleştirilir.',                  data:['Satın alma geçmişi','Apple ID (Apple işler)'] },
    en:{ name:'Apple In-App Purchase',      desc:'Premium content purchases are processed through Apple StoreKit.',                                  data:['Purchase history','Apple ID (processed by Apple)'] } },
  revenuecat:         { cat:'payment',   icon:'💰', plats:['android','ios'],  privacyUrl:'https://www.revenuecat.com/privacy',
    tr:{ name:'RevenueCat',                 desc:"Abonelik ve satın alma yönetimi; anonim kullanıcı ID'leri kullanır.",                              data:['Satın alma geçmişi','Abonelik durumu',"Anonim kullanıcı ID'si"] },
    en:{ name:'RevenueCat',                 desc:'Manages subscriptions and purchases using anonymous user IDs.',                                     data:['Purchase history','Subscription status','Anonymous user ID'] } },
  google_maps:        { cat:'maps',      icon:'📍', plats:['android','ios'],  privacyUrl:'https://policies.google.com/privacy',
    tr:{ name:'Google Maps SDK',            desc:'Harita ve konum hizmetleri için GPS ve ağ konum verisi kullanır.',                                 data:['Hassas/Yaklaşık konum','Harita etkileşimleri','Arama geçmişi'] },
    en:{ name:'Google Maps SDK',            desc:'Uses GPS and network location data for map and location services.',                                 data:['Precise/Approximate location','Map interactions','Search history'] } },
  supabase:           { cat:'backend',   icon:'☁️', plats:['android','ios'],  privacyUrl:'https://supabase.com/privacy',
    tr:{ name:'Supabase',                   desc:'Veritabanı, kimlik doğrulama ve gerçek zamanlı veri senkronizasyonu sağlar.',                      data:['Uygulama verisi','Kimlik doğrulama bilgileri','Gerçek zamanlı senkronizasyon verisi'] },
    en:{ name:'Supabase',                   desc:'Provides database, authentication, and real-time data synchronisation.',                           data:['App data','Auth credentials','Real-time sync data'] } },
};

const CAT_META = {
  ads:       { tr:'Reklamcılık',          en:'Advertising',           color:'#f59e0b', bg:'#fffbeb' },
  analytics: { tr:'Analitik',             en:'Analytics',             color:'#3b82f6', bg:'#eff6ff' },
  marketing: { tr:'Pazarlama Analitiği',  en:'Marketing Analytics',   color:'#f97316', bg:'#fff7ed' },
  push:      { tr:'Bildirimler',          en:'Notifications',         color:'#8b5cf6', bg:'#f5f3ff' },
  auth:      { tr:'Kimlik Doğrulama',     en:'Authentication',        color:'#10b981', bg:'#ecfdf5' },
  payment:   { tr:'Satın Alma',           en:'Purchases',             color:'#ef4444', bg:'#fef2f2' },
  maps:      { tr:'Konum & Harita',       en:'Location & Maps',       color:'#06b6d4', bg:'#ecfeff' },
  backend:   { tr:'Backend',             en:'Backend',               color:'#6366f1', bg:'#eef2ff' },
};

// ── i18n strings ──────────────────────────────────────────────────────────────
const I18N = {
  tr: {
    back:'← Tüm Uygulamalar', lang_toggle:'EN', privacy_title:'Gizlilik Politikası',
    updated_prefix:'Son güncelleme: ',
    plat_android:'Android / Google Play', plat_ios:'iOS / App Store', plat_both_a:'Android', plat_both_i:'iOS',
    s_overview:'Genel Bakış', s_data:'Toplanan Veriler', s_third:'Üçüncü Taraf Hizmetler',
    s_ads:'Reklam Kişiselleştirme', s_att:'App Tracking Transparency (iOS)',
    s_push:'Push Bildirimler', s_payment:'Satın Alma ve Abonelikler',
    s_location:'Konum Verisi', s_security:'Veri Güvenliği',
    s_children:"Çocukların Gizliliği", s_rights:'Haklarınız (KVKK / GDPR)',
    s_changes:'Politika Değişiklikleri', s_contact:'İletişim',
    overview_p:'uygulaması bu gizlilik politikası kapsamında hizmet vermektedir. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.',
    overview_p2:'Politikamızı kabul etmiyorsanız lütfen uygulamayı kullanmayınız.',
    pkg_label:'Package:',
    data_intro:'Uygulamamız aşağıdaki verileri toplayabilir:',
    data_no_pii:'Uygulama; ad, soyad, T.C. kimlik numarası, kredi kartı gibi hassas kişisel bilgileri doğrudan toplamamaktadır.',
    data_device:'Cihaz bilgileri: Model, işletim sistemi sürümü, benzersiz tanımlayıcılar',
    data_usage:'Kullanım verileri: Açılan ekranlar, oturum süresi, uygulama içi etkileşimler',
    data_adid:'Reklam tanımlayıcıları:',
    data_push:"Bildirim token'ı: Push bildirim iletimi için cihaz token'ı",
    data_purchase:'Satın alma durumu: Premium abonelik/satın alma durumu',
    data_auth:'Kimlik bilgileri: Giriş yönteminize göre e-posta veya üçüncü taraf kimliği',
    data_location:'Konum verisi: Harita hizmetleri için GPS veya ağ konumu',
    data_analytics:'Analitik veriler: Event verileri, funnel metrikleri, performans ölçümleri',
    data_ip:'IP adresi ve yaklaşık konum: Analitik ve reklam hedeflemesi için',
    third_intro:'Uygulamamız aşağıdaki üçüncü taraf SDK\'larını kullanmaktadır. Her biri kendi gizlilik politikası kapsamında veri işleyebilir:',
    svc_link:'Gizlilik Politikası',
    ads_p1:'Uygulamamızda reklam ağları aracılığıyla reklamlar gösterilmektedir. Bu ağlar ilgi alanlarınıza uygun reklamlar sunmak için tanımlayıcıları kullanabilir.',
    ads_android:'Android: Kişiselleştirilmiş reklamları devre dışı bırakmak için Ayarlar → Google → Reklamlar → Reklam kişiselleştirmeyi kapat seçeneğini kullanabilirsiniz.',
    ads_ios:'iOS: Ayarlar → Gizlilik ve Güvenlik → Apple Reklamları bölümünden kişiselleştirilmiş reklamları kapatabilirsiniz.',
    ads_gdpr:'Ayrıca GDPR/KVKK kapsamında Avrupa Ekonomik Alanı kullanıcıları için uygulama içi rıza mekanizması sunulmaktadır.',
    att_p1:"iOS 14.5 ve üzeri sürümlerde Apple'ın App Tracking Transparency (ATT) çerçevesi gereğince izin alınmaktadır.",
    att_p2:'İzni reddederseniz yalnızca kişiselleştirilmemiş reklamlar gösterilir. İzni Ayarlar → Gizlilik ve Güvenlik → İzleme bölümünden değiştirebilirsiniz.',
    push_p1:'Uygulamamız güncellemeler, yeni içerikler ve önemli duyurular için push bildirimler gönderebilir.',
    push_p2:'Bildirim izni isteğe bağlıdır. Bildirimleri yönetmek için:',
    push_android:'Android: Ayarlar → Uygulamalar →',
    push_android2:'→ Bildirimler',
    push_ios:'iOS: Ayarlar → Bildirimler →',
    payment_p1:'Tüm ödeme işlemleri ilgili platform altyapısı üzerinden güvenli biçimde gerçekleştirilmektedir. Ödeme bilgileri tarafımızca görülmez ya da depolanmaz.',
    payment_play_refund:'Google Play Aboneliklerim',
    payment_apple_refund:'reportaproblem.apple.com',
    location_p1:'Uygulamamız harita ve navigasyon hizmetleri için konumunuza erişim talep edebilir. Bu izin isteğe bağlıdır.',
    location_android:'Android: Ayarlar → Uygulamalar → → İzinler → Konum',
    location_ios:'iOS: Ayarlar → Gizlilik → Konum Servisleri →',
    security_items:['Üçüncü taraflarla paylaşılan veriler şifreli (TLS/HTTPS) kanallar üzerinden iletilmektedir.','Verileriniz satış veya ticari amaçla üçüncü taraflara satılmamaktadır.','Yetkisiz erişim, değiştirme veya ifşaya karşı teknik ve idari önlemler alınmaktadır.','Kullanıcı verileri yalnızca hizmetin gerektirdiği süre kadar saklanmaktadır.'],
    children_p:'Uygulamamız 13 yaşın altındaki çocuklara yönelik değildir. Bu yaş grubundan bilerek kişisel veri toplamıyoruz. Ebeveyn veya velinin bilgimize alması durumunda ilgili veriler derhal silinecektir.',
    rights:[{t:'Erişim',d:'Hakkınızda tutulan verilere erişim talep edebilirsiniz.'},{t:'Düzeltme',d:'Hatalı veya eksik verilerin düzeltilmesini isteyebilirsiniz.'},{t:'Silme',d:'Belirli koşullarda verilerinizin silinmesini talep edebilirsiniz.'},{t:'İtiraz',d:'Meşru menfaate dayalı işlemlere itiraz edebilirsiniz.'},{t:'Kısıtlama',d:'Belirli durumlarda veri işlemenin kısıtlanmasını isteyebilirsiniz.'},{t:'Taşınabilirlik',d:'Verilerinizi yapılandırılmış formatta talep edebilirsiniz.'}],
    changes_p:'Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişikliklerde "Son güncelleme" tarihi revize edilir. Uygulamayı kullanmaya devam etmeniz güncellenmiş politikayı kabul ettiğiniz anlamına gelir.',
    contact_p:'Bu gizlilik politikasına ilişkin soru, şikayet veya talepleriniz için:',
    contact_email:'E-posta:', contact_dev:'Geliştirici:', contact_play:'Google Play:', contact_store:'App Store:',
    store_play:'▶ Google Play', store_apple:' App Store',
    footer_rights:'Tüm hakları saklıdır.',
    s_changelog:'Değişiklik Geçmişi', changelog_empty:'Henüz kayıt yok.',
    toc_title:'İçindekiler', print_btn:'Yazdır / PDF',
  },
  en: {
    back:'← All Apps', lang_toggle:'TR', privacy_title:'Privacy Policy',
    updated_prefix:'Last updated: ',
    plat_android:'Android / Google Play', plat_ios:'iOS / App Store', plat_both_a:'Android', plat_both_i:'iOS',
    s_overview:'Overview', s_data:'Data We Collect', s_third:'Third-Party Services',
    s_ads:'Ad Personalisation', s_att:'App Tracking Transparency (iOS)',
    s_push:'Push Notifications', s_payment:'Purchases & Subscriptions',
    s_location:'Location Data', s_security:'Data Security',
    s_children:"Children's Privacy", s_rights:'Your Rights (GDPR / CCPA)',
    s_changes:'Policy Changes', s_contact:'Contact Us',
    overview_p:'app operates under this privacy policy. By using the app, you agree to this policy.',
    overview_p2:'If you do not agree, please discontinue use of the app.',
    pkg_label:'Package:',
    data_intro:'Our app may collect the following data:',
    data_no_pii:'The app does not directly collect sensitive personal data such as full name, national ID, or credit card numbers.',
    data_device:'Device information: Model, OS version, unique identifiers',
    data_usage:'Usage data: Screens opened, session duration, in-app interactions',
    data_adid:'Advertising identifiers:',
    data_push:'Notification token: Device token for push notification delivery',
    data_purchase:'Purchase status: Premium subscription/purchase state',
    data_auth:'Identity data: Email or third-party ID depending on sign-in method',
    data_location:'Location data: GPS or network location for map services',
    data_analytics:'Analytics data: Event data, funnel metrics, performance measurements',
    data_ip:'IP address and approximate location: For analytics and ad targeting',
    third_intro:"Our app uses the following third-party SDKs. Each may process data under its own privacy policy:",
    svc_link:'Privacy Policy',
    ads_p1:'Our app displays ads through advertising networks. These networks may use identifiers to deliver interest-based ads.',
    ads_android:'Android: To disable personalised ads, go to Settings → Google → Ads → Opt out of Ads Personalisation.',
    ads_ios:'iOS: Go to Settings → Privacy & Security → Apple Advertising to turn off personalised ads.',
    ads_gdpr:'A consent mechanism is provided for EEA users in accordance with GDPR requirements.',
    att_p1:"On iOS 14.5+, we request permission under Apple's App Tracking Transparency (ATT) framework.",
    att_p2:'If you decline, only non-personalised ads are shown. You can change this in Settings → Privacy & Security → Tracking.',
    push_p1:'Our app may send push notifications about updates, new content, and important announcements.',
    push_p2:'Notification permission is optional. To manage notifications:',
    push_android:'Android: Settings → Apps →',
    push_android2:'→ Notifications',
    push_ios:'iOS: Settings → Notifications →',
    payment_p1:'All payments are processed securely through the respective platform. We never see or store your payment details.',
    payment_play_refund:'Google Play Subscriptions',
    payment_apple_refund:'reportaproblem.apple.com',
    location_p1:'Our app may request access to your location for map and navigation services. This permission is optional.',
    location_android:'Android: Settings → Apps → → Permissions → Location',
    location_ios:'iOS: Settings → Privacy → Location Services →',
    security_items:['Data shared with third parties is transmitted over encrypted (TLS/HTTPS) channels.','Your data is not sold to third parties for commercial purposes.','Technical and administrative safeguards are in place against unauthorised access, modification, or disclosure.','User data is retained only as long as the service requires.'],
    children_p:"Our app is not directed to children under 13. We do not knowingly collect personal data from this age group. If a parent or guardian becomes aware of such collection, please contact us for immediate deletion.",
    rights:[{t:'Access',d:'You can request access to the data held about you.'},{t:'Rectification',d:'You can request correction of inaccurate or incomplete data.'},{t:'Erasure',d:'You can request deletion of your data under certain conditions.'},{t:'Objection',d:'You can object to processing based on legitimate interest.'},{t:'Restriction',d:'You can request restriction of processing in certain circumstances.'},{t:'Portability',d:'You can request your data in a structured, machine-readable format.'}],
    changes_p:'We may update this privacy policy from time to time. The "Last updated" date on this page will be revised for significant changes. Continued use of the app constitutes acceptance of the updated policy.',
    contact_p:'For questions, complaints, or requests regarding this privacy policy:',
    contact_email:'Email:', contact_dev:'Developer:', contact_play:'Google Play:', contact_store:'App Store:',
    store_play:'▶ Google Play', store_apple:' App Store',
    footer_rights:'All rights reserved.',
    s_changelog:'Changelog', changelog_empty:'No entries yet.',
    toc_title:'Contents', print_btn:'Print / PDF',
  }
};

// ── Build HTML page ───────────────────────────────────────────────────────────
function buildPage(app) {
  const {
    name, packageId, platform = 'android',
    developerName = '', developerEmail = '',
    playUrl: _playUrl = '', appStoreId = '', appStoreUrl: _appStoreUrl = '',
    icon = '📱', services = {}, updated = '', changelog = []
  } = app;

  // Auto-generate App Store URL from ID
  const appStoreUrl = _appStoreUrl || (appStoreId ? 'https://apps.apple.com/app/id' + appStoreId : '');

  const isAndroid = platform === 'android' || platform === 'both';
  const isIOS     = platform === 'ios'     || platform === 'both';

  const playUrl = _playUrl || (packageId && isAndroid ? 'https://play.google.com/store/apps/details?id=' + packageId + '&hl=tr' : '');

  // Active services filtered by platform
  const activeServices = Object.entries(services)
    .filter(([k, v]) => v && SERVICES[k])
    .filter(([k]) => {
      const p = SERVICES[k].plats;
      return (isAndroid && p.includes('android')) || (isIOS && p.includes('ios'));
    })
    .map(([k]) => ({ key: k, ...SERVICES[k] }));

  const hasAds      = activeServices.some(s => s.cat === 'ads');
  const hasPush     = activeServices.some(s => s.cat === 'push');
  const hasPayment  = activeServices.some(s => s.cat === 'payment');
  const hasAuth     = activeServices.some(s => s.cat === 'auth');
  const hasMaps     = activeServices.some(s => s.cat === 'maps');
  const hasAnalytics  = activeServices.some(s => s.cat === 'analytics');
  const hasChangelog  = Array.isArray(changelog) && changelog.length > 0;

  // Build service cards (both languages)
  function svcCards(lang) {
    return activeServices.map(svc => {
      const cm = CAT_META[svc.cat] || { tr:'Other', en:'Other', color:'#64748b', bg:'#f8fafc' };
      const ldata = svc[lang];
      const dataItems = ldata.data.map(d => '<li>' + d + '</li>').join('');
      const catLabel = cm[lang];
      return '<div class="svc-card">'
        + '<div class="svc-card-top" style="background:' + cm.bg + ';border-color:' + cm.color + '20">'
        + '<span class="svc-icon">' + svc.icon + '</span>'
        + '<div><strong class="svc-name">' + ldata.name + '</strong>'
        + '<span class="svc-badge" style="background:' + cm.color + '20;color:' + cm.color + '">' + catLabel + '</span></div>'
        + '</div>'
        + '<p class="svc-desc">' + ldata.desc + '</p>'
        + '<ul class="svc-data">' + dataItems + '</ul>'
        + '<a href="' + svc.privacyUrl + '" target="_blank" rel="noopener" class="svc-link">'
        + I18N[lang].svc_link + ' <span>→</span></a>'
        + '</div>';
    }).join('\n');
  }

  // Build data items list
  function dataList(lang) {
    const t = I18N[lang];
    const adIdSuffix = isAndroid && isIOS ? 'GAID (Android) / IDFA (iOS)'
                     : isAndroid ? 'Google Reklam Kimliği (GAID)' : 'iOS Reklam Tanımlayıcısı (IDFA)';
    const adIdSuffixEn = isAndroid && isIOS ? 'GAID (Android) / IDFA (iOS)'
                       : isAndroid ? 'Google Advertising ID (GAID)' : 'iOS Advertising Identifier (IDFA)';
    const finalAdId = lang === 'tr' ? adIdSuffix : adIdSuffixEn;

    const playPurchase = lang === 'tr'
      ? ('Google Play' + (isIOS ? '/App Store' : ''))
      : ('Google Play' + (isIOS ? '/App Store' : ''));

    return [
      '<li>' + t.data_device + '</li>',
      '<li>' + t.data_usage + '</li>',
      hasAds   ? '<li><strong>' + t.data_adid + '</strong> ' + finalAdId + '</li>' : '',
      hasPush  ? '<li>' + t.data_push + '</li>' : '',
      hasPayment ? '<li>' + t.data_purchase + ' (' + playPurchase + ')</li>' : '',
      hasAuth  ? '<li>' + t.data_auth + '</li>' : '',
      hasMaps  ? '<li>' + t.data_location + '</li>' : '',
      hasAnalytics ? '<li>' + t.data_analytics + '</li>' : '',
      '<li>' + t.data_ip + '</li>',
    ].filter(Boolean).join('\n      ');
  }

  // Build rights grid
  function rightsGrid(lang) {
    return I18N[lang].rights.map(r =>
      '<div class="right-item"><strong>' + r.t + '</strong><span>' + r.d + '</span></div>'
    ).join('\n');
  }

  // Conditional sections
  function adsSection(lang) {
    if (!hasAds) return '';
    const t = I18N[lang];
    return '<section data-aos="fade-up"><div class="section-icon" style="background:#fffbeb;color:#f59e0b">📢</div>'
      + '<h2>' + t.s_ads + '</h2>'
      + '<p>' + t.ads_p1 + '</p>'
      + (isAndroid ? '<p><strong>Android:</strong> ' + t.ads_android + '</p>' : '')
      + (isIOS     ? '<p><strong>iOS:</strong> ' + t.ads_ios + '</p>' : '')
      + '<p>' + t.ads_gdpr + '</p>'
      + '</section>';
  }

  function attSection(lang) {
    if (!isIOS) return '';
    const t = I18N[lang];
    return '<section data-aos="fade-up"><div class="section-icon" style="background:#f5f3ff;color:#8b5cf6">🍎</div>'
      + '<h2>' + t.s_att + '</h2>'
      + '<p>' + t.att_p1 + '</p>'
      + '<p>' + t.att_p2 + '</p>'
      + '</section>';
  }

  function pushSection(lang) {
    if (!hasPush) return '';
    const t = I18N[lang];
    return '<section data-aos="fade-up"><div class="section-icon" style="background:#f5f3ff;color:#8b5cf6">🔔</div>'
      + '<h2>' + t.s_push + '</h2>'
      + '<p>' + t.push_p1 + '</p>'
      + '<p>' + t.push_p2 + '</p>'
      + (isAndroid ? '<p><strong>Android:</strong> ' + t.push_android + ' <em>' + name + '</em> ' + t.push_android2 + '</p>' : '')
      + (isIOS     ? '<p><strong>iOS:</strong> ' + t.push_ios + ' <em>' + name + '</em></p>' : '')
      + '</section>';
  }

  function paymentSection(lang) {
    if (!hasPayment) return '';
    const t = I18N[lang];
    const playLink  = (isAndroid && services.play_billing)
      ? '<p><strong>Google Play:</strong> <a href="https://play.google.com/store/account/subscriptions" target="_blank" rel="noopener">' + t.payment_play_refund + '</a></p>' : '';
    const appleLink = (isIOS && services.apple_iap)
      ? '<p><strong>App Store:</strong> <a href="https://reportaproblem.apple.com" target="_blank" rel="noopener">' + t.payment_apple_refund + '</a></p>' : '';
    return '<section data-aos="fade-up"><div class="section-icon" style="background:#fef2f2;color:#ef4444">💳</div>'
      + '<h2>' + t.s_payment + '</h2>'
      + '<p>' + t.payment_p1 + '</p>'
      + playLink + appleLink
      + '</section>';
  }

  function locationSection(lang) {
    if (!hasMaps) return '';
    const t = I18N[lang];
    const instr = isAndroid
      ? '<p><strong>Android:</strong> ' + t.location_android.replace('→', '→ <em>' + name + '</em> →') + '</p>'
      : '<p><strong>iOS:</strong> ' + t.location_ios + ' <em>' + name + '</em></p>';
    return '<section data-aos="fade-up"><div class="section-icon" style="background:#ecfeff;color:#06b6d4">📍</div>'
      + '<h2>' + t.s_location + '</h2>'
      + '<p>' + t.location_p1 + '</p>'
      + instr
      + '</section>';
  }

  function changelogSection(lang) {
    if (!hasChangelog) return '';
    const t = I18N[lang];
    const entries = changelog.map((entry, i) => {
      const dateStr = entry.date || '';
      const descTr  = entry.tr  || entry.desc || '';
      const descEn  = entry.en  || entry.desc || '';
      const desc    = lang === 'tr' ? descTr : descEn;
      return '<div class="cl-entry">'
        + '<div class="cl-dot"></div>'
        + '<div class="cl-body">'
        + (dateStr ? '<span class="cl-date">' + dateStr + '</span>' : '')
        + '<p class="cl-desc">' + desc + '</p>'
        + '</div>'
        + '</div>';
    }).join('\n');
    return '<section data-aos="fade-up" id="section-changelog">'
      + '<div class="section-icon" style="background:#f0fdf4;color:#16a34a">📋</div>'
      + '<h2 data-i18n="s_changelog">' + t.s_changelog + '</h2>'
      + '<div class="cl-timeline">' + entries + '</div>'
      + '</section>';
  }

  // Platform badges HTML
  const platBadgesHtml = platform === 'both'
    ? '<span class="plat-badge android" data-i18n="plat_both_a"></span><span class="plat-badge ios" data-i18n="plat_both_i"></span>'
    : platform === 'ios'
      ? '<span class="plat-badge ios" data-i18n="plat_ios"></span>'
      : '<span class="plat-badge android" data-i18n="plat_android"></span>';

  // Store links
  const storeLinks = [
    playUrl     ? '<a href="' + playUrl + '" target="_blank" rel="noopener" class="store-btn android"><span>▶</span> Google Play</a>' : '',
    appStoreUrl ? '<a href="' + appStoreUrl + '" target="_blank" rel="noopener" class="store-btn ios"><span></span> App Store</a>' : '',
  ].filter(Boolean).join('\n    ');

  const pkgBlock = packageId
    ? '<div class="pkg-badge"><span data-i18n="pkg_label">Package:</span> <code>' + packageId + '</code></div>' : '';

  const year = new Date().getFullYear();

  // Embed i18n data + both-lang dynamic sections as JSON
  const i18nJson = JSON.stringify(I18N).replace(/<\/script>/g, '<\\/script>');
  const dynamicSections = JSON.stringify({
    svcCards_tr: svcCards('tr'), svcCards_en: svcCards('en'),
    dataList_tr: dataList('tr'), dataList_en: dataList('en'),
    rightsGrid_tr: rightsGrid('tr'), rightsGrid_en: rightsGrid('en'),
    adsSection_tr: adsSection('tr'), adsSection_en: adsSection('en'),
    attSection_tr: attSection('tr'), attSection_en: attSection('en'),
    pushSection_tr: pushSection('tr'), pushSection_en: pushSection('en'),
    paymentSection_tr: paymentSection('tr'), paymentSection_en: paymentSection('en'),
    locationSection_tr: locationSection('tr'), locationSection_en: locationSection('en'),
    changelogSection_tr: changelogSection('tr'), changelogSection_en: changelogSection('en'),
  }).replace(/<\/script>/g, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${name} – <span data-i18n="privacy_title">Gizlilik Politikası</span></title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--primary:#0f3460;--primary-l:#1a6bb5;--bg:#f8fafc;--surface:#fff;--border:#e2e8f0;--text:#1e293b;--muted:#64748b;--radius:16px;--toc-w:220px}
    body.dark{--bg:#0f172a;--surface:#1e293b;--border:#334155;--text:#f1f5f9;--muted:#94a3b8}
    body.dark .topbar{background:#0a1628}
    body.dark .hero{background:linear-gradient(135deg,#0a1628 0%,#0f172a 40%,#1a0a2e 100%)}
    body.dark section{box-shadow:0 2px 16px rgba(0,0,0,.3)}
    body.dark p,body.dark li{color:#e2e8f0}
    body.dark .section-icon{filter:brightness(.45) saturate(1.4)!important}
    body.dark .pkg-badge{background:#162032;border-color:#334155}
    body.dark .pkg-badge code{color:#7dd3fc!important}
    body.dark .highlight-box{background:#162032;border-color:#3b82f6;color:#e2e8f0}
    body.dark .highlight-box a{color:#93c5fd}
    body.dark .highlight-box strong{color:#f1f5f9}
    body.dark .svc-card-top{filter:brightness(.75)}
    body.dark .svc-name{color:#f1f5f9!important}
    body.dark .svc-desc{color:#cbd5e1!important}
    body.dark .svc-data{color:#94a3b8!important}
    body.dark .svc-badge{filter:brightness(.8)}
    body.dark .right-item{background:#162032;border-color:#334155}
    body.dark .right-item strong{color:#93c5fd!important}
    body.dark .right-item span{color:#cbd5e1!important}
    body.dark .updated-badge{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7)}
    body.dark section h2{color:#93c5fd}
    body.dark .toc-head{color:#94a3b8}
    body.dark a{color:#93c5fd}
    body.dark .store-btn.android{background:#1e40af}
    body.dark .store-btn.ios{background:#312e81}
    body.dark .cl-dot{border-color:#1e293b}
    body.dark #toc{background:var(--surface);border-color:var(--border)}
    body.dark .toc-item.active{background:#1e3a5f;color:#93c5fd}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.7;overflow-x:hidden;transition:background .3s,color .3s}
    #progress{position:fixed;top:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899);z-index:1000;transition:width .1s linear}
    .topbar{background:#0f3460;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .topbar a{color:#93c5fd;text-decoration:none;font-size:.82rem;display:inline-flex;align-items:center;gap:5px;transition:color .2s}
    .topbar a:hover{color:#fff}
    .lang-switcher{display:flex;gap:4px}
    .lang-btn{padding:4px 11px;border-radius:20px;font-size:.72rem;font-weight:700;border:1.5px solid rgba(255,255,255,.2);background:transparent;color:rgba(255,255,255,.5);cursor:pointer;transition:all .2s;letter-spacing:.3px}
    .lang-btn.active{background:#fff;color:var(--primary);border-color:#fff}
    .lang-btn:hover:not(.active){border-color:rgba(255,255,255,.6);color:#fff}
    .hero{background:linear-gradient(135deg,#0f3460 0%,#16213e 40%,#1a0a2e 100%);color:#fff;padding:80px 24px 64px;text-align:center;position:relative;overflow:hidden}
    .hero-bg{position:absolute;inset:0;pointer-events:none}
    .hero-bg span{position:absolute;border-radius:50%;opacity:.05;animation:float 8s ease-in-out infinite}
    .hero-bg span:nth-child(1){width:280px;height:280px;background:#3b82f6;top:-120px;left:-80px;animation-delay:0s}
    .hero-bg span:nth-child(2){width:180px;height:180px;background:#8b5cf6;top:-20px;right:-60px;animation-delay:-3s}
    .hero-bg span:nth-child(3){width:120px;height:120px;background:#ec4899;bottom:-60px;right:15%;animation-delay:-5.5s}
    @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.04)}}
    .hero-content{position:relative;z-index:1}
    .hero-icon{font-size:3.5rem;display:block;margin-bottom:16px;filter:drop-shadow(0 4px 16px rgba(0,0,0,.3))}
    .hero h1{font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-1px}
    .hero-sub{margin-top:8px;font-size:1.05rem;color:rgba(255,255,255,.75)}
    .hero-meta{margin-top:24px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
    .plat-badge{padding:5px 14px;border-radius:20px;font-size:.78rem;font-weight:700;letter-spacing:.3px}
    .plat-badge.android{background:rgba(52,211,153,.15);color:#6ee7b7;border:1px solid rgba(52,211,153,.3)}
    .plat-badge.ios{background:rgba(147,197,253,.15);color:#93c5fd;border:1px solid rgba(147,197,253,.3)}
    .updated-badge{padding:5px 14px;border-radius:20px;font-size:.78rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.8)}
    main{max-width:860px;margin:0 auto;padding:48px 24px 80px}
    section{background:var(--surface);border-radius:var(--radius);padding:32px 36px;margin-bottom:20px;box-shadow:0 2px 16px rgba(0,0,0,.05);border:1px solid var(--border);opacity:0;transform:translateY(24px);transition:opacity .5s ease,transform .5s ease,box-shadow .2s}
    section.visible{opacity:1;transform:translateY(0)}
    section:hover{box-shadow:0 8px 32px rgba(0,0,0,.08);transform:translateY(-2px) !important}
    .section-icon{width:44px;height:44px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:14px}
    section h2{font-size:1.15rem;font-weight:700;color:var(--primary);margin-bottom:14px}
    p{margin-bottom:12px;font-size:.95rem}
    p:last-child{margin-bottom:0}
    ul{margin:10px 0 12px 20px;font-size:.93rem}
    ul li{margin-bottom:7px}
    a{color:var(--primary);font-weight:500;text-decoration:none}
    a:hover{text-decoration:underline}
    .pkg-badge{display:inline-flex;align-items:center;gap:8px;background:#f1f5f9;border:1px solid var(--border);border-radius:8px;padding:8px 14px;font-size:.82rem;margin-top:12px}
    .pkg-badge code{font-family:monospace;color:var(--primary);font-weight:600}
    .highlight-box{background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 10px 10px 0;padding:14px 18px;margin:14px 0;font-size:.93rem;line-height:1.8}
    .store-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
    .store-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;font-size:.88rem;font-weight:700;transition:opacity .2s,transform .2s}
    .store-btn:hover{opacity:.85;transform:translateY(-1px);text-decoration:none}
    .store-btn.android{background:#0f3460;color:#fff}
    .store-btn.ios{background:#1a1a2e;color:#fff}
    .svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-top:16px}
    .svc-card{border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:box-shadow .2s,transform .2s;opacity:0;transform:translateY(16px)}
    .svc-card.visible{opacity:1;transform:translateY(0)}
    .svc-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.1);transform:translateY(-3px) !important}
    .svc-card-top{padding:14px 16px;border-bottom:1px solid;display:flex;align-items:center;gap:12px}
    .svc-icon{font-size:1.5rem;flex-shrink:0}
    .svc-name{display:block;font-weight:700;font-size:.9rem;color:var(--text)}
    .svc-badge{display:inline-block;font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:20px;margin-top:4px}
    .svc-desc{padding:12px 16px 0;font-size:.82rem;color:var(--muted)}
    .svc-data{margin:8px 16px 0 32px;font-size:.78rem;color:var(--muted)}
    .svc-data li{margin-bottom:3px}
    .svc-link{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;margin-top:10px;border-top:1px solid var(--border);font-size:.82rem;font-weight:600;color:var(--primary);transition:background .2s}
    .svc-link:hover{background:#f8fafc;text-decoration:none}
    .svc-link span{transition:transform .2s}
    .svc-link:hover span{transform:translateX(3px)}
    .rights-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px}
    .right-item{background:#f8fafc;border:1px solid var(--border);border-radius:10px;padding:14px 16px}
    .right-item strong{display:block;font-size:.88rem;color:var(--primary);margin-bottom:4px}
    .right-item span{font-size:.82rem;color:var(--muted)}
    #btt{position:fixed;bottom:28px;right:24px;width:44px;height:44px;background:var(--primary);color:#fff;border:none;border-radius:50%;font-size:1.1rem;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .3s,transform .3s;z-index:99;box-shadow:0 4px 16px rgba(15,52,96,.3)}
    #btt.show{opacity:1;transform:translateY(0)}
    #btt:hover{background:var(--primary-l)}
    footer{text-align:center;padding:32px 24px;font-size:.82rem;color:var(--muted);border-top:1px solid var(--border)}
    footer a{color:var(--primary)}
    /* ── Dark mode toggle ── */
    .dark-btn{background:transparent;border:1.5px solid rgba(255,255,255,.25);color:rgba(255,255,255,.75);width:32px;height:32px;border-radius:50%;font-size:.95rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;line-height:1}
    .dark-btn:hover{background:rgba(255,255,255,.15);color:#fff}
    /* ── Print button ── */
    .print-btn{background:transparent;border:1.5px solid rgba(255,255,255,.25);color:rgba(255,255,255,.7);padding:4px 11px;border-radius:20px;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.3px}
    .print-btn:hover{background:rgba(255,255,255,.15);color:#fff}
    /* ── ToC ── */
    #toc{position:fixed;top:50%;right:20px;transform:translateY(-50%);width:var(--toc-w);background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 0;box-shadow:0 4px 20px rgba(0,0,0,.1);z-index:90;max-height:70vh;overflow-y:auto;opacity:0;pointer-events:none;transition:opacity .3s}
    #toc.toc-show{opacity:1;pointer-events:auto}
    .toc-head{font-size:.7rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted);padding:0 16px 8px;border-bottom:1px solid var(--border);margin-bottom:6px}
    .toc-item{display:block;padding:6px 16px;font-size:.78rem;color:var(--muted);text-decoration:none;border-left:2px solid transparent;transition:all .15s;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .toc-item:hover{color:var(--primary);border-left-color:var(--primary);background:#f8fafc}
    .toc-item.active{color:var(--primary);border-left-color:var(--primary);background:#eff6ff;font-weight:600}
    body.dark .toc-item:hover{background:#1e293b}
    @media(max-width:1200px){#toc{display:none}}
    /* ── Changelog ── */
    .cl-timeline{margin-top:16px;padding-left:20px;border-left:2px solid var(--border);display:flex;flex-direction:column;gap:20px}
    .cl-entry{position:relative}
    .cl-dot{width:10px;height:10px;background:var(--primary);border-radius:50%;position:absolute;left:-26px;top:5px;border:2px solid var(--surface)}
    .cl-date{font-size:.75rem;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:4px}
    .cl-desc{font-size:.93rem;color:var(--text);margin:0}
    /* ── Print ── */
    @media print{
      #progress,#btt,#toc,.topbar,.lang-switcher,.dark-btn,.print-btn,.store-links,.hero-bg,section:hover{display:none!important}
      body{background:#fff;color:#000}
      .hero{background:#0f3460!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      main{padding:20px 0}
      section{opacity:1!important;transform:none!important;box-shadow:none;border:1px solid #e2e8f0;break-inside:avoid;margin-bottom:12px}
      .svc-card{opacity:1!important;transform:none!important}
      a[href]:after{content:" (" attr(href) ")";font-size:.75rem;color:#475569}
      a.store-btn:after,a.svc-link:after{content:none}
    }
    @media(max-width:600px){section{padding:24px 18px}.hero{padding:56px 20px 44px}}
  </style>
</head>
<body>
<div id="progress"></div>

<div class="topbar">
  <a href="/" id="topbar-back" data-i18n="back">← Tüm Uygulamalar</a>
  <div style="display:flex;align-items:center;gap:8px">
    <button class="print-btn" onclick="window.print()" id="print-btn" data-i18n="print_btn" title="Yazdır / Print">🖨 Yazdır</button>
    <button class="dark-btn" id="dark-btn" onclick="toggleDark()" title="Dark mode">🌙</button>
    <div class="lang-switcher">
      <button class="lang-btn active" data-lang="tr" onclick="setLang('tr')">TR</button>
      <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
    </div>
  </div>
</div>

<div class="hero">
  <div class="hero-bg"><span></span><span></span><span></span></div>
  <div class="hero-content">
    <span class="hero-icon">${icon}</span>
    <h1 id="hero-title" data-i18n="privacy_title">Gizlilik Politikası</h1>
    <p class="hero-sub" id="hero-sub">${name}</p>
    <div class="hero-meta" id="hero-meta">
      ${platBadgesHtml}
      <span class="updated-badge"><span data-i18n="updated_prefix">Son güncelleme: </span>${updated}</span>
    </div>
  </div>
</div>

<nav id="toc" aria-label="İçindekiler">
  <div class="toc-head" data-i18n="toc_title">İçindekiler</div>
</nav>

<main>

  <section id="section-overview">
    <div class="section-icon" style="background:#eff6ff;color:#3b82f6">📋</div>
    <h2 data-i18n="s_overview">Genel Bakış</h2>
    <p><strong>${name}</strong> <span data-i18n="overview_p">uygulaması bu gizlilik politikası kapsamında hizmet vermektedir. Uygulamayı kullanarak bu politikayı kabul etmiş sayılırsınız.</span></p>
    <p data-i18n="overview_p2">Politikamızı kabul etmiyorsanız lütfen uygulamayı kullanmayınız.</p>
    ${pkgBlock}
    ${storeLinks ? '<div class="store-links">' + storeLinks + '</div>' : ''}
  </section>

  <section id="section-data">
    <div class="section-icon" style="background:#f0fdf4;color:#16a34a">📊</div>
    <h2 data-i18n="s_data">Toplanan Veriler</h2>
    <p data-i18n="data_intro">Uygulamamız aşağıdaki verileri toplayabilir:</p>
    <ul id="data-list">
      ${dataList('tr')}
    </ul>
    <p data-i18n="data_no_pii">Uygulama; ad, soyad, T.C. kimlik numarası, kredi kartı gibi hassas kişisel bilgileri doğrudan toplamamaktadır.</p>
  </section>

  <section id="section-third">
    <div class="section-icon" style="background:#f5f3ff;color:#7c3aed">🔗</div>
    <h2 data-i18n="s_third">Üçüncü Taraf Hizmetler</h2>
    <p data-i18n="third_intro">Uygulamamız aşağıdaki üçüncü taraf SDK'larını kullanmaktadır. Her biri kendi gizlilik politikası kapsamında veri işleyebilir:</p>
    <div class="svc-grid" id="svc-grid">
      ${svcCards('tr')}
    </div>
  </section>

  <div id="dynamic-sections">
    ${adsSection('tr')}
    ${attSection('tr')}
    ${pushSection('tr')}
    ${paymentSection('tr')}
    ${locationSection('tr')}
    ${changelogSection('tr')}
  </div>

  <section id="section-security">
    <div class="section-icon" style="background:#fef2f2;color:#dc2626">🔒</div>
    <h2 data-i18n="s_security">Veri Güvenliği</h2>
    <ul id="security-list">
      ${I18N.tr.security_items.map(i => '<li>' + i + '</li>').join('\n      ')}
    </ul>
  </section>

  <section id="section-children">
    <div class="section-icon" style="background:#f0fdf4;color:#15803d">👶</div>
    <h2 data-i18n="s_children">Çocukların Gizliliği</h2>
    <p data-i18n="children_p">${I18N.tr.children_p}</p>
  </section>

  <section id="section-rights">
    <div class="section-icon" style="background:#fffbeb;color:#d97706">⚖️</div>
    <h2 data-i18n="s_rights">Haklarınız (KVKK / GDPR)</h2>
    <div class="rights-grid" id="rights-grid">
      ${rightsGrid('tr')}
    </div>
  </section>

  <section id="section-changes">
    <div class="section-icon" style="background:#f1f5f9;color:#475569">🔄</div>
    <h2 data-i18n="s_changes">Politika Değişiklikleri</h2>
    <p data-i18n="changes_p">${I18N.tr.changes_p}</p>
  </section>

  <section id="section-contact">
    <div class="section-icon" style="background:#eff6ff;color:#2563eb">✉️</div>
    <h2 data-i18n="s_contact">İletişim</h2>
    <p data-i18n="contact_p">Bu gizlilik politikasına ilişkin soru, şikayet veya talepleriniz için:</p>
    <div class="highlight-box">
      ${developerEmail ? '<strong data-i18n="contact_email">E-posta:</strong> <a href="mailto:' + developerEmail + '">' + developerEmail + '</a><br/>' : ''}
      ${developerName  ? '<strong data-i18n="contact_dev">Geliştirici:</strong> ' + developerName + '<br/>' : ''}
      ${playUrl        ? '<strong data-i18n="contact_play">Google Play:</strong> <a href="' + playUrl + '" target="_blank" rel="noopener">Google Play</a><br/>' : ''}
      ${appStoreUrl    ? '<strong data-i18n="contact_store">App Store:</strong> <a href="' + appStoreUrl + '" target="_blank" rel="noopener">App Store</a><br/>' : ''}
    </div>
  </section>

</main>

<button id="btt" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Yukarı / Top">↑</button>

<footer>
  <p>© ${year} ${name}${developerName ? ' · ' + developerName : ''} · <span data-i18n="footer_rights">Tüm hakları saklıdır.</span></p>
  <p style="margin-top:6px"><a href="/">← <span data-i18n="back">Tüm Uygulamalar</span></a></p>
</footer>

<script>
var I18N = ${i18nJson};
var DYN  = ${dynamicSections};
var currentLang = localStorage.getItem('pp_lang') || 'tr';

function setLang(l) {
  currentLang = l;
  localStorage.setItem('pp_lang', l);
  document.documentElement.lang = l;

  // Simple text nodes
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (I18N[l] && I18N[l][key] !== undefined && typeof I18N[l][key] === 'string') {
      el.textContent = I18N[l][key];
    }
  });

  // Dynamic HTML blocks
  document.getElementById('data-list').innerHTML     = DYN['dataList_' + l];
  document.getElementById('svc-grid').innerHTML      = DYN['svcCards_' + l];
  document.getElementById('rights-grid').innerHTML   = DYN['rightsGrid_' + l];
  document.getElementById('dynamic-sections').innerHTML =
    DYN['adsSection_' + l] + DYN['attSection_' + l] +
    DYN['pushSection_' + l] + DYN['paymentSection_' + l] +
    DYN['locationSection_' + l] + DYN['changelogSection_' + l];

  // Security list
  var secList = document.getElementById('security-list');
  if (secList) secList.innerHTML = I18N[l].security_items.map(function(i){ return '<li>' + i + '</li>'; }).join('');

  // Children + changes paragraphs (data-i18n handles them)

  // Highlight active lang button
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === l);
  });

  // Re-observe newly injected cards
  document.querySelectorAll('.svc-card:not(.visible)').forEach(function(el) {
    cardObserver.observe(el);
  });
  document.querySelectorAll('#dynamic-sections section:not(.visible)').forEach(function(el) {
    sectionObserver.observe(el);
  });
}

// Progress bar + back to top
window.addEventListener('scroll', function() {
  var s = document.documentElement;
  document.getElementById('progress').style.width = (s.scrollTop / (s.scrollHeight - s.clientHeight) * 100) + '%';
  document.getElementById('btt').classList.toggle('show', s.scrollTop > 400);
});

// GSAP hero — only animate if GSAP loaded successfully
if (typeof gsap !== 'undefined') {
  gsap.from('.hero-icon',  {duration:1,  scale:.4, opacity:0, ease:'elastic.out(1,.5)', delay:.05});
  gsap.from('#hero-title', {duration:.8, y:30, opacity:0, ease:'power3.out', delay:.2});
  gsap.from('#hero-sub',   {duration:.8, y:20, opacity:0, ease:'power3.out', delay:.35});
  gsap.from('#hero-meta',  {duration:.8, y:15, opacity:0, ease:'power3.out', delay:.5});
}

// Scroll reveal: sections
var sectionObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); sectionObserver.unobserve(e.target); }
  });
}, {threshold:.07, rootMargin:'0px 0px -36px 0px'});

// Scroll reveal: svc cards (staggered)
var cardObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); cardObserver.unobserve(e.target); }
  });
}, {threshold:.08});

document.querySelectorAll('section').forEach(function(el, i) {
  el.style.transitionDelay = (i % 5) * 0.04 + 's';
  sectionObserver.observe(el);
});
document.querySelectorAll('.svc-card').forEach(function(el, i) {
  el.style.transitionDelay = (i % 4) * 0.05 + 's';
  cardObserver.observe(el);
});

// Init language
setLang(currentLang);

// ── Dark mode ──
function toggleDark() {
  var isDark = document.body.classList.toggle('dark');
  localStorage.setItem('pp_dark', isDark ? '1' : '0');
  document.getElementById('dark-btn').textContent = isDark ? '☀️' : '🌙';
}
(function(){
  var saved = localStorage.getItem('pp_dark');
  if (saved === '1' || (saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
    var btn = document.getElementById('dark-btn');
    if (btn) btn.textContent = '☀️';
  }
})();

// ── Floating ToC ──
(function buildToc() {
  var toc = document.getElementById('toc');
  if (!toc) return;
  var sections = document.querySelectorAll('section[id], div[id="dynamic-sections"] section[id]');
  var allSections = document.querySelectorAll('main section[id], #dynamic-sections section[id]');
  // collect from main
  var items = [];
  document.querySelectorAll('main section[id]').forEach(function(sec) {
    var h2 = sec.querySelector('h2');
    if (h2) items.push({ id: sec.id, text: h2.textContent.trim() });
  });
  document.querySelectorAll('#dynamic-sections section[id]').forEach(function(sec) {
    var h2 = sec.querySelector('h2');
    if (h2) items.push({ id: sec.id, text: h2.textContent.trim() });
  });
  if (items.length < 2) return;
  items.forEach(function(item) {
    var a = document.createElement('a');
    a.className = 'toc-item';
    a.setAttribute('data-toc', item.id);
    a.textContent = item.text;
    a.onclick = function() { document.getElementById(item.id) && document.getElementById(item.id).scrollIntoView({behavior:'smooth'}); };
    toc.appendChild(a);
  });
  toc.classList.add('toc-show');

  var tocObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.toc-item').forEach(function(a) {
          a.classList.toggle('active', a.getAttribute('data-toc') === e.target.id);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -60% 0px' });

  document.querySelectorAll('main section[id], #dynamic-sections section[id]').forEach(function(sec) {
    tocObserver.observe(sec);
  });

  // Update ToC text on lang switch (re-read h2 content after setLang)
  var origSetLang = window.setLang;
  window.setLang = function(l) {
    origSetLang(l);
    document.querySelectorAll('.toc-item[data-toc]').forEach(function(a) {
      var sec = document.getElementById(a.getAttribute('data-toc'));
      if (sec) { var h2 = sec.querySelector('h2'); if (h2) a.textContent = h2.textContent.trim(); }
    });
    var head = toc.querySelector('.toc-head');
    if (head) head.textContent = I18N[l].toc_title || (l === 'tr' ? 'İçindekiler' : 'Contents');
  };
})();
</script>
</body>
</html>`;
}

// ── Run ───────────────────────────────────────────────────────────────────────
const apps = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps.json'), 'utf8'));
for (const app of apps) {
  const dir = path.join(__dirname, '..', app.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(app), 'utf8');
  console.log('✅ ' + app.slug + '/index.html');
}

// ── Sitemap ───────────────────────────────────────────────────────────────────
const BASE_URL = 'https://alidemirci2307.github.io';
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { loc: BASE_URL + '/',                  priority: '1.0', changefreq: 'weekly'  },
  { loc: BASE_URL + '/generator/',        priority: '0.8', changefreq: 'monthly' },
  { loc: BASE_URL + '/delete-request/',   priority: '0.6', changefreq: 'monthly' },
  { loc: BASE_URL + '/qr/',               priority: '0.5', changefreq: 'monthly' },
];

const appPages = apps.map(app => ({
  loc: BASE_URL + '/' + app.slug + '/',
  priority: '0.9',
  changefreq: 'monthly',
}));

const allUrls = [...staticPages, ...appPages];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), sitemapXml, 'utf8');
console.log('✅ sitemap.xml (' + allUrls.length + ' URL)');
console.log('\n' + apps.length + ' sayfa oluşturuldu.');
