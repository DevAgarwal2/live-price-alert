import { InlineKeyboard } from 'grammy';

export function getMainMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📈 STOCKS', 'menu_stocks')
    .text('🟡 GOLD', 'asset_GC')
    .text('⚪ SILVER', 'asset_SI')
    .row()
    .text('⚙️ SETTINGS', 'menu_settings');
}

export function getStocksMenu(): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text('AAPL', 'asset_AAPL').text('GOOGL', 'asset_GOOGL').text('NFLX', 'asset_NFLX').row()
    .text('MSFT', 'asset_MSFT').text('AMZN', 'asset_AMZN').text('PLTR', 'asset_PLTR').row()
    .text('NVDA', 'asset_NVDA').text('META', 'asset_META').text('TSLA', 'asset_TSLA').row()
    .text('⬅️ Back', 'menu_main');
  
  return keyboard;
}

export function getSettingsMenu(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔇 Mute Assets', 'settings_mute')
    .row()
    .text('⬅️ Back', 'menu_main');
}

export function getMuteMenu(mutedAssets: string[]): InlineKeyboard {
  const allAssets = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'NFLX', name: 'Netflix' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'PLTR', name: 'Palantir' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'GC', name: 'Gold' },
    { symbol: 'SI', name: 'Silver' }
  ];
  
  const keyboard = new InlineKeyboard();
  
  allAssets.forEach((asset, index) => {
    const isMuted = mutedAssets.includes(asset.symbol);
    const icon = isMuted ? '🔇' : '🔔';
    keyboard.text(`${icon} ${asset.symbol}`, `mute_toggle_${asset.symbol}`);
    
    if ((index + 1) % 3 === 0) keyboard.row();
  });
  
  keyboard.row().text('⬅️ Back', 'menu_settings');
  
  return keyboard;
}
