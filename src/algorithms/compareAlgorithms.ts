import { SearchResult, ComparisonResult } from './algorithmTypes';

/**
 * Computes scientific comparison metrics between UCS and Greedy execution results.
 */
export function compareSearchResults(
  ucsResult: SearchResult,
  greedyResult: SearchResult
): ComparisonResult {
  const ucsDist = ucsResult.totalDistance;
  const greedyDist = greedyResult.totalDistance;

  const diffKm = Math.round(Math.abs(ucsDist - greedyDist) * 1000) / 1000;
  const baseDist = Math.max(0.001, Math.min(ucsDist, greedyDist));
  const diffPct = Math.round((diffKm / baseDist) * 1000) / 10;

  let shorter: 'UCS' | 'GREEDY' | 'EQUAL' = 'EQUAL';
  if (ucsDist < greedyDist - 0.0001) {
    shorter = 'UCS';
  } else if (greedyDist < ucsDist - 0.0001) {
    shorter = 'GREEDY';
  }

  const visitedDiff = ucsResult.visitedCount - greedyResult.visitedCount;
  const expandedDiff = ucsResult.expandedCount - greedyResult.expandedCount;
  const timeDiffMs =
    Math.round((ucsResult.executionTimeMs - greedyResult.executionTimeMs) * 1000) / 1000;

  let summaryText = '';

  if (!ucsResult.found && !greedyResult.found) {
    summaryText =
      'Kedua algoritma sama-sama tidak dapat menemukan rute menuju destinasi karena keterbatasan keterhubungan atau arah jalan satu arah pada graf.';
  } else if (ucsResult.found && !greedyResult.found) {
    summaryText =
      'UCS berhasil menemukan rute optimal, sedangkan Greedy terjebak pada jalan buntu/satu arah akibat pendekatan lokal yang hanya mengandalkan heuristik garis lurus.';
  } else if (!ucsResult.found && greedyResult.found) {
    summaryText = 'Greedy menemukan rute, sedangkan UCS gagal menemukan solusi.';
  } else if (shorter === 'UCS') {
    summaryText = `UCS menghasilkan rute yang lebih pendek (${ucsDist.toFixed(3)} km vs ${greedyDist.toFixed(3)} km, selisih ${diffKm.toFixed(3)} km / ${diffPct}%). Hal ini membuktikan sifat UCS yang menjamin rute optimal berbasis bobot akumulatif jalan nyata g(n), sementara Greedy Best-First Search rentan memilih jalan pintas semu akibat heuristik garis lurus h(n) yang mengabaikan lekukan dan geometri jalan aktual.`;
  } else if (shorter === 'EQUAL') {
    summaryText = `Kedua algoritma menghasilkan rute dengan panjang jarak jalan yang sama (${ucsDist.toFixed(3)} km). Perbedaan terletak pada efisiensi eksplorasi: Greedy mengeksplorasi ${greedyResult.visitedCount} node (${greedyResult.expandedCount} ekspansi) sedangkan UCS mengeksplorasi ${ucsResult.visitedCount} node (${ucsResult.expandedCount} ekspansi).`;
  } else {
    // Greedy shorter (only mathematically possible if graph weights had negative edges or heuristic was inconsistent, but we provide realistic summary)
    summaryText = `Greedy menghasilkan rute ${greedyDist.toFixed(3)} km berbanding UCS ${ucsDist.toFixed(3)} km.`;
  }

  return {
    ucsResult,
    greedyResult,
    distanceDiffKm: diffKm,
    distanceDiffPct: diffPct,
    shorterAlgorithm: shorter,
    visitedDiff,
    expandedDiff,
    timeDiffMs,
    summaryText,
  };
}
