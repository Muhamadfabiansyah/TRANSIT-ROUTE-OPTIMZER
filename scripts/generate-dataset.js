import fs from 'fs';
import path from 'path';

// Earth radius in km
const R = 6371.0088;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversine(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calcPolylineDist(coords) {
  let dist = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    dist += haversine(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
  }
  return Math.round(dist * 10000) / 10000;
}

const nodes = [
  {
    id: "N01",
    name: "Pasar Induk Rau Serang (RTC)",
    lat: -6.1105,
    lng: 106.1679,
    type: "terminal",
    description: "Pusat grosir dan terminal angkutan umum utama Rau Trade Center di bagian timur kota."
  },
  {
    id: "N02",
    name: "Simpang Cinanggung",
    lat: -6.1118,
    lng: 106.1632,
    type: "junction",
    description: "Persimpangan Jl. Cinanggung & Jl. TB Sueb penghubung Pasar Rau dengan koridor Stasiun."
  },
  {
    id: "N03",
    name: "Stasiun Kereta Api Serang",
    lat: -6.1124,
    lng: 106.1586,
    type: "station",
    description: "Stasiun KAI Daop 1 lintas Tanah Abang - Merak di Jl. Ki Tapa, simpul transit kereta dan angkot."
  },
  {
    id: "N04",
    name: "Simpang Calung / Lontarbaru",
    lat: -6.1142,
    lng: 106.1558,
    type: "junction",
    description: "Persimpangan Jl. Kotabaru dan Jl. TB Buang menuju kawasan pemukiman Lontarbaru."
  },
  {
    id: "N05",
    name: "Kawasan Niaga Royal Serang",
    lat: -6.1152,
    lng: 106.1574,
    type: "commercial",
    description: "Kawasan pertokoan dan sentra niaga Jl. Sultan Ageng Tirtayasa dan Jl. Diponegoro."
  },
  {
    id: "N06",
    name: "Masjid Agung Ats-Tsaurah",
    lat: -6.1168,
    lng: 106.1570,
    type: "religious",
    description: "Masjid Agung bersejarah Kota Serang di Jl. Veteran, simpul lalu lintas dan pusat keagamaan."
  },
  {
    id: "N07",
    name: "Ramayana Mall Serang",
    lat: -6.1167,
    lng: 106.1537,
    type: "commercial",
    description: "Pusat perbelanjaan utama Jl. Veteran sisi timur Alun-Alun Serang."
  },
  {
    id: "N08",
    name: "Alun-Alun Kota Serang",
    lat: -6.1172,
    lng: 106.1513,
    type: "public_square",
    description: "Ruang terbuka publik sentral, titik nol kilometer dan pusat keramaian serbaguna Kota Serang."
  },
  {
    id: "N09",
    name: "Simpang Kaujon",
    lat: -6.1205,
    lng: 106.1488,
    type: "junction",
    description: "Simpang penghubung Jl. Ki Mas Jong ke Jl. Mayor Syafei menuju selatan Kota Serang."
  },
  {
    id: "N10",
    name: "Simpang Magersari",
    lat: -6.1215,
    lng: 106.1592,
    type: "junction",
    description: "Simpang arteri Jl. Jend. Ahmad Yani dan Jl. KH Abdul Hadi arah Cipare."
  },
  {
    id: "N11",
    name: "Simpang Kebon Jahe",
    lat: -6.1258,
    lng: 106.1615,
    type: "junction",
    description: "Simpang perlintasan Jl. KH Abdul Hadi dan Jl. KH Abdul Fatah Hasan."
  },
  {
    id: "N12",
    name: "Simpang Ciceri (Bunderan)",
    lat: -6.1252,
    lng: 106.1690,
    type: "junction",
    description: "Kawasan Bunderan Ciceri dan Jl. Jend. Sudirman gerbang akses timur/akses tol Serang Timur."
  },
  {
    id: "N13",
    name: "Simpang Pisangan - Sumurpecung",
    lat: -6.1198,
    lng: 106.1670,
    type: "junction",
    description: "Persimpangan Jl. KH Abdul Fatah Hasan Utara dan Jl. KH Ahmad Khatib menuju Pasar Rau."
  },
  {
    id: "N14",
    name: "Simpang Lopang Indah",
    lat: -6.1082,
    lng: 106.1620,
    type: "junction",
    description: "Simpang Jl. Raya Banten Lama arah Kasemen - Lopang dan koridor utara Stasiun."
  }
];

// Define road links with realistic curved polyline geometries along actual street tracks
const rawEdges = [
  {
    id: "E01_02",
    source: "N01",
    target: "N02",
    streetName: "Jl. TB Sueb / Jl. Cinanggung",
    oneWay: false,
    geometry: [
      [-6.1105, 106.1679],
      [-6.1108, 106.1663],
      [-6.1112, 106.1648],
      [-6.1118, 106.1632]
    ],
    description: "Akses barat Pasar Rau menuju Jl. Cinanggung"
  },
  {
    id: "E01_13",
    source: "N01",
    target: "N13",
    streetName: "Jl. KH Abdul Latif / Jl. Ayip Usman",
    oneWay: false,
    geometry: [
      [-6.1105, 106.1679],
      [-6.1130, 106.1681],
      [-6.1160, 106.1678],
      [-6.1198, 106.1670]
    ],
    description: "Koridor timur menghubungkan Pasar Rau ke Sumurpecung"
  },
  {
    id: "E02_03",
    source: "N02",
    target: "N03",
    streetName: "Jl. Ki Tapa Timur",
    oneWay: false,
    geometry: [
      [-6.1118, 106.1632],
      [-6.1120, 106.1615],
      [-6.1122, 106.1601],
      [-6.1124, 106.1586]
    ],
    description: "Ruas jalan menghubungkan Cinanggung ke depan Stasiun KAI Serang"
  },
  {
    id: "E02_14",
    source: "N02",
    target: "N14",
    streetName: "Jl. Lopang Raya",
    oneWay: false,
    geometry: [
      [-6.1118, 106.1632],
      [-6.1100, 106.1628],
      [-6.1082, 106.1620]
    ],
    description: "Jalan tembus utara Cinanggung ke kawasan Lopang"
  },
  {
    id: "E14_03",
    source: "N14",
    target: "N03",
    streetName: "Jl. Raya Serang-Banten Lama",
    oneWay: false,
    geometry: [
      [-6.1082, 106.1620],
      [-6.1095, 106.1602],
      [-6.1110, 106.1591],
      [-6.1124, 106.1586]
    ],
    description: "Ruas jalan penghubung Banten Lama menuju Stasiun Serang"
  },
  {
    id: "E03_04",
    source: "N03",
    target: "N04",
    streetName: "Jl. Ki Tapa Barat / Kotabaru",
    oneWay: false,
    geometry: [
      [-6.1124, 106.1586],
      [-6.1132, 106.1572],
      [-6.1142, 106.1558]
    ],
    description: "Akses dari Stasiun Serang menuju Simpang Calung"
  },
  {
    id: "E03_05",
    source: "N03",
    target: "N05",
    streetName: "Jl. Pasar Lama / Diponegoro",
    oneWay: false,
    geometry: [
      [-6.1124, 106.1586],
      [-6.1138, 106.1580],
      [-6.1152, 106.1574]
    ],
    description: "Akses cepat dari Stasiun Serang menuju Kawasan Niaga Royal"
  },
  {
    id: "E04_07",
    source: "N04",
    target: "N07",
    streetName: "Jl. KH Syam'un Utara",
    oneWay: false,
    geometry: [
      [-6.1142, 106.1558],
      [-6.1154, 106.1548],
      [-6.1167, 106.1537]
    ],
    description: "Arah barat daya dari Calung tembus ke Ramayana dan Alun-Alun"
  },
  {
    id: "E05_06",
    source: "N05",
    target: "N06",
    streetName: "Jl. Sultan Ageng Tirtayasa",
    oneWay: true, // Satu arah ke selatan di kawasan pertokoan Royal Serang
    geometry: [
      [-6.1152, 106.1574],
      [-6.1160, 106.1572],
      [-6.1168, 106.1570]
    ],
    description: "Kawasan pertokoan Royal satu arah menuju Masjid Agung"
  },
  {
    id: "E06_07",
    source: "N06",
    target: "N07",
    streetName: "Jl. Veteran Tengah",
    oneWay: false,
    geometry: [
      [-6.1168, 106.1570],
      [-6.1167, 106.1553],
      [-6.1167, 106.1537]
    ],
    description: "Koridor utama Jl. Veteran dari Masjid Agung ke Ramayana"
  },
  {
    id: "E06_10",
    source: "N06",
    target: "N10",
    streetName: "Jl. Jendral Ahmad Yani",
    oneWay: false,
    geometry: [
      [-6.1168, 106.1570],
      [-6.1188, 106.1581],
      [-6.1215, 106.1592]
    ],
    description: "Jalan protokol Ahmad Yani menghubungkan Masjid Agung ke Simpang Magersari"
  },
  {
    id: "E07_08",
    source: "N07",
    target: "N08",
    streetName: "Jl. Veteran Barat",
    oneWay: false,
    geometry: [
      [-6.1167, 106.1537],
      [-6.1170, 106.1525],
      [-6.1172, 106.1513]
    ],
    description: "Koridor langsung depan Ramayana menuju pintu timur Alun-Alun"
  },
  {
    id: "E08_09",
    source: "N08",
    target: "N09",
    streetName: "Jl. Ki Mas Jong",
    oneWay: false,
    geometry: [
      [-6.1172, 106.1513],
      [-6.1188, 106.1501],
      [-6.1205, 106.1488]
    ],
    description: "Akses sisi barat Alun-Alun menuju Kaujon"
  },
  {
    id: "E09_11",
    source: "N09",
    target: "N11",
    streetName: "Jl. Mayor Syafei / Kebon Jahe",
    oneWay: false,
    geometry: [
      [-6.1205, 106.1488],
      [-6.1228, 106.1528],
      [-6.1245, 106.1575],
      [-6.1258, 106.1615]
    ],
    description: "Jalan melingkar dari Kaujon menembus Simpang Kebon Jahe"
  },
  {
    id: "E10_11",
    source: "N10",
    target: "N11",
    streetName: "Jl. KH Abdul Hadi",
    oneWay: false,
    geometry: [
      [-6.1215, 106.1592],
      [-6.1235, 106.1604],
      [-6.1258, 106.1615]
    ],
    description: "Koridor penghubung Magersari menuju Kebon Jahe"
  },
  {
    id: "E10_13",
    source: "N10",
    target: "N13",
    streetName: "Jl. KH Ahmad Khatib",
    oneWay: false,
    geometry: [
      [-6.1215, 106.1592],
      [-6.1208, 106.1630],
      [-6.1198, 106.1670]
    ],
    description: "Ruas jalan menghubungkan Simpang Magersari ke Sumurpecung/Pisangan"
  },
  {
    id: "E11_12",
    source: "N11",
    target: "N12",
    streetName: "Jl. KH Abdul Fatah Hasan Selatan",
    oneWay: false,
    geometry: [
      [-6.1258, 106.1615],
      [-6.1255, 106.1652],
      [-6.1252, 106.1690]
    ],
    description: "Ruas jalan menghubungkan Kebon Jahe ke Bunderan Ciceri"
  },
  {
    id: "E12_13",
    source: "N12",
    target: "N13",
    streetName: "Jl. KH Abdul Fatah Hasan Timur",
    oneWay: false,
    geometry: [
      [-6.1252, 106.1690],
      [-6.1225, 106.1680],
      [-6.1198, 106.1670]
    ],
    description: "Akses utara dari Ciceri menuju Pisangan / Sumurpecung"
  }
];

// Build edges array: for two-way streets, create reverse edge with inverted geometry!
const processedEdges = [];
let edgeSeq = 1;

for (const raw of rawEdges) {
  const dist = calcPolylineDist(raw.geometry);
  const geojsonId = `road_geom_${edgeSeq++}`;

  // Forward edge
  processedEdges.push({
    id: raw.id,
    source: raw.source,
    target: raw.target,
    weight: dist,
    streetName: raw.streetName,
    oneWay: raw.oneWay,
    geometry: raw.geometry,
    geojsonId,
    description: raw.description
  });

  // If two-way, add reverse edge with reversed geometry
  if (!raw.oneWay) {
    const revGeo = [...raw.geometry].reverse();
    const revDist = calcPolylineDist(revGeo);
    processedEdges.push({
      id: `${raw.id}_REV`,
      source: raw.target,
      target: raw.source,
      weight: revDist,
      streetName: raw.streetName,
      oneWay: false,
      geometry: revGeo,
      geojsonId: `${geojsonId}_rev`,
      description: `${raw.description} (Arah sebaliknya)`
    });
  }
}

// Generate GeoJSON Road Network
const geojsonFeatures = [];
for (const edge of processedEdges) {
  geojsonFeatures.push({
    type: "Feature",
    id: edge.geojsonId,
    properties: {
      edgeId: edge.id,
      source: edge.source,
      target: edge.target,
      streetName: edge.streetName,
      weightKm: edge.weight,
      oneWay: edge.oneWay,
      description: edge.description
    },
    geometry: {
      type: "LineString",
      // Leaflet GeoJSON takes [lng, lat]
      coordinates: edge.geometry.map(([lat, lng]) => [lng, lat])
    }
  });
}

const roadNetworkGeoJSON = {
  type: "FeatureCollection",
  features: geojsonFeatures
};

// Transit Routes (Serang Angkot trayek - clearly labeled)
const transitRoutes = [
  {
    id: "TR-01",
    routeCode: "Angkot 01",
    routeName: "Pasar Rau - Alun-Alun - Cipocok",
    color: "#06b6d4", // Cyan
    vehicleType: "Mikrolet / Angkutan Kota",
    frequencyMin: 5,
    operationalHours: "05:30 - 20:00 WIB",
    description: "Trayek utama pengangkut penumpang dari Pasar Induk Rau melintasi Stasiun, Royal, dan Alun-Alun Serang.",
    isSimulated: true,
    pathNodeIds: ["N01", "N02", "N03", "N05", "N06", "N07", "N08"],
    stops: [
      { stopId: "N01", stopName: "Pasar Induk Rau", order: 1 },
      { stopId: "N02", stopName: "Simpang Cinanggung", order: 2 },
      { stopId: "N03", stopName: "Stasiun Serang", order: 3 },
      { stopId: "N05", stopName: "Royal Serang", order: 4 },
      { stopId: "N06", stopName: "Masjid Agung", order: 5 },
      { stopId: "N07", stopName: "Ramayana Mall", order: 6 },
      { stopId: "N08", stopName: "Alun-Alun Serang", order: 7 }
    ]
  },
  {
    id: "TR-02",
    routeCode: "Angkot 02",
    routeName: "Terminal Pakupatan - Ciceri - Pasar Rau",
    color: "#f59e0b", // Amber
    vehicleType: "Mikrolet / Angkutan Kota",
    frequencyMin: 8,
    operationalHours: "06:00 - 19:30 WIB",
    description: "Trayek feeder dari timur via Ciceri dan Pisangan menuju Pasar Induk Rau.",
    isSimulated: true,
    pathNodeIds: ["N12", "N13", "N01"],
    stops: [
      { stopId: "N12", stopName: "Bunderan Ciceri", order: 1 },
      { stopId: "N13", stopName: "Simpang Pisangan", order: 2 },
      { stopId: "N01", stopName: "Pasar Induk Rau", order: 3 }
    ]
  },
  {
    id: "TR-03",
    routeCode: "Angkot 03",
    routeName: "Ciceri - Kebon Jahe - Alun-Alun",
    color: "#10b981", // Emerald
    vehicleType: "Mikrolet / Angkutan Kota",
    frequencyMin: 10,
    operationalHours: "06:00 - 18:30 WIB",
    description: "Trayek jalur selatan melintasi Kebon Jahe dan Simpang Kaujon menuju Alun-Alun Serang.",
    isSimulated: true,
    pathNodeIds: ["N12", "N11", "N09", "N08"],
    stops: [
      { stopId: "N12", stopName: "Bunderan Ciceri", order: 1 },
      { stopId: "N11", stopName: "Simpang Kebon Jahe", order: 2 },
      { stopId: "N09", stopName: "Simpang Kaujon", order: 3 },
      { stopId: "N08", stopName: "Alun-Alun Serang", order: 4 }
    ]
  },
  {
    id: "TR-04",
    routeCode: "Angkot 04",
    routeName: "Kasemen / Lopang - Stasiun - Alun-Alun",
    color: "#8b5cf6", // Purple
    vehicleType: "Mikrolet / Angkutan Kota",
    frequencyMin: 12,
    operationalHours: "06:00 - 18:00 WIB",
    description: "Trayek akses utara dari Lopang ke Stasiun, Calung, Ramayana, dan Alun-Alun.",
    isSimulated: true,
    pathNodeIds: ["N14", "N03", "N04", "N07", "N08"],
    stops: [
      { stopId: "N14", stopName: "Simpang Lopang", order: 1 },
      { stopId: "N03", stopName: "Stasiun Serang", order: 2 },
      { stopId: "N04", stopName: "Simpang Calung", order: 3 },
      { stopId: "N07", stopName: "Ramayana Mall", order: 4 },
      { stopId: "N08", stopName: "Alun-Alun Serang", order: 5 }
    ]
  }
];

// Passenger Data (Simulated transit demand distribution)
const passengerData = [
  {
    nodeId: "N01",
    dailyBoarding: 3420,
    dailyAlighting: 2980,
    peakHours: "06:30 - 08:30 & 16:30 - 18:30",
    densityLevel: "High",
    congestionIndex: 0.88,
    notes: "Aktivitas bongkar muat komoditas pasar dan penumpang komuter harian"
  },
  {
    nodeId: "N02",
    dailyBoarding: 780,
    dailyAlighting: 820,
    peakHours: "07:00 - 08:30 & 16:00 - 17:30",
    densityLevel: "Medium",
    congestionIndex: 0.54,
    notes: "Titik perpindahan penumpang angkot ke becak dan ojek lokal"
  },
  {
    nodeId: "N03",
    dailyBoarding: 2850,
    dailyAlighting: 3100,
    peakHours: "06:00 - 08:00 & 17:00 - 19:30",
    densityLevel: "High",
    congestionIndex: 0.82,
    notes: "Simpul antarmoda kereta api Commuter Rangkasbitung-Merak dan angkot"
  },
  {
    nodeId: "N04",
    dailyBoarding: 450,
    dailyAlighting: 510,
    peakHours: "07:00 - 08:00 & 16:30 - 17:30",
    densityLevel: "Low",
    congestionIndex: 0.35,
    notes: "Kawasan residensial dan sekolah Lontarbaru"
  },
  {
    nodeId: "N05",
    dailyBoarding: 2100,
    dailyAlighting: 2450,
    peakHours: "15:00 - 20:30",
    densityLevel: "High",
    congestionIndex: 0.79,
    notes: "Aktivitas belanja niaga malam di koridor Royal"
  },
  {
    nodeId: "N06",
    dailyBoarding: 920,
    dailyAlighting: 980,
    peakHours: "11:45 - 13:00 & 18:00 - 19:30",
    densityLevel: "Medium",
    congestionIndex: 0.60,
    notes: "Pusat ibadah dan kegiatan keagamaan Kota Serang"
  },
  {
    nodeId: "N07",
    dailyBoarding: 2200,
    dailyAlighting: 2350,
    peakHours: "15:30 - 20:00",
    densityLevel: "High",
    congestionIndex: 0.76,
    notes: "Pengunjung mall dan pusat ritel pakaian"
  },
  {
    nodeId: "N08",
    dailyBoarding: 3600,
    dailyAlighting: 3500,
    peakHours: "16:00 - 21:00",
    densityLevel: "High",
    congestionIndex: 0.85,
    notes: "Pusat rekreasi, kuliner, dan interkoneksi transit warga Serang"
  },
  {
    nodeId: "N09",
    dailyBoarding: 580,
    dailyAlighting: 620,
    peakHours: "07:00 - 08:30 & 16:30 - 17:30",
    densityLevel: "Low",
    congestionIndex: 0.38,
    notes: "Persimpangan pemukiman Kaujon"
  },
  {
    nodeId: "N10",
    dailyBoarding: 1100,
    dailyAlighting: 1050,
    peakHours: "07:00 - 08:30 & 16:30 - 18:00",
    densityLevel: "Medium",
    congestionIndex: 0.58,
    notes: "Persimpangan arteri utama Ahmad Yani"
  },
  {
    nodeId: "N11",
    dailyBoarding: 950,
    dailyAlighting: 910,
    peakHours: "07:00 - 08:30 & 16:30 - 18:00",
    densityLevel: "Medium",
    congestionIndex: 0.52,
    notes: "Kawasan komersial lokal Kebon Jahe"
  },
  {
    nodeId: "N12",
    dailyBoarding: 2600,
    dailyAlighting: 2450,
    peakHours: "06:30 - 08:30 & 16:30 - 19:00",
    densityLevel: "High",
    congestionIndex: 0.81,
    notes: "Pintu gerbang timur Kota Serang menuju tol dan kampus"
  },
  {
    nodeId: "N13",
    dailyBoarding: 1020,
    dailyAlighting: 990,
    peakHours: "07:00 - 08:30 & 16:30 - 18:00",
    densityLevel: "Medium",
    congestionIndex: 0.55,
    notes: "Persimpangan penghubung timur ke Pasar Rau"
  },
  {
    nodeId: "N14",
    dailyBoarding: 640,
    dailyAlighting: 610,
    peakHours: "06:30 - 08:00 & 16:00 - 17:30",
    densityLevel: "Low",
    congestionIndex: 0.40,
    notes: "Kawasan pemukiman Lopang Indah arah Banten Lama"
  }
];

// Enrich nodes with passenger info
const enrichedNodes = nodes.map(n => {
  const p = passengerData.find(pd => pd.nodeId === n.id);
  return {
    ...n,
    passengerInfo: p || null
  };
});

// Output paths
const targetDir = path.resolve('src/data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync(path.join(targetDir, 'nodes.json'), JSON.stringify(enrichedNodes, null, 2), 'utf-8');
fs.writeFileSync(path.join(targetDir, 'edges.json'), JSON.stringify(processedEdges, null, 2), 'utf-8');
fs.writeFileSync(path.join(targetDir, 'road-network.geojson'), JSON.stringify(roadNetworkGeoJSON, null, 2), 'utf-8');
fs.writeFileSync(path.join(targetDir, 'transit-routes.json'), JSON.stringify(transitRoutes, null, 2), 'utf-8');
fs.writeFileSync(path.join(targetDir, 'passenger-data.json'), JSON.stringify(passengerData, null, 2), 'utf-8');

console.log('Successfully generated dataset:');
console.log(`- Nodes: ${enrichedNodes.length}`);
console.log(`- Edges (Directed & 2-Way): ${processedEdges.length}`);
console.log(`- GeoJSON Features: ${geojsonFeatures.length}`);
console.log(`- Transit Routes: ${transitRoutes.length}`);
console.log(`- Passenger Data points: ${passengerData.length}`);
