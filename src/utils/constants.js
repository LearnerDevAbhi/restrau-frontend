export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const ORDER_FLOW = ['PLACED', 'ACCEPTED', 'PREPARING', 'SERVED', 'COMPLETED'];
export const ACTIVE_STATUSES = ['PLACED', 'ACCEPTED', 'PREPARING', 'SERVED'];
export const NEXT_STATUS = { PLACED: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'SERVED', SERVED: 'COMPLETED' };
export const CANCELLABLE = ['PLACED', 'ACCEPTED', 'PREPARING'];

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];
export const MAX_QTY = 50;
