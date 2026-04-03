// src/lib/solar-position.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Solar Position Algorithm — Pure JavaScript
// Based on Jean Meeus "Astronomical Algorithms" (simplified SPA)
// Accuracy: ±0.1° (sufficient for FSO interference analysis)
// No external API calls — all computations are local.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export interface SolarPosition {
  /** Solar azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number;
  /** Solar altitude/elevation in degrees (-90 to +90, negative = below horizon) */
  altitude: number;
  /** Hour angle in degrees */
  hourAngle: number;
  /** Solar declination in degrees */
  declination: number;
  /** Equation of time in minutes */
  equationOfTime: number;
}

export interface SunTimes {
  /** Sunrise time as fractional hours (local time) */
  sunrise: number;
  /** Sunset time as fractional hours (local time) */
  sunset: number;
  /** Solar noon as fractional hours (local time) */
  solarNoon: number;
  /** Day length in hours */
  dayLength: number;
}

export interface InterferenceWindow {
  /** Start time as fractional hours (local time) */
  startHour: number;
  /** End time as fractional hours (local time) */
  endHour: number;
  /** Duration in minutes */
  durationMinutes: number;
  /** Minimum angular delta (sun to device axis) during this window */
  minDelta: number;
  /** Time of minimum delta as fractional hours */
  peakHour: number;
}

export interface DailyInterference {
  /** Day of year (1-366) */
  dayOfYear: number;
  /** Date object */
  date: Date;
  /** Interference windows for this day */
  windows: InterferenceWindow[];
  /** Total interference duration in minutes */
  totalMinutes: number;
}

export interface DeviceInterferenceResult {
  /** Device label ("A → B" or "B → A") */
  label: string;
  /** Device pointing azimuth in degrees */
  pointingAzimuth: number;
  /** Device pointing elevation in degrees */
  pointingElevation: number;
  /** FOV threshold used in degrees */
  fovThreshold: number;
  /** Whether any interference was detected */
  hasInterference: boolean;
  /** Daily interference data for the entire year */
  dailyData: DailyInterference[];
  /** Summary statistics */
  summary: InterferenceSummary;
  /** Hourly heatmap data [month][hour] = risk level 0-1 */
  heatmap: number[][];
}

export interface InterferenceSummary {
  /** Total annual interference hours */
  annualHours: number;
  /** Number of days with interference */
  affectedDays: number;
  /** Peak interference date (worst day) */
  worstDay: Date | null;
  /** Peak interference duration on worst day in minutes */
  worstDayMinutes: number;
  /** Morning interference period (if any) */
  morningPeriod: { startDate: string; endDate: string; avgMinutes: number } | null;
  /** Evening interference period (if any) */
  eveningPeriod: { startDate: string; endDate: string; avgMinutes: number } | null;
  /** Minimum angular delta across the year (closest sun approach) */
  minAngularDelta: number;
  /** Risk level: 'none' | 'low' | 'moderate' | 'high' */
  riskLevel: 'none' | 'low' | 'moderate' | 'high';
  /** Mitigation advice text */
  mitigation: string;
}

// ─── Core Solar Position ────────────────────────────────────────────

/**
 * Compute Julian Day Number from a Date
 */
function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let jy = y;
  let jm = m;
  if (m <= 2) {
    jy -= 1;
    jm += 12;
  }

  const A = Math.floor(jy / 100);
  const B = 2 - A + Math.floor(A / 4);

  return Math.floor(365.25 * (jy + 4716)) +
    Math.floor(30.6001 * (jm + 1)) +
    d + B - 1524.5;
}

/**
 * Compute Julian Century from Julian Day
 */
function toJulianCentury(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Solar geometric mean longitude (degrees)
 */
function solarMeanLongitude(T: number): number {
  return normalizeAngle(280.46646 + T * (36000.76983 + T * 0.0003032));
}

/**
 * Solar mean anomaly (degrees)
 */
function solarMeanAnomaly(T: number): number {
  return normalizeAngle(357.52911 + T * (35999.05029 - T * 0.0001537));
}

/**
 * Earth orbit eccentricity
 */
function earthEccentricity(T: number): number {
  return 0.016708634 - T * (0.000042037 + T * 0.0000001267);
}

/**
 * Sun equation of center (degrees)
 */
function sunEquationOfCenter(T: number): number {
  const M = solarMeanAnomaly(T) * DEG2RAD;
  return Math.sin(M) * (1.914602 - T * (0.004817 + T * 0.000014)) +
    Math.sin(2 * M) * (0.019993 - T * 0.000101) +
    Math.sin(3 * M) * 0.000289;
}

/**
 * Sun true longitude (degrees)
 */
function sunTrueLongitude(T: number): number {
  return solarMeanLongitude(T) + sunEquationOfCenter(T);
}

/**
 * Sun apparent longitude (degrees)
 */
function sunApparentLongitude(T: number): number {
  const omega = 125.04 - 1934.136 * T;
  return sunTrueLongitude(T) - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);
}

/**
 * Mean obliquity of ecliptic (degrees)
 */
function meanObliquity(T: number): number {
  return 23.0 + (26.0 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60.0) / 60.0;
}

/**
 * Corrected obliquity (degrees)
 */
function correctedObliquity(T: number): number {
  const omega = 125.04 - 1934.136 * T;
  return meanObliquity(T) + 0.00256 * Math.cos(omega * DEG2RAD);
}

/**
 * Solar declination angle (degrees)
 */
function solarDeclination(T: number): number {
  const epsilon = correctedObliquity(T) * DEG2RAD;
  const lambda = sunApparentLongitude(T) * DEG2RAD;
  return Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * RAD2DEG;
}

/**
 * Equation of Time (minutes)
 */
function equationOfTime(T: number): number {
  const epsilon = correctedObliquity(T) * DEG2RAD;
  const L0 = solarMeanLongitude(T) * DEG2RAD;
  const e = earthEccentricity(T);
  const M = solarMeanAnomaly(T) * DEG2RAD;

  let y = Math.tan(epsilon / 2);
  y *= y;

  const EoT = y * Math.sin(2 * L0) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0) -
    0.5 * y * y * Math.sin(4 * L0) -
    1.25 * e * e * Math.sin(2 * M);

  return EoT * 4 * RAD2DEG; // Convert to minutes
}

/**
 * Compute solar position for a given location and date/time.
 *
 * @param latitude  — Latitude in decimal degrees (+ North)
 * @param longitude — Longitude in decimal degrees (+ East)
 * @param date      — Date/time (UTC)
 * @returns SolarPosition with azimuth and altitude
 */
export function getSolarPosition(
  latitude: number,
  longitude: number,
  date: Date,
): SolarPosition {
  const jd = toJulianDay(date);
  const T = toJulianCentury(jd);

  const decl = solarDeclination(T);
  const eot = equationOfTime(T);

  // Time offset in minutes (from UTC)
  const timeOffset = eot + 4 * longitude;

  // True solar time in minutes
  const tst = (date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60) + timeOffset;

  // Hour angle in degrees
  const ha = tst / 4 - 180;

  const latRad = latitude * DEG2RAD;
  const declRad = decl * DEG2RAD;
  const haRad = ha * DEG2RAD;

  // Solar altitude
  const sinAlt = Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;

  // Solar azimuth
  const cosZenith = sinAlt;
  const sinZenith = Math.cos(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

  let azimuth: number;
  if (sinZenith === 0) {
    azimuth = 0;
  } else {
    const cosAz = (Math.sin(declRad) - Math.sin(latRad) * cosZenith) /
      (Math.cos(latRad) * sinZenith);
    azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD2DEG;

    if (ha > 0) {
      azimuth = 360 - azimuth;
    }
  }

  return {
    azimuth: normalizeAngle(azimuth),
    altitude,
    hourAngle: ha,
    declination: decl,
    equationOfTime: eot,
  };
}

/**
 * Compute sunrise, sunset, and solar noon times.
 *
 * @param latitude  — Latitude in decimal degrees
 * @param longitude — Longitude in decimal degrees
 * @param date      — Date (only the date part is used)
 * @param tzOffsetHours — Timezone offset from UTC in hours (e.g., +5.5 for IST)
 * @returns SunTimes with local times
 */
export function getSunTimes(
  latitude: number,
  longitude: number,
  date: Date,
  tzOffsetHours: number,
): SunTimes {
  const jd = toJulianDay(new Date(Date.UTC(
    date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0
  )));
  const T = toJulianCentury(jd);

  const decl = solarDeclination(T);
  const eot = equationOfTime(T);

  const latRad = latitude * DEG2RAD;
  const declRad = decl * DEG2RAD;

  // Hour angle for sunrise/sunset (when altitude = -0.833° for refraction)
  const cosHA = (Math.sin(-0.833 * DEG2RAD) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  if (cosHA > 1) {
    // Sun never rises (polar night)
    return { sunrise: 0, sunset: 0, solarNoon: 12 + tzOffsetHours, dayLength: 0 };
  }
  if (cosHA < -1) {
    // Sun never sets (midnight sun)
    return { sunrise: 0, sunset: 24, solarNoon: 12 + tzOffsetHours, dayLength: 24 };
  }

  const haRise = Math.acos(cosHA) * RAD2DEG;

  // Solar noon in local time
  const solarNoon = (720 - 4 * longitude - eot) / 60 + tzOffsetHours;

  const sunrise = solarNoon - haRise / 15 * 1;
  const sunset = solarNoon + haRise / 15 * 1;
  const dayLength = sunset - sunrise;

  return { sunrise, sunset, solarNoon, dayLength };
}

// ─── Angular Distance ───────────────────────────────────────────────

/**
 * Compute angular distance between two direction vectors (azimuth + altitude).
 * Uses the Vincenty formula for accuracy near 0°.
 */
export function angularDistance(
  az1: number, alt1: number,
  az2: number, alt2: number,
): number {
  const az1r = az1 * DEG2RAD;
  const alt1r = alt1 * DEG2RAD;
  const az2r = az2 * DEG2RAD;
  const alt2r = alt2 * DEG2RAD;

  const daz = az2r - az1r;

  const sinAlt1 = Math.sin(alt1r);
  const cosAlt1 = Math.cos(alt1r);
  const sinAlt2 = Math.sin(alt2r);
  const cosAlt2 = Math.cos(alt2r);

  const num = Math.sqrt(
    Math.pow(cosAlt2 * Math.sin(daz), 2) +
    Math.pow(cosAlt1 * sinAlt2 - sinAlt1 * cosAlt2 * Math.cos(daz), 2)
  );
  const den = sinAlt1 * sinAlt2 + cosAlt1 * cosAlt2 * Math.cos(daz);

  return Math.atan2(num, den) * RAD2DEG;
}

// ─── Device Pointing Direction ──────────────────────────────────────

/**
 * Compute the pointing direction from one site to another.
 *
 * @param fromLat — Latitude of the device
 * @param fromLng — Longitude of the device
 * @param fromHeight — Tower height at device (meters above ground)
 * @param toLat — Latitude of the far end
 * @param toLng — Longitude of the far end
 * @param toHeight — Tower height at the far end
 * @param distanceKm — Distance between sites in km
 * @returns { azimuth, elevation } in degrees
 */
export function computePointingDirection(
  fromLat: number, fromLng: number, fromHeight: number,
  toLat: number, toLng: number, toHeight: number,
  distanceKm: number,
): { azimuth: number; elevation: number } {
  // Bearing calculation (Haversine-based)
  const dLon = (toLng - fromLng) * DEG2RAD;
  const lat1 = fromLat * DEG2RAD;
  const lat2 = toLat * DEG2RAD;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const azimuth = normalizeAngle(Math.atan2(y, x) * RAD2DEG);

  // Elevation angle (accounting for Earth curvature)
  const distanceM = distanceKm * 1000;
  const heightDiff = toHeight - fromHeight;

  // Earth curvature drop over distance
  const R = 6371000; // Earth radius in meters
  const curvatureDrop = (distanceM * distanceM) / (2 * R);

  // Effective height difference (target appears lower due to curvature)
  const effectiveHeightDiff = heightDiff - curvatureDrop;

  const elevation = Math.atan2(effectiveHeightDiff, distanceM) * RAD2DEG;

  return { azimuth, elevation };
}

// ─── Interference Analysis ──────────────────────────────────────────

/**
 * Analyze solar interference for a single device over an entire year.
 *
 * @param deviceLat — Device latitude
 * @param deviceLng — Device longitude
 * @param deviceHeight — Device tower height (m)
 * @param farLat — Far-end latitude
 * @param farLng — Far-end longitude
 * @param farHeight — Far-end tower height (m)
 * @param distanceKm — Distance between sites (km)
 * @param fovThreshold — FOV half-angle in degrees (default 3°)
 * @param year — Year to analyze (default current year)
 * @param tzOffsetHours — Timezone offset from UTC (default +5.5 for IST)
 * @returns DeviceInterferenceResult
 */
export function analyzeDeviceInterference(
  deviceLat: number, deviceLng: number, deviceHeight: number,
  farLat: number, farLng: number, farHeight: number,
  distanceKm: number,
  fovThreshold: number = 3,
  year: number = new Date().getFullYear(),
  tzOffsetHours: number = 5.5,
): DeviceInterferenceResult {
  const pointing = computePointingDirection(
    deviceLat, deviceLng, deviceHeight,
    farLat, farLng, farHeight,
    distanceKm,
  );

  const dailyData: DailyInterference[] = [];
  const heatmap: number[][] = Array.from({ length: 12 }, () =>
    new Array(24).fill(0)
  );

  let totalAnnualMinutes = 0;
  let worstDay: Date | null = null;
  let worstDayMinutes = 0;
  let globalMinDelta = Infinity;

  // Analyze each day of the year
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dayOfYear = Math.floor((d.getTime() - startDate.getTime()) / 86400000) + 1;
    const month = d.getMonth();

    // Get sunrise/sunset to limit computation
    const sunTimes = getSunTimes(deviceLat, deviceLng, d, tzOffsetHours);

    // Check every 5 minutes during daylight hours
    const windows: InterferenceWindow[] = [];
    let currentWindow: {
      startHour: number;
      minDelta: number;
      peakHour: number;
    } | null = null;

    const checkStart = Math.max(0, Math.floor(sunTimes.sunrise * 60) - 30);
    const checkEnd = Math.min(1440, Math.ceil(sunTimes.sunset * 60) + 30);

    for (let minute = checkStart; minute <= checkEnd; minute += 5) {
      const localHour = minute / 60;
      const utcHour = localHour - tzOffsetHours;

      // Create UTC date for this minute
      const checkDate = new Date(Date.UTC(
        d.getFullYear(), d.getMonth(), d.getDate(),
        Math.floor(utcHour), Math.round((utcHour % 1) * 60), 0
      ));

      const sun = getSolarPosition(deviceLat, deviceLng, checkDate);

      // Skip if sun is below horizon
      if (sun.altitude < 0) continue;

      // Compute angular distance between sun and device pointing direction
      const delta = angularDistance(
        pointing.azimuth, pointing.elevation,
        sun.azimuth, sun.altitude,
      );

      // Update heatmap (normalize to 0-1 risk, where 0 is fov*3 or more)
      const risk = Math.max(0, 1 - delta / (fovThreshold * 3));
      const hour = Math.floor(localHour);
      if (hour >= 0 && hour < 24) {
        heatmap[month][hour] = Math.max(heatmap[month][hour], risk);
      }

      if (delta < globalMinDelta) {
        globalMinDelta = delta;
      }

      // Check if within FOV threshold
      if (delta <= fovThreshold) {
        if (!currentWindow) {
          currentWindow = {
            startHour: localHour,
            minDelta: delta,
            peakHour: localHour,
          };
        } else {
          if (delta < currentWindow.minDelta) {
            currentWindow.minDelta = delta;
            currentWindow.peakHour = localHour;
          }
        }
      } else if (currentWindow) {
        // Window ended
        const endHour = localHour;
        const duration = (endHour - currentWindow.startHour) * 60;
        if (duration > 0) {
          windows.push({
            startHour: currentWindow.startHour,
            endHour: endHour,
            durationMinutes: duration,
            minDelta: currentWindow.minDelta,
            peakHour: currentWindow.peakHour,
          });
        }
        currentWindow = null;
      }
    }

    // Close any open window
    if (currentWindow) {
      const endHour = checkEnd / 60;
      const duration = (endHour - currentWindow.startHour) * 60;
      if (duration > 0) {
        windows.push({
          startHour: currentWindow.startHour,
          endHour: endHour,
          durationMinutes: duration,
          minDelta: currentWindow.minDelta,
          peakHour: currentWindow.peakHour,
        });
      }
    }

    const totalMinutes = windows.reduce((sum, w) => sum + w.durationMinutes, 0);
    totalAnnualMinutes += totalMinutes;

    if (totalMinutes > worstDayMinutes) {
      worstDayMinutes = totalMinutes;
      worstDay = new Date(d);
    }

    dailyData.push({
      dayOfYear,
      date: new Date(d),
      windows,
      totalMinutes,
    });
  }

  // Compute summary
  const affectedDays = dailyData.filter(d => d.totalMinutes > 0).length;
  const annualHours = totalAnnualMinutes / 60;

  // Identify morning and evening periods
  const morningPeriod = identifyPeriod(dailyData, 'morning');
  const eveningPeriod = identifyPeriod(dailyData, 'evening');

  // Determine risk level
  let riskLevel: InterferenceSummary['riskLevel'];
  if (annualHours === 0) riskLevel = 'none';
  else if (annualHours < 20) riskLevel = 'low';
  else if (annualHours < 100) riskLevel = 'moderate';
  else riskLevel = 'high';

  // Mitigation advice
  let mitigation: string;
  switch (riskLevel) {
    case 'none':
      mitigation = 'No sun interference detected. No mitigation needed.';
      break;
    case 'low':
      mitigation = `Low risk. Consider a narrow sun hood oriented at ${pointing.azimuth.toFixed(0)}° ± 15°.`;
      break;
    case 'moderate':
      mitigation = `Moderate risk (~${annualHours.toFixed(0)} hrs/year). Install a sun shield oriented at ${pointing.azimuth.toFixed(0)}° ± 15° and consider scheduling maintenance during interference windows.`;
      break;
    case 'high':
      mitigation = `High risk (~${annualHours.toFixed(0)} hrs/year). Install a deep sun shield oriented at ${pointing.azimuth.toFixed(0)}° ± 20°. Consider automatic gain control or redundant path during interference periods.`;
      break;
  }

  const label = `Pointing ${pointing.azimuth.toFixed(1)}° ${getCompassDirection(pointing.azimuth)}, ${pointing.elevation >= 0 ? '+' : ''}${pointing.elevation.toFixed(1)}°`;

  return {
    label,
    pointingAzimuth: pointing.azimuth,
    pointingElevation: pointing.elevation,
    fovThreshold,
    hasInterference: annualHours > 0,
    dailyData,
    summary: {
      annualHours,
      affectedDays,
      worstDay,
      worstDayMinutes,
      morningPeriod,
      eveningPeriod,
      minAngularDelta: globalMinDelta === Infinity ? 999 : globalMinDelta,
      riskLevel,
      mitigation,
    },
    heatmap,
  };
}

// ─── Full Link Analysis ─────────────────────────────────────────────

export interface SolarAnalysisResult {
  /** Analysis for Device A (pointing toward B) */
  deviceA: DeviceInterferenceResult;
  /** Analysis for Device B (pointing toward A) */
  deviceB: DeviceInterferenceResult;
  /** Combined risk level */
  overallRisk: 'none' | 'low' | 'moderate' | 'high';
}

/**
 * Analyze solar interference for both ends of an FSO link.
 */
export function analyzeSolarInterference(
  siteA: { lat: number; lng: number; height: number; name: string },
  siteB: { lat: number; lng: number; height: number; name: string },
  distanceKm: number,
  fovThreshold: number = 3,
  year?: number,
  tzOffsetHours?: number,
): SolarAnalysisResult {
  const deviceA = analyzeDeviceInterference(
    siteA.lat, siteA.lng, siteA.height,
    siteB.lat, siteB.lng, siteB.height,
    distanceKm, fovThreshold, year, tzOffsetHours,
  );

  const deviceB = analyzeDeviceInterference(
    siteB.lat, siteB.lng, siteB.height,
    siteA.lat, siteA.lng, siteA.height,
    distanceKm, fovThreshold, year, tzOffsetHours,
  );

  // Override labels with site names
  deviceA.label = `${siteA.name} → ${siteB.name}`;
  deviceB.label = `${siteB.name} → ${siteA.name}`;

  // Overall risk is the maximum of both
  const riskOrder = { none: 0, low: 1, moderate: 2, high: 3 };
  const overallRisk = riskOrder[deviceA.summary.riskLevel] >= riskOrder[deviceB.summary.riskLevel]
    ? deviceA.summary.riskLevel
    : deviceB.summary.riskLevel;

  return { deviceA, deviceB, overallRisk };
}

// ─── Helpers ────────────────────────────────────────────────────────

function identifyPeriod(
  dailyData: DailyInterference[],
  type: 'morning' | 'evening',
): { startDate: string; endDate: string; avgMinutes: number } | null {
  const threshold = type === 'morning' ? 12 : 12;
  const relevantDays = dailyData.filter(d =>
    d.windows.some(w =>
      type === 'morning' ? w.peakHour < threshold : w.peakHour >= threshold
    )
  );

  if (relevantDays.length === 0) return null;

  const startDate = relevantDays[0].date;
  const endDate = relevantDays[relevantDays.length - 1].date;
  const totalMinutes = relevantDays.reduce((sum, d) => {
    return sum + d.windows
      .filter(w => type === 'morning' ? w.peakHour < threshold : w.peakHour >= threshold)
      .reduce((s, w) => s + w.durationMinutes, 0);
  }, 0);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    avgMinutes: Math.round(totalMinutes / relevantDays.length),
  };
}

function formatDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getCompassDirection(azimuth: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(azimuth / 22.5) % 16;
  return dirs[idx];
}
