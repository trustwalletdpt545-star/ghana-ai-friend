// FORCE ALWAYS LIVE - NO OFFLINE
export const LIVE_ENABLED = true;
export const isLive = () => true;
export const checkLiveStatus = () => true;
export const getLiveData = () => ({ live: true });
export const liveData = { live: true, offline: false };
export default { live: true };
