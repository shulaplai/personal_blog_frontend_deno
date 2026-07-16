import dayjs from 'dayjs';

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  return dayjs(date).format(format);
}

export function formatDateTime(date) {
  return formatDate(date, 'YYYY-MM-DD HH:mm');
}

export function truncate(text, maxLength = 200) {
  if (!text) return '';
  const stripped = text.replace(/<[^>]+>/g, '');
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trimEnd() + '…';
}

export function formatWordCount(count) {
  if (!count) return '0';
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + ' 萬';
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return String(count);
}

export function estimateReadTime(wordCount) {
  const minutes = Math.ceil((wordCount || 0) / 300);
  return minutes < 1 ? '少於 1 分鐘' : `約 ${minutes} 分鐘`;
}
