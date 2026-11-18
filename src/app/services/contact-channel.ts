export type ContactChannel = 'email' | 'whatsapp' | 'wechat' | 'messenger';

const CHANNELS: readonly ContactChannel[] = ['email', 'whatsapp', 'wechat', 'messenger'];

/** WeChat leads in Mainland China. WhatsApp leads everywhere else. Every channel stays in the list. */
export function contactChannelsFor(appLang: string | null | undefined, locales: readonly string[]): ContactChannel[] {
  const first: ContactChannel = prefersWeChat(appLang, locales) ? 'wechat' : 'whatsapp';
  return [first, ...CHANNELS.filter(channel => channel !== first)];
}

export function prefersWeChat(appLang: string | null | undefined, locales: readonly string[]): boolean {
  if (looksLikeMainlandChina(appLang)) {
    return true;
  }
  const primary = locales.find(locale => !!locale?.trim());
  return looksLikeMainlandChina(primary);
}

function looksLikeMainlandChina(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }
  const value = token.trim().toLowerCase().replace(/_/g, '-');
  if (!value) {
    return false;
  }
  if (value === 'zh-cn' || value === 'zh-hans' || value === 'cmn-hans' || value === 'cmn-hans-cn') {
    return true;
  }
  const parts = value.split('-').filter(part => part.length > 0);
  return parts.length > 1 && parts[parts.length - 1] === 'cn';
}
