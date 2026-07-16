export function required(value, fieldName = '此欄位') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName}為必填`;
  }
  return null;
}

export function maxLength(value, max, fieldName = '此欄位') {
  if (value && value.length > max) {
    return `${fieldName}不可超過 ${max} 個字元`;
  }
  return null;
}

export function isValidUrl(value) {
  if (!value) return true; // optional
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function url(value, fieldName = '此欄位') {
  if (value && !isValidUrl(value)) {
    return `${fieldName}格式不正確`;
  }
  return null;
}
