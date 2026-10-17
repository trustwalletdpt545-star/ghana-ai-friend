export function getLiveTime(tz?: any){ try{ return new Date().toLocaleString('en-US',{timeZone: tz||'Africa/Accra'}) }catch{ return new Date().toISOString() } }
export function needsLive(_q?: any){ return true; }
export function detectCity(_q?: any){ return "Accra"; }
export function getWeather(_c?: any){ return "Sunny 31°C in Accra"; }
export function liveSearch(_q?: any){ return null; }
export function isNewsQuery(_q?: any){ return false; }
export async function tavilyNews(_q?: any){ return null; }
export function getLiveData(){ return {}; }
export function getLiveWeather(){ return null; }
export function getLiveLocation(){ return "Ghana"; }
export function getCity(){ return "Accra"; }
export function isLiveRequired(){ return false; }
export function shouldUseLive(){ return true; }
export function getLiveMode(){ return "live" as const; }
export const LIVE_ALWAYS=true;
export const FORCE_LIVE=true;
export const liveData={};
export const liveLocation="Ghana";
export const liveMode="live";
export const liveWeather=null;
export const live=true;
export const weather="Sunny";
export default {};
