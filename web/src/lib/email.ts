import { createElement } from "react";
import { render } from "@react-email/components";
import { Resend } from "resend";
import { BrandedEmail, type BrandedEmailProps } from "@/emails/branded-email";
import { reportError } from "./error-reporting";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ViziAI <noreply@viziai.app>";

const t = {
  en: {
    inviteSubject: "You've been invited to a profile on ViziAI",
    inviteHeading: "{inviterName} invited you",
    inviteBody:
      "{inviterName} ({inviterEmail}) has invited you to view {profileName}'s health profile on ViziAI as a",
    inviteCta: "Accept Invite",
    inviteFooter:
      "This invite expires in 30 days. If you did not expect this invitation, you can safely ignore this email.",
    accessSubject: "You've been given access to a profile on ViziAI",
    accessHeading: "{inviterName} gave you access",
    accessBody:
      "{inviterName} ({inviterEmail}) has given you access to {profileName}'s health profile on ViziAI as a",
    accessCta: "View Profile",
    accessFooter:
      "If you did not expect this, you can safely ignore this email.",
    context:
      "You'll be able to view blood test trends, health metrics, and reference ranges for this profile.",
    fallback: "Or copy this link:",
    marketing: "ViziAI helps families track and understand blood test results.",
    featureTrack: "Track trends",
    featureSecure: "Private & secure",
    featureFamily: "Family sharing",
    viewer: "Viewer",
    editor: "Editor",
  },
  tr: {
    inviteSubject: "ViziAI'da bir profile davet edildiniz",
    inviteHeading: "{inviterName} sizi davet etti",
    inviteBody:
      "{inviterName} ({inviterEmail}) sizi ViziAI'da {profileName} sağlık profilini görüntülemeye davet etti. Erişim seviyeniz:",
    inviteCta: "Daveti Kabul Et",
    inviteFooter:
      "Bu davetin süresi 30 gün içinde dolar. Bu daveti beklemiyorsanız, bu e-postayı güvenle görmezden gelebilirsiniz.",
    accessSubject: "ViziAI'da bir profile erişim verildi",
    accessHeading: "{inviterName} size erişim verdi",
    accessBody:
      "{inviterName} ({inviterEmail}) size ViziAI'da {profileName} sağlık profiline erişim verdi. Erişim seviyeniz:",
    accessCta: "Profili Görüntüle",
    accessFooter:
      "Bunu beklemiyorsanız, bu e-postayı güvenle görmezden gelebilirsiniz.",
    context:
      "Bu profildeki kan testi trendlerini, sağlık metriklerini ve referans aralıklarını görüntüleyebileceksiniz.",
    fallback: "Veya bu bağlantıyı kopyalayın:",
    marketing:
      "ViziAI, ailelerin kan testi sonuçlarını takip etmesine ve anlamasına yardımcı olur.",
    featureTrack: "Trendleri takip et",
    featureSecure: "Güvenli ve özel",
    featureFamily: "Aile paylaşımı",
    viewer: "Görüntüleyici",
    editor: "Düzenleyici",
  },
  es: {
    inviteSubject: "Has sido invitado a un perfil en ViziAI",
    inviteHeading: "{inviterName} te invitó",
    inviteBody:
      "{inviterName} ({inviterEmail}) te ha invitado a ver el perfil de salud de {profileName} en ViziAI como",
    inviteCta: "Aceptar Invitación",
    inviteFooter:
      "Esta invitación expira en 30 días. Si no esperabas esta invitación, puedes ignorar este correo.",
    accessSubject: "Se te ha dado acceso a un perfil en ViziAI",
    accessHeading: "{inviterName} te dio acceso",
    accessBody:
      "{inviterName} ({inviterEmail}) te ha dado acceso al perfil de salud de {profileName} en ViziAI como",
    accessCta: "Ver Perfil",
    accessFooter: "Si no esperabas esto, puedes ignorar este correo.",
    context:
      "Podrás ver las tendencias de análisis de sangre, métricas de salud y rangos de referencia de este perfil.",
    fallback: "O copia este enlace:",
    marketing:
      "ViziAI ayuda a las familias a seguir y entender sus análisis de sangre.",
    featureTrack: "Seguir tendencias",
    featureSecure: "Privado y seguro",
    featureFamily: "Compartir en familia",
    viewer: "Visor",
    editor: "Editor",
  },
  de: {
    inviteSubject: "Sie wurden zu einem Profil auf ViziAI eingeladen",
    inviteHeading: "{inviterName} hat Sie eingeladen",
    inviteBody:
      "{inviterName} ({inviterEmail}) hat Sie eingeladen, das Gesundheitsprofil von {profileName} auf ViziAI einzusehen als",
    inviteCta: "Einladung annehmen",
    inviteFooter:
      "Diese Einladung läuft in 30 Tagen ab. Wenn Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail ignorieren.",
    accessSubject: "Ihnen wurde Zugriff auf ein Profil auf ViziAI gewährt",
    accessHeading: "{inviterName} hat Ihnen Zugriff gewährt",
    accessBody:
      "{inviterName} ({inviterEmail}) hat Ihnen Zugriff auf das Gesundheitsprofil von {profileName} auf ViziAI gewährt als",
    accessCta: "Profil anzeigen",
    accessFooter:
      "Wenn Sie dies nicht erwartet haben, können Sie diese E-Mail ignorieren.",
    context:
      "Sie können Bluttest-Trends, Gesundheitsmetriken und Referenzbereiche für dieses Profil einsehen.",
    fallback: "Oder kopieren Sie diesen Link:",
    marketing:
      "ViziAI hilft Familien, Bluttestergebnisse zu verfolgen und zu verstehen.",
    featureTrack: "Trends verfolgen",
    featureSecure: "Privat und sicher",
    featureFamily: "Familienfreigabe",
    viewer: "Betrachter",
    editor: "Bearbeiter",
  },
  fr: {
    inviteSubject: "Vous avez été invité à un profil sur ViziAI",
    inviteHeading: "{inviterName} vous a invité",
    inviteBody:
      "{inviterName} ({inviterEmail}) vous a invité à consulter le profil de santé de {profileName} sur ViziAI en tant que",
    inviteCta: "Accepter l'invitation",
    inviteFooter:
      "Cette invitation expire dans 30 jours. Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet e-mail.",
    accessSubject: "Vous avez reçu l'accès à un profil sur ViziAI",
    accessHeading: "{inviterName} vous a donné accès",
    accessBody:
      "{inviterName} ({inviterEmail}) vous a donné accès au profil de santé de {profileName} sur ViziAI en tant que",
    accessCta: "Voir le profil",
    accessFooter:
      "Si vous n'attendiez pas ceci, vous pouvez ignorer cet e-mail.",
    context:
      "Vous pourrez consulter les tendances des analyses de sang, les métriques de santé et les plages de référence de ce profil.",
    fallback: "Ou copiez ce lien :",
    marketing:
      "ViziAI aide les familles à suivre et comprendre leurs analyses de sang.",
    featureTrack: "Suivre les tendances",
    featureSecure: "Privé et sécurisé",
    featureFamily: "Partage familial",
    viewer: "Lecteur",
    editor: "Éditeur",
  },
} as const;

type Locale = keyof typeof t;
type Strings = (typeof t)[Locale];

function getStrings(locale: string): Strings {
  return t[locale as Locale] || t.en;
}

function replaceVars(str: string, vars: Record<string, string>): string {
  let result = str;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

function sharedProps(
  s: Strings,
): Pick<
  BrandedEmailProps,
  "contextText" | "fallbackLabel" | "marketingText" | "featureLabels"
> {
  return {
    contextText: s.context,
    fallbackLabel: s.fallback,
    marketingText: s.marketing,
    featureLabels: [s.featureTrack, s.featureSecure, s.featureFamily],
  };
}

async function renderAndSend(
  to: string,
  subject: string,
  props: BrandedEmailProps,
  errorOp: string,
): Promise<void> {
  try {
    const html = await render(createElement(BrandedEmail, props));
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    reportError(error, { op: errorOp, to });
  }
}

interface SendInviteEmailParams {
  to: string;
  inviterName: string;
  inviterEmail: string;
  profileName: string;
  accessLevel: "viewer" | "editor";
  inviteUrl: string;
  locale: string;
}

export async function sendInviteEmail({
  to,
  inviterName,
  inviterEmail,
  profileName,
  accessLevel,
  inviteUrl,
  locale,
}: SendInviteEmailParams): Promise<void> {
  const s = getStrings(locale);
  const vars = { inviterName, inviterEmail, profileName };

  await renderAndSend(
    to,
    s.inviteSubject,
    {
      previewText: `${inviterName} invited you to view ${profileName}'s health profile`,
      heading: replaceVars(s.inviteHeading, vars),
      bodyText: replaceVars(s.inviteBody, vars),
      accessLabel: accessLevel === "editor" ? s.editor : s.viewer,
      ctaText: s.inviteCta,
      ctaUrl: inviteUrl,
      footerNote: s.inviteFooter,
      ...sharedProps(s),
    },
    "email.sendInvite",
  );
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: "support@viziai.app",
    replyTo: params.email,
    subject: `[ViziAI Contact] ${params.name}`,
    text: `Name: ${params.name}\nEmail: ${params.email}\n\n${params.message}`,
  });
}

interface SendAccessGrantedEmailParams {
  to: string;
  inviterName: string;
  inviterEmail: string;
  profileName: string;
  accessLevel: "viewer" | "editor";
  dashboardUrl: string;
  locale: string;
}

export async function sendAccessGrantedEmail({
  to,
  inviterName,
  inviterEmail,
  profileName,
  accessLevel,
  dashboardUrl,
  locale,
}: SendAccessGrantedEmailParams): Promise<void> {
  const s = getStrings(locale);
  const vars = { inviterName, inviterEmail, profileName };

  await renderAndSend(
    to,
    s.accessSubject,
    {
      previewText: `${inviterName} gave you access to ${profileName}'s health profile`,
      heading: replaceVars(s.accessHeading, vars),
      bodyText: replaceVars(s.accessBody, vars),
      accessLabel: accessLevel === "editor" ? s.editor : s.viewer,
      ctaText: s.accessCta,
      ctaUrl: dashboardUrl,
      footerNote: s.accessFooter,
      ...sharedProps(s),
    },
    "email.sendAccessGranted",
  );
}
