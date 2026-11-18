export type ContactChannel = 'email' | 'whatsapp' | 'wechat' | 'messenger';

const CHANNELS: readonly ContactChannel[] = ['email', 'whatsapp', 'wechat', 'messenger'];

/** WeChat leads in Mainland China. WhatsApp leads everywhere else. Every channel stays in the list. */
export function contactChannelsFor(appLang: string | null | undefined, locales: readonly string[]): ContactChannel[] {
  const first: ContactChannel = prefersWeChat(appLang, locales) ? 'wechat' : 'whatsapp';
  return [first, ...CHANNELS.filter(channel => channel !== first)];
}

export function defaultContactChannel(canPrefillEmail: boolean, channels: readonly ContactChannel[]): ContactChannel {
  return canPrefillEmail ? 'email' : channels[0];
}

export function prefersWeChat(appLang: string | null | undefined, locales: readonly string[]): boolean {
  return [appLang, ...locales].some(looksLikeMainlandChina);
}

function looksLikeMainlandChina(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }
  const value = token.trim().toLowerCase().replace(/_/g, '-');
  if (!value) {
    return false;
  }
  // A bare "zh" is Simplified Chinese in this app (see AppComponent.initLanguage).
  if (value === 'zh' || value === 'zh-cn' || value === 'zh-hans' || value === 'cmn-hans' || value === 'cmn-hans-cn') {
    return true;
  }
  const parts = value.split('-');
  return parts.length > 1 && parts[parts.length - 1] === 'cn';
}
