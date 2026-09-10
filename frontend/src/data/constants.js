import React from 'react';
import { Apple, Wheat, Citrus } from 'lucide-react';

export const CROPS = ['tomato', 'maize', 'pineapple'];

export const REGIONS_DISTRICTS = {
  'Ahafo': [
    'Asunafo North', 'Asunafo South', 'Asutifi North', 'Asutifi South',
    'Tano North', 'Tano South',
  ],
  'Ashanti': [
    'Adansi Asokwa', 'Adansi North', 'Adansi South', 'Afigya Kwabre North',
    'Afigya Kwabre South', 'Ahafo Ano North', 'Ahafo Ano South East',
    'Ahafo Ano South West', 'Amansie Central', 'Amansie South', 'Amansie West',
    'Asante Akim Central', 'Asante Akim North', 'Asante Akim South',
    'Asokore Mampong', 'Bekwai', 'Bosome Freho', 'Bosomtwe',
    'Ejisu', 'Ejura Sekyedumase', 'Juaben', 'Kumasi',
    'Kwabre East', 'Kwanwoma', 'Mampong', 'Obuasi East', 'Obuasi',
    'Offinso North', 'Offinso South', 'Sekyere Afram Plains',
    'Sekyere Central', 'Sekyere East', 'Sekyere Kumawu', 'Sekyere South',
  ],
  'Bono': [
    'Banda', 'Berekum East', 'Berekum West', 'Dormaa Central',
    'Dormaa East', 'Dormaa West', 'Jaman North', 'Jaman South',
    'Sunyani', 'Sunyani West', 'Tain', 'Wenchi',
  ],
  'Bono East': [
    'Atebubu Amantin', 'Kintampo North', 'Kintampo South',
    'Nkoranza North', 'Nkoranza South', 'Pru East', 'Pru West',
    'Sene East', 'Sene West', 'Techiman', 'Techiman North',
  ],
  'Central': [
    'Abura Asebu Kwamankese', 'Agona East', 'Agona West',
    'Ajumako Enyan Essiam', 'Asikuma Odoben Brakwa', 'Assin Central',
    'Assin North', 'Assin South', 'Awutu Senya East', 'Awutu Senya',
    'Cape Coast', 'Effutu', 'Ekumfi', 'Gomoa Central', 'Gomoa East',
    'Gomoa West', 'Hemang Lower Denkyira', 'Komenda Edina Eguafo Abrem',
    'Mfantsiman', 'Twifo Atti Morkwa', 'Twifo Hemang Lower Denkyira',
    'Upper Denkyira East', 'Upper Denkyira West',
  ],
  'Eastern': [
    'Abuakwa North', 'Abuakwa South', 'Achiase', 'Akuapem North',
    'Akuapem South', 'Akyemansa', 'Asene Manso Akroso', 'Atiwa East',
    'Atiwa West', 'Ayensuano', 'Birim Central', 'Birim North',
    'Birim South', 'Denkyembuor', 'Fanteakwa North', 'Fanteakwa South',
    'Kwaebibirem', 'Kwahu Afram Plains North', 'Kwahu Afram Plains South',
    'Kwahu East', 'Kwahu South', 'Kwahu West', 'Lower Manya Krobo',
    'New Juaben North', 'New Juaben South', 'Nsawam Adoagyiri',
    'Okere', 'Suhum', 'Upper Manya Krobo', 'Upper West Akim',
    'West Akim', 'Yilo Krobo',
  ],
  'Greater Accra': [
    'Ablekuma Central', 'Ablekuma North', 'Ablekuma West',
    'Accra', 'Ada East', 'Ada West', 'Adenta', 'Ashaiman',
    'Ayawaso Central', 'Ayawaso East', 'Ayawaso North', 'Ayawaso West Wuogon',
    'Ga Central', 'Ga East', 'Ga North', 'Ga South', 'Ga West',
    'Korle Klottey', 'Kpone Katamanso', 'Krowor', 'La Dade Kotopon',
    'La Nkwantanang Madina', 'Ledzokuku', 'Ningo Prampram',
    'Okaikwei North', 'Shai Osudoku', 'Tema', 'Tema West', 'Weija Gbawe',
  ],
  'North East': [
    'Bunkpurugu Nakpayili', 'Chereponi', 'East Mamprusi',
    'Mamprugu Moaduri', 'Nalerigu Gambaga', 'West Mamprusi',
  ],
  'Northern': [
    'Gushegu', 'Karaga', 'Kpandai', 'Kumbungu', 'Mion', 'Nanton',
    'Nanumba North', 'Nanumba South', 'Saboba', 'Savelugu',
    'Tamale', 'Tatale Sanguli', 'Tolon', 'Yendi', 'Zabzugu',
  ],
  'Oti': [
    'Biakoye', 'Guan', 'Jasikan', 'Kadjebi', 'Krachi East',
    'Krachi Nchumuru', 'Krachi West', 'Nkwanta North', 'Nkwanta South',
  ],
  'Savannah': [
    'Bole', 'Central Gonja', 'East Gonja', 'North East Gonja',
    'North Gonja', 'Sawla Tuna Kalba', 'West Gonja',
  ],
  'Upper East': [
    'Bawku', 'Bawku West', 'Binduri', 'Bolgatanga', 'Bolgatanga East',
    'Bongo', 'Builsa North', 'Builsa South', 'Garu', 'Kassena Nankana East',
    'Kassena Nankana West', 'Nabdam', 'Pusiga', 'Talensi', 'Tempane',
  ],
  'Upper West': [
    'Daffiama Bussie Issa', 'Jirapa', 'Lambussie Karni', 'Lawra',
    'Nadowli Kaleo', 'Nandom', 'Sisala East', 'Sisala West',
    'Wa', 'Wa East', 'Wa West',
  ],
  'Volta': [
    'Adaklu', 'Afadzato South', 'Agotime Ziope', 'Akatsi North',
    'Akatsi South', 'Anloga', 'Central Tongu', 'Ho', 'Ho West',
    'Hohoe', 'Keta', 'Ketu North', 'Ketu South', 'Kpando',
    'North Dayi', 'North Tongu', 'South Dayi', 'South Tongu',
  ],
  'Western': [
    'Ahanta West', 'Amenfi Central', 'Amenfi East', 'Amenfi West',
    'Effia Kwesimintsim', 'Ellembelle', 'Jomoro', 'Mpohor',
    'Nzema East', 'Prestea Huni Valley', 'Sekondi Takoradi',
    'Shama', 'Tarkwa Nsuaem', 'Wassa Amenfi East', 'Wassa East',
  ],
  'Western North': [
    'Aowin', 'Bia East', 'Bia West', 'Bibiani Anhwiaso Bekwai',
    'Bodi', 'Juaboso', 'Sefwi Akontombra', 'Sefwi Wiawso', 'Suaman',
  ],
};

export const REGIONS = Object.keys(REGIONS_DISTRICTS).sort();



export const DISEASE_CONDITIONS = {
  tomato: [
    {
      id: 'tomato_healthy',
      label: 'Healthy',
      severity: 'none',
      color: 'accent',
      description: 'No visible symptoms. Plant appears healthy.',
      recommendation: 'Continue standard agronomic practices. Monitor weekly.',
    },
    {
      id: 'tomato_late_blight',
      label: 'Late Blight',
      pathogen: 'Phytophthora infestans',
      severity: 'high',
      color: 'danger',
      description: 'Water-soaked lesions on leaves, dark brown patches with white sporulation on underside.',
      recommendation: 'Apply copper-based fungicide (e.g. Copper Oxychloride 50% WP at 2.5 g/L water) immediately. Remove and destroy all heavily infected plant material. Avoid overhead irrigation. Re-apply every 7 days until symptom progression stops. Do not harvest within 7 days of application.',
    },
    {
      id: 'tomato_leaf_curl',
      label: 'Leaf Curl Virus',
      pathogen: 'Tomato Leaf Curl Virus (ToLCV)',
      severity: 'high',
      color: 'danger',
      description: 'Upward curling and yellowing of young leaves, stunted growth, reduced fruit set.',
      recommendation: 'There is no cure for viral infections. Remove and destroy infected plants immediately to prevent spread. Control whitefly vectors using Imidacloprid 200 SL (0.5 mL/L) or yellow sticky traps. Plant resistant varieties in subsequent seasons.',
    },
    {
      id: 'tomato_septoria',
      label: 'Septoria Leaf Spot',
      pathogen: 'Septoria lycopersici',
      severity: 'medium',
      color: 'amber',
      description: 'Small circular spots with dark brown borders and lighter grey centres on lower leaves.',
      recommendation: 'Apply Mancozeb 80% WP (2.0 g/L) or Chlorothalonil 75% WP (1.5 g/L). Remove affected lower leaves. Ensure good air circulation. Apply at first sign of disease and repeat every 10 days in humid conditions.',
    },
    {
      id: 'tomato_bacterial_spot',
      label: 'Bacterial Spot',
      pathogen: 'Xanthomonas vesicatoria',
      severity: 'medium',
      color: 'amber',
      description: 'Irregular water-soaked spots on leaves that turn brown; raised, scab-like spots on fruit.',
      recommendation: 'Apply Copper Hydroxide 77% WP (2.0 g/L) preventatively. Avoid working in fields when wet. Practise crop rotation. Remove crop debris after harvest.',
    },
  ],
  maize: [
    {
      id: 'maize_healthy',
      label: 'Healthy',
      severity: 'none',
      color: 'accent',
      description: 'No visible symptoms. Crop growing normally.',
      recommendation: 'Continue standard practices. Side-dress with nitrogen fertiliser at knee-height stage if growth appears slow.',
    },
    {
      id: 'maize_fall_armyworm',
      label: 'Fall Armyworm',
      pathogen: 'Spodoptera frugiperda',
      severity: 'high',
      color: 'danger',
      description: 'Ragged holes in leaves, frass deposits in leaf whorls, caterpillars visible in whorls.',
      recommendation: 'Apply Emamectin benzoate 1.9% EC (0.5 mL/L) or Chlorpyrifos 40% EC (2.0 mL/L) directly into the whorl. Scout fields twice weekly. Apply in the early morning or late evening. Biological control with Bacillus thuringiensis (Bt) products (e.g. DiPel DF at 1 g/L) is recommended where available. Protect natural enemies (avoid broad-spectrum pesticides).',
    },
    {
      id: 'maize_northern_blight',
      label: 'Northern Leaf Blight',
      pathogen: 'Exserohilum turcicum',
      severity: 'medium',
      color: 'amber',
      description: 'Long, cigar-shaped tan to grey lesions on leaves, typically starting on lower leaves.',
      recommendation: 'Apply Propiconazole 25% EC (0.5 mL/L) or Mancozeb 80% WP (2.5 g/L). Improve field drainage. Plant resistant hybrid varieties in future seasons. Crop rotation recommended.',
    },
    {
      id: 'maize_common_rust',
      label: 'Common Rust',
      pathogen: 'Puccinia sorghi',
      severity: 'medium',
      color: 'amber',
      description: 'Small, circular to elongate powdery pustules on both upper and lower leaf surfaces, reddish-brown to dark brown in colour.',
      recommendation: 'Apply Mancozeb 80% WP (2.5 g/L) or Azoxystrobin 25% SC (0.75 mL/L) at first symptom appearance. Plant resistant hybrids in future seasons. Avoid high plant densities in humid areas.',
    },
    {
      id: 'maize_grey_leaf_spot',
      label: 'Gray Leaf Spot',
      pathogen: 'Cercospora zeae-maydis',
      severity: 'medium',
      color: 'amber',
      description: 'Rectangular, greyish lesions bounded by leaf veins, often with yellow halo.',
      recommendation: 'Apply Azoxystrobin 25% SC (0.75 mL/L) at silking stage. Ensure adequate plant spacing for air circulation. Remove crop residues after harvest. Rotate with non-host crops such as legumes.',
    },
  ],
  pineapple: [
    {
      id: 'pineapple_healthy',
      label: 'Healthy',
      severity: 'none',
      color: 'accent',
      description: 'Normal green colouration, no wilting or discolouration.',
      recommendation: 'Maintain soil pH between 4.5 and 6.5. Apply balanced fertiliser every 6–8 weeks. Mulch to retain moisture.',
    },
    {
      id: 'pineapple_mealybug_wilt',
      label: 'Mealybug Wilt',
      pathogen: 'Pineapple Mealybug Wilt-associated Virus (PMWaV)',
      severity: 'high',
      color: 'danger',
      description: 'Reddish or pinkish leaf margins, progressive wilting from leaf tip, plant collapse in severe cases.',
      recommendation: 'Control mealybug vectors with Chlorpyrifos 40% EC drenched at the base (2 mL/L). Control ant populations that protect mealybugs. Use clean planting material from certified sources in future planting cycles. Remove and destroy severely wilted plants.',
    },
    {
      id: 'pineapple_heart_rot',
      label: 'Heart Rot',
      pathogen: 'Phytophthora parasitica / Phytophthora cinnamomi',
      severity: 'high',
      color: 'danger',
      description: 'Yellowing and easy pull-out of central leaves, foul smell at plant base, internal rotting.',
      recommendation: 'Improve field drainage immediately. Apply Metalaxyl-M 4% + Mancozeb 64% WP (2.5 g/L) as a preventative drench on healthy plants near affected areas. Remove and destroy infected plants. Avoid wounding planting material. Do not replant in affected beds without soil fumigation.',
    },
  ],
};

export const CROP_ICONS = {
  tomato: React.createElement(Apple, { size: 24 }),
  maize: React.createElement(Wheat, { size: 24 }),
  pineapple: React.createElement(Citrus, { size: 24 }),
};

export const CROP_COLORS = {
  tomato:    { primary: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  maize:     { primary: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  pineapple: { primary: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
};

export const SEVERITY_COLORS = {
  none:   { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};
