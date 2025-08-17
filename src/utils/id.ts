export function genId(): string {
  try {
    // ทั้งเบราว์เซอร์และ Node (Next.js) มี crypto.randomUUID อยู่แล้วใน runtime ใหม่ ๆ
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  // fallback เผื่อแปลกเครื่อง/แปลก runtime
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
