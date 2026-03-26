// Countries to Cities mapping for signup form
export const COUNTRIES_CITIES: Record<string, string[]> = {
  "United States": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego",
    "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco",
    "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Detroit", "Nashville",
    "Portland", "Oklahoma City", "Las Vegas", "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque"
  ],
  "United Kingdom": [
    "London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol",
    "Cardiff", "Belfast", "Newcastle", "Sheffield", "Nottingham", "Leicester", "Coventry", "Bradford",
    "Stoke-on-Trent", "Wolverhampton", "Plymouth", "Derby", "Southampton", "Reading", "Northampton", "Luton"
  ],
  "Canada": [
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City",
    "Hamilton", "Kitchener", "London", "Victoria", "Halifax", "Oshawa", "Windsor", "Saskatoon",
    "Regina", "Sherbrooke", "St. John's", "Barrie", "Kelowna", "Abbotsford", "Sudbury", "Kingston"
  ],
  "Australia": [
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra",
    "Sunshine Coast", "Wollongong", "Hobart", "Geelong", "Townsville", "Cairns", "Darwin", "Toowoomba",
    "Ballarat", "Bendigo", "Albury", "Launceston", "Mackay", "Rockhampton", "Bunbury", "Coffs Harbour"
  ],
  "Germany": [
    "Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund",
    "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nuremberg", "Duisburg", "Bochum",
    "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden"
  ],
  "France": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier",
    "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble",
    "Dijon", "Angers", "Nîmes", "Villeurbanne", "Saint-Denis", "Le Mans", "Aix-en-Provence", "Clermont-Ferrand"
  ],
  "Italy": [
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence",
    "Bari", "Catania", "Venice", "Verona", "Messina", "Padua", "Trieste", "Brescia",
    "Parma", "Taranto", "Prato", "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno"
  ],
  "Spain": [
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma",
    "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Hospitalet",
    "Granada", "Vitoria", "A Coruña", "Elche", "Santa Cruz", "Oviedo", "Móstoles", "Cartagena"
  ],
  "Netherlands": [
    "Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere",
    "Breda", "Nijmegen", "Enschede", "Haarlem", "Arnhem", "Zaanstad", "Amersfoort", "Apeldoorn",
    "'s-Hertogenbosch", "Hoofddorp", "Maastricht", "Leiden", "Dordrecht", "Zoetermeer", "Zwolle", "Deventer"
  ],
  "Belgium": [
    "Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven",
    "Mons", "Aalst", "Mechelen", "La Louvière", "Kortrijk", "Hasselt", "Ostend", "Sint-Niklaas",
    "Tournai", "Genk", "Seraing", "Roeselare", "Verviers", "Mouscron", "Beveren", "Dendermonde"
  ],
  "Switzerland": [
    "Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne", "St. Gallen",
    "Lugano", "Biel", "Thun", "Köniz", "La Chaux-de-Fonds", "Schaffhausen", "Fribourg", "Chur",
    "Neuchâtel", "Vernier", "Uster", "Sion", "Rapperswil-Jona", "Zug", "Yverdon-les-Bains", "Dübendorf"
  ],
  "Austria": [
    "Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels",
    "Sankt Pölten", "Dornbirn", "Steyr", "Wiener Neustadt", "Feldkirch", "Bregenz", "Leonding", "Klosterneuburg",
    "Baden", "Wolfsberg", "Leoben", "Krems", "Traun", "Amstetten", "Kapfenberg", "Hallein"
  ],
  "Sweden": [
    "Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg",
    "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås", "Södertälje", "Eskilstuna",
    "Halmstad", "Växjö", "Karlstad", "Sundsvall", "Östersund", "Trollhättan", "Luleå", "Borlänge"
  ],
  "Norway": [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Bærum", "Kristiansand", "Fredrikstad", "Sandnes",
    "Tromsø", "Sarpsborg", "Skien", "Ålesund", "Sandefjord", "Haugesund", "Tønsberg", "Moss",
    "Porsgrunn", "Bodø", "Arendal", "Hamar", "Ytrebygda", "Larvik", "Halden", "Lillehammer"
  ],
  "Denmark": [
    "Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens",
    "Vejle", "Roskilde", "Herning", "Hørsholm", "Helsingør", "Silkeborg", "Næstved", "Fredericia",
    "Viborg", "Køge", "Holstebro", "Taastrup", "Sønderborg", "Svendborg", "Hjørring", "Elsinore"
  ],
  "Finland": [
    "Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti",
    "Kuopio", "Pori", "Kouvola", "Joensuu", "Lappeenranta", "Hämeenlinna", "Vaasa", "Seinäjoki",
    "Rovaniemi", "Mikkeli", "Kotka", "Salo", "Porvoo", "Lohja", "Hyvinkää", "Nurmijärvi"
  ],
  "Poland": [
    "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz",
    "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa", "Radom", "Sosnowiec", "Toruń",
    "Kielce", "Gliwice", "Zabrze", "Bytom", "Olsztyn", "Bielsko-Biała", "Rzeszów", "Ruda Śląska"
  ],
  "Portugal": [
    "Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal", "Coimbra", "Setúbal",
    "Almada", "Agualva-Cacém", "Queluz", "Rio de Mouro", "Barreiro", "Aveiro", "Corroios", "Leiria",
    "Faro", "Évora", "Viseu", "Guimarães", "Matosinhos", "Vila Franca de Xira", "Odivelas", "Gondomar"
  ],
  "Greece": [
    "Athens", "Thessaloniki", "Patras", "Piraeus", "Larissa", "Heraklion", "Peristeri", "Kallithea",
    "Acharnes", "Kalamaria", "Nikaia", "Glyfada", "Volos", "Ilio", "Ilioupoli", "Keratsini",
    "Evosmos", "Chalandri", "Nea Smyrni", "Marousi", "Agios Dimitrios", "Zografou", "Egaleo", "Nea Ionia"
  ],
  "Ireland": [
    "Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords",
    "Bray", "Navan", "Ennis", "Kilkenny", "Carlow", "Tralee", "Newbridge", "Naas",
    "Athlone", "Portlaoise", "Mullingar", "Wexford", "Sligo", "Clonmel", "Carrick-on-Shannon", "Letterkenny"
  ],
  "Japan": [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kawasaki",
    "Kyoto", "Saitama", "Hiroshima", "Sendai", "Chiba", "Kitakyushu", "Sakai", "Niigata",
    "Hamamatsu", "Shizuoka", "Okayama", "Kumamoto", "Kagoshima", "Hachioji", "Utsunomiya", "Matsuyama"
  ],
  "China": [
    "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Xi'an",
    "Nanjing", "Tianjin", "Suzhou", "Chongqing", "Dongguan", "Foshan", "Jinan", "Zhengzhou",
    "Dalian", "Qingdao", "Kunming", "Changsha", "Shenyang", "Xiamen", "Harbin", "Ningbo"
  ],
  "India": [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat",
    "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
    "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik"
  ],
  "South Korea": [
    "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan",
    "Changwon", "Goyang", "Yongin", "Seongnam", "Bucheon", "Ansan", "Anyang", "Jeonju",
    "Cheonan", "Namyangju", "Hwaseong", "Gimhae", "Pyeongtaek", "Jinju", "Iksan", "Yangsan"
  ],
  "Singapore": [
    "Singapore"
  ],
  "Malaysia": [
    "Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya", "Subang Jaya", "Johor Bahru", "Kota Kinabalu",
    "Kuching", "Kajang", "Seremban", "Klang", "Ampang", "Kota Bharu", "Alor Setar", "Miri",
    "Taiping", "Sungai Petani", "Kuantan", "Tawau", "Sandakan", "Kuala Terengganu", "Putrajaya", "Labuan"
  ],
  "Thailand": [
    "Bangkok", "Nonthaburi", "Nakhon Ratchasima", "Chiang Mai", "Hat Yai", "Udon Thani", "Pak Kret", "Khon Kaen",
    "Chaophraya Surasak", "Nakhon Si Thammarat", "Phuket", "Pattaya", "Songkhla", "Samut Prakan", "Rayong", "Lampang",
    "Surat Thani", "Ratchaburi", "Nakhon Pathom", "Phitsanulok", "Chon Buri", "Yala", "Trang", "Phra Nakhon Si Ayutthaya"
  ],
  "Indonesia": [
    "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Palembang", "Makassar", "Tangerang",
    "Depok", "South Tangerang", "Bekasi", "Batam", "Padang", "Denpasar", "Bandar Lampung", "Pekanbaru",
    "Malang", "Yogyakarta", "Pontianak", "Manado", "Balikpapan", "Jambi", "Cimahi", "Ambon"
  ],
  "Philippines": [
    "Manila", "Quezon City", "Caloocan", "Davao City", "Cebu City", "Zamboanga City", "Antipolo", "Pasig",
    "Cagayan de Oro", "Parañaque", "Valenzuela", "Las Piñas", "Makati", "Bacolod", "General Santos", "Mandaluyong",
    "Muntinlupa", "Marikina", "San Jose del Monte", "Bacoor", "Calamba", "Iloilo City", "Butuan", "Mandaue"
  ],
  "Vietnam": [
    "Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Can Tho", "Bien Hoa", "Hue", "Nha Trang",
    "Vung Tau", "Quy Nhon", "Rach Gia", "Long Xuyen", "My Tho", "Cam Ranh", "Thai Nguyen", "Pleiku",
    "Buon Ma Thuot", "Ca Mau", "Nam Dinh", "Vinh", "Thanh Hoa", "Phan Thiet", "Cam Pha", "Soc Trang"
  ],
  "Hong Kong": [
    "Hong Kong", "Kowloon", "New Territories", "Tsuen Wan", "Yuen Long", "Tuen Mun", "Tai Po", "Sha Tin",
    "Fanling", "Tung Chung", "Ma On Shan", "Tin Shui Wai", "Tseung Kwan O", "Kwun Tong", "Sham Shui Po", "Wong Tai Sin"
  ],
  "Taiwan": [
    "Taipei", "New Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu", "Keelung", "Taoyuan",
    "Chiayi", "Changhua", "Pingtung", "Miaoli", "Yilan", "Hualien", "Taitung", "Nantou",
    "Yunlin", "Chiayi County", "Hsinchu County", "Penghu", "Kinmen", "Lienchiang", "Hsinchu City", "Chiayi City"
  ],
  "New Zealand": [
    "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier-Hastings", "Dunedin", "Palmerston North",
    "Rotorua", "New Plymouth", "Whangarei", "Invercargill", "Nelson", "Hastings", "Gisborne", "Timaru",
    "Blenheim", "Taupo", "Masterton", "Whanganui", "Pukekohe", "Cambridge", "Levin", "Ashburton"
  ],
  "South Africa": [
    "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Polokwane",
    "Nelspruit", "Kimberley", "Rustenburg", "Welkom", "Pietermaritzburg", "Boksburg", "Benoni", "Vereeniging",
    "Soweto", "Tembisa", "Uitenhage", "Brakpan", "Klerksdorp", "George", "Midrand", "Centurion"
  ],
  "Brazil": [
    "São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba",
    "Recife", "Porto Alegre", "Belém", "Goiânia", "Guarulhos", "Campinas", "São Luís", "São Gonçalo",
    "Maceió", "Duque de Caxias", "Natal", "Teresina", "Campo Grande", "Nova Iguaçu", "São Bernardo do Campo", "João Pessoa"
  ],
  "Mexico": [
    "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Torreón",
    "Querétaro", "San Luis Potosí", "Mérida", "Mexicali", "Aguascalientes", "Tlalnepantla", "Chihuahua", "Naucalpan",
    "Cancún", "Saltillo", "Hermosillo", "Culiacán", "Reynosa", "Morelia", "Toluca", "Villahermosa"
  ],
  "Argentina": [
    "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Salta",
    "Santa Fe", "San Juan", "Resistencia", "Santiago del Estero", "Corrientes", "Bahía Blanca", "Posadas", "Paraná",
    "Neuquén", "Formosa", "San Salvador de Jujuy", "La Rioja", "Río Cuarto", "Comodoro Rivadavia", "San Luis", "Catamarca"
  ],
  "Chile": [
    "Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Talca",
    "Arica", "Iquique", "Puerto Montt", "Valdivia", "Calama", "Chillán", "Osorno", "Copiapó",
    "Los Ángeles", "Punta Arenas", "Curicó", "Villa Alemana", "Coronel", "San Antonio", "Chañaral", "Linares"
  ],
  "Colombia": [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira",
    "Santa Marta", "Ibagué", "Pasto", "Manizales", "Neiva", "Villavicencio", "Armenia", "Valledupar",
    "Montería", "Sincelejo", "Popayán", "Buenaventura", "Palmira", "Tunja", "Riohacha", "Quibdó"
  ],
  "Peru": [
    "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote",
    "Huancayo", "Pucallpa", "Tacna", "Ica", "Juliaca", "Sullana", "Chincha Alta", "Cajamarca",
    "Puno", "Ayacucho", "Huánuco", "Tarapoto", "Pisco", "Tumbes", "Huaraz", "Moyobamba"
  ],
  "United Arab Emirates": [
    "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
  ],
  "Saudi Arabia": [
    "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Taif", "Buraydah",
    "Khamis Mushait", "Hail", "Hofuf", "Mubarraz", "Al-Kharj", "Tabuk", "Buraidah", "Jubail",
    "Najran", "Al Qatif", "Yanbu", "Abha", "Arar", "Sakakah", "Jizan", "Dhahran"
  ],
  "Israel": [
    "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beer Sheva",
    "Holon", "Bnei Brak", "Ramat Gan", "Rehovot", "Bat Yam", "Ashkelon", "Herzliya", "Kfar Saba",
    "Hadera", "Modi'in", "Raanana", "Nazareth", "Lod", "Ramla", "Givatayim", "Eilat"
  ],
  "Turkey": [
    "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya",
    "Mersin", "Diyarbakır", "Kayseri", "Eskişehir", "Urfa", "Malatya", "Erzurum", "Van",
    "Batman", "Elazığ", "Denizli", "Samsun", "Kahramanmaraş", "Mardin", "Şanlıurfa", "Trabzon"
  ],
  "Russia": [
    "Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Omsk",
    "Samara", "Rostov-on-Don", "Ufa", "Krasnoyarsk", "Voronezh", "Perm", "Volgograd", "Krasnodar",
    "Saratov", "Tyumen", "Tolyatti", "Izhevsk", "Barnaul", "Ulyanovsk", "Irkutsk", "Khabarovsk"
  ],
  "Ukraine": [
    "Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Zaporizhzhia", "Lviv", "Kryvyi Rih",
    "Mykolaiv", "Mariupol", "Luhansk", "Sevastopol", "Vinnytsia", "Makiivka", "Simferopol", "Kherson",
    "Poltava", "Chernihiv", "Cherkasy", "Sumy", "Zhytomyr", "Khmelnytskyi", "Rivne", "Ivano-Frankivsk"
  ],
  "Egypt": [
    "Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan",
    "Asyut", "Ismailia", "Faiyum", "Zagazig", "Damietta", "Mansoura", "Tanta", "Minya",
    "Beni Suef", "Qena", "Sohag", "Hurghada", "Damanhur", "Kafr el-Sheikh", "Arish", "Benha"
  ],
  "Nigeria": [
    "Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Kaduna", "Maiduguri",
    "Zaria", "Aba", "Jos", "Ilorin", "Oyo", "Abeokuta", "Onitsha", "Warri",
    "Enugu", "Calabar", "Akure", "Osogbo", "Sokoto", "Katsina", "Bauchi", "Gombe"
  ],
  "Kenya": [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale",
    "Garissa", "Kakamega", "Nyeri", "Meru", "Machakos", "Embu", "Narok", "Kericho",
    "Lodwar", "Wajir", "Isiolo", "Marsabit", "Lamu", "Kilifi", "Voi", "Homa Bay"
  ],
  "Other": [
    "Other"
  ]
};

// Get cities for a specific country
export function getCitiesForCountry(country: string): string[] {
  return COUNTRIES_CITIES[country] || ["Other"];
}

// Get all countries
export function getAllCountries(): string[] {
  return Object.keys(COUNTRIES_CITIES);
}

