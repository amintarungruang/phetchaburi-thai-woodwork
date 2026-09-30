import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '.telegram-settings.json');

async function getStoredConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveStoredConfig(settings: any) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write .telegram-settings.json', e);
    return false;
  }
}

export async function GET() {
  const stored = await getStoredConfig();
  const token = stored?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = stored?.chat_id || process.env.TELEGRAM_CHAT_ID;
  const isEnabled = stored?.is_enabled ?? true;

  const resolvedSettings = stored || (token && chatId ? {
    bot_token: token,
    chat_id: chatId,
    is_enabled: isEnabled,
    notify_on_lead: true,
    notify_on_low_stock: true,
    notify_on_schedule: true,
    daily_summary_enabled: true,
    daily_summary_time: '08:00',
    low_stock_reminder_enabled: true,
    reminder_times: ['09:00', '13:00', '17:00'],
  } : null);

  return NextResponse.json({
    configured: !!(token && chatId),
    is_enabled: isEnabled,
    chat_id: chatId ? `${chatId.slice(0, 4)}***` : null,
    settings: resolvedSettings,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle save config action from admin settings modal
    if (body.action === 'save_config') {
      if (body.settings) {
        await saveStoredConfig(body.settings);
        return NextResponse.json({ success: true, message: 'Settings saved to server' });
      }
      return NextResponse.json({ success: false, error: 'No settings provided' }, { status: 400 });
    }

    const {
      text,
      bot_token: customToken,
      chat_id: customChatId,
      parse_mode = 'HTML',
      type,
    } = body;

    const stored = await getStoredConfig();
    const token = customToken || stored?.bot_token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = customChatId || stored?.chat_id || process.env.TELEGRAM_CHAT_ID;
    const isEnabled = stored?.is_enabled ?? (process.env.TELEGRAM_ENABLED !== 'false');

    // If this is an automated lead notification, verify if lead alerts are enabled
    if (type === 'lead') {
      const notifyOnLead = stored?.notify_on_lead ?? true;
      if (!isEnabled || !notifyOnLead) {
        return NextResponse.json({ success: true, skipped: 'Lead alerts are disabled in settings' });
      }
    }

    if (!token || !chatId) {
      console.warn('Telegram notification skipped: Missing token or chat_id');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Telegram bot_token or chat_id. Please configure them in Settings or .env.local',
        },
        { status: 400 }
      );
    }

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing message text' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.description || 'Failed to send message via Telegram API',
          telegram_response: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ success: true, result: data.result });
  } catch (error: any) {
    console.error('Telegram route internal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
