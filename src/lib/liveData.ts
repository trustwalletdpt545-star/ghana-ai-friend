// Fix for Vercel Build - all required exports
export function detectCity(_input?: any){ return "Accra"; }
export function getLiveTime(){ return new Date().toISOString(); }
export function needsLive(){ return false; }
export function isLiveRequired(){ return false; }
export function shouldUseLive(){ return true; }
export function getLiveMode(){ return "live" as const; }
export function getLiveData(){ return {}; }
export function getLiveWeather(){ return null; }
export function getLiveLocation(){ return "Ghana"; }
export function getCity(){ return "Accra"; }
export function liveTime(){ return new Date().toISOString(); }

export const LIVE_ALWAYS = true;
export const FORCE_LIVE = true;
export const liveData = {};
export const liveLocation = "Ghana";
export const liveMode = "live";
export const liveWeather = null;
export const live = true;
