export function isLiveRequired(){return false}
export function needsLive(){return false}
export function shouldUseLive(){return true}
export function getLiveMode(){return "live" as const}
export const LIVE_ALWAYS=true
export const FORCE_LIVE=true
