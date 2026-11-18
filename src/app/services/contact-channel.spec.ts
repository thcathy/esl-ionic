import {contactChannelsFor, prefersWeChat} from './contact-channel';

describe('contactChannelsFor', () => {
  it('lists WeChat first for Mainland Chinese language or locale and keeps every channel', () => {
    expect(contactChannelsFor('zh-Hans', ['en-US'])).toEqual(['wechat', 'email', 'whatsapp', 'messenger']);
    expect(contactChannelsFor('en', ['zh-CN'])).toEqual(['wechat', 'email', 'whatsapp', 'messenger']);
    expect(contactChannelsFor('zh-Hant', ['en-CN'])).toEqual(['wechat', 'email', 'whatsapp', 'messenger']);
    expect(prefersWeChat(null, ['zh-Hans-CN'])).toBeTrue();
    expect(prefersWeChat('zh', [])).toBeFalse();
  });

  it('lists WhatsApp first outside Mainland China and keeps every channel', () => {
    expect(contactChannelsFor('en', ['en-US'])).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);
    expect(contactChannelsFor('zh-Hant', ['zh-HK'])).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);
    expect(contactChannelsFor('en', ['zh-TW', 'zh-SG'])).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);
    expect(contactChannelsFor('zh-Hant', ['zh-HK', 'zh-CN', 'zh'])).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);
    expect(contactChannelsFor('en', ['zh-TW', 'zh'])).toEqual(['whatsapp', 'email', 'wechat', 'messenger']);
    expect(prefersWeChat('en', [])).toBeFalse();
    expect(prefersWeChat(null, [])).toBeFalse();
  });
});
