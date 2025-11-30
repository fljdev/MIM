// Mock Venue Data for Backend - Generated from Google Places API
// Generated: 2025-11-19T17:43:56.862Z
// Total venues: 254

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get speed in km/h based on transit mode (case-insensitive)
function getSpeedForMode(mode) {
  const SPEEDS = {
    'walking': 5,
    'bicycling': 15,
    'transit': 25,
    'driving': 40
  };
  return SPEEDS[mode?.toLowerCase()] || SPEEDS['driving'];
}

// Dublin venues - 254 venues from Google Places API
const MOCK_VENUES = [
  {
    "id": "venue_79",
    "name": "Mister Magpie Coffee (Merrion Cricket Club)",
    "address": "51 Anglesea Road, Ballsbridge, Dublin 4",
    "latitude": 53.32425079999999,
    "longitude": -6.2306402,
    "rating": 5,
    "reviewCount": 8,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4VqWFnDeJHeo85W-D7l5mG4StIV6EmZHR2HslCV48Yp3kxJDGTmDQa15P0TW6xsiDM9wr3waUhZVrYeeSItvfSXobEhuOrZtLaXFtOViIg0Qel9l-e6qCaeZphIqTTWaT2S1538K1XFHlAwl1I6Wd50kyHTrJthza9Lzq2H4zsTYG49j5UmFCHt-WLvJ9FudXobBT6ixTlkkK64hod7TNOQukKHRUY7s9Sv5iX2L1f-pFezCUxGyZts3DfPKOMw8184Is76fm-nUl_yXrmuM4fCCxGvshE7OMpmygqPKHTaaoGn7McY5IAaVme3I29CY4E2_to2SA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_141",
    "name": "Creed Coffee Roasters Rathmines",
    "address": "Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.3253462,
    "longitude": -6.2652956,
    "rating": 5,
    "reviewCount": 17,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4tR0YHBBbbjLQTEN3WHFCt3tY_xfbnAwnDBCkY0dOn-qVIT3eAvnxhZ3WCNjTnbiJptids3D88YcTiWNb3mIUuLNZKr7ZnDRix6RFMM_NJfJV4UrGK1uTNK_S5vXsJoCwD6jgY3obXw_n3rm7eIj-3a6EcPxIS1jiPw6JRzI7V_sMne58sJEdZubbXPhLuwZSrpr1VBREA-UqozN_NRKPrGDZrhvZDpzg6EbKZOROgyPH9baoGHZ8xqqRSzyNyJDw6xUjYhy0LobUTi9O5dfpFYSgBxQO3bR65vdrF9xEiDNK_7pxqcB-iYxGXRFWoTM0cAoXOKlpx7FMEY1hRzMpxZmnO0I40Oe4ulHVBOwptF7nStoIUKAiAmM_S6PI8BGiXPPVFpfQGeIcMJF7xpsfyJwpTNJ4TBoWd8yy8ba21LUP6JAlfP7zucOX3vXKggCjpZAK34k3JWX6rUtEZC9JXsuf3p8-ebB66I0qgaP21e6CokQkoghSR600FdSi0j8aetCADDUxytiNg_n5gz_e07mzSyU8QvdsY5LiZNNRp6F41WootgtLCUzMFMq8sAqAMOM7YHndhWTsLSqDUelR1i4rHxFL7nij7fYj8lgvP7_NyitpVZ0bSCUxGbQVg42QclA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_165",
    "name": "Shaku Yard",
    "address": "192 Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.32436589999999,
    "longitude": -6.2648221,
    "rating": 5,
    "reviewCount": 3,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_76",
    "name": "Green Beards",
    "address": "95B Morehampton Road, Donnybrook",
    "latitude": 53.324084,
    "longitude": -6.2400918,
    "rating": 4.9,
    "reviewCount": 38,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4dMCbpnygxpXSI_XqRIvUktie1383t9QHyD_3aqCLAKRTgkZY5K8DCSnbfQJUSAzVSTA0cbOfWNBALYsrFgZyPQiAKEnILq8bR_S3TwuoOcHvmLhirTOQmHS1RXiqkdkKT7ZEvYSB5pafpn6GAow3uVTW0GYWIgdnI76sM9ryiXl0OOTFom_bE31h1ZMcJAWpaXjrA1DZhfSoUgfozkt_wBq_jDIeH642A8R6BgWh_VzuqZyx-0dEO1XNIHrxCVbXn5dv_3rXsQKVgvDt6i30y6ZFekCQOo1T2-mQ-2UBUXMb2KuKp495eh4p_HZUj2d256oitVXELwnhw_xVJNEMZHMq2boOTpEKozyAYlSBoxwZiHbRYJJNCdAUNQw--kx-aYXigFAs4xbQtLncWwC9XapFN3CVrVldkDwW0WsMgS1RnJp5_4ue-lgdHbXqW5XIUhZyKw8zIgsdjYBLIx4i8hqNzsowyBOMCKmUss-7aIE0r69iFH5bFCi9DiXeKreYunG2IVvXvLBBFOpvlfkKOP85qmx8VlsVoQbgU910xF9WfsiWuRQMaZ4QeEb6CxswxCRG6JWjdbdhzSm6Xe8EqUfRevcf1NVa96j6mfI6cZlSvcCkuDRo3kQJrGaJp-biz9zqX&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_82",
    "name": "SASHA’S Coffee Bar",
    "address": "47A, Shelbourne Road, Ballsbridge, Dublin",
    "latitude": 53.33042649999999,
    "longitude": -6.231988899999999,
    "rating": 4.9,
    "reviewCount": 137,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7YJGYCKRmn7hpEtb5Bb0yTEQNMvIsRL3zXFfy2fvXKvsSHG5qn_kKk9ZoUWugUouge8E7ox5uRHpFa2OMHqI3Cs3e6UmUCE2p6rzrJHHthYlnQ1xxX85RLdN7y4S8FElF5aE98-FTgZlwwmg7d0RGXnDAc4F-gFFj70BQint0tFoDFOw-vRv5cW7X0a6X_LEhgoCn3WGbYzHSat-HLaj4EPgiak8hyjh-a8yn1Tl3Ay0tyOnUlHEtFMewJzhjE9jGTjOcEyHZ4JuZLlGggJG8uxXJntTer5hP9o7XBM_AU7vrBjlQ4o0T_tQ3jEB2EeiMMX_WyWhk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_171",
    "name": "Excuse my French",
    "address": "25 Dunville Avenue, Ranelagh, Dublin 6",
    "latitude": 53.3209765,
    "longitude": -6.256589399999999,
    "rating": 4.9,
    "reviewCount": 88,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU792EJe_aO8jDOlTyU43R8k1H0N2dM0e1JVX2ZX-KUp4vbz0G6fDpi9JTjhctMFlDgPhxG-7lMW0YgkRaUWbwGIOGd_bx27fubfIJjnatZ2TNVn2fJLSAjdGXThI9ZqrkNlreX1sUUQ7PxvrFyJBr86x0ssXIi45lId0XVoNNMQGMMBp2AgaJEsPoWv7cX1l8wlEQ3rDV4pAohQoDdRZVKTTXqISA-o3PmMTj1bnf32pkWCUtNCIa6zA00LAkrUz-tMPAl4-vBggRmoINI5eYHrsbiguYEy9wHdeOUhKzNCQYp8PRL5q7-X3DuplAVvQUv6sLBj2mg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_191",
    "name": "Jay's Cafe Broadstone",
    "address": "42A Dominick Street Upper, Broadstone, Dublin",
    "latitude": 53.3543169,
    "longitude": -6.2719022,
    "rating": 4.9,
    "reviewCount": 75,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5dy3rpIp5eQojwQbsxqF1pJ6l7zvnGoSDrtc_AR6GOGnmegv0PI4nP_KDsmQ6W3kB8bo2uzCyofkRIzJnH7F0gw1qk7XE0v-yzxIZZ93VPQ8IOczEVfpsn6gDGc2_v-K8fyAkm7NMttXMeMcDylQa-9n3jIlogMw_oAq1lTGkmZRAMvljJMFpoVFTPFkkUqMnVTuUAJDZyfop-v8gQJmb7JHa1FI9OZJBCGYUBKSGyfNAsVPfLujKtxJrhUlvw5uejvWg3x_iTitBdBmVQMWVbzZw2Fjte88CHcA0pmAcDMMFToyCRz4m60hh6sMSKsNhONal39bk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_49",
    "name": "Tang (Dawson Street)",
    "address": "23C Dawson Street, Dublin 2",
    "latitude": 53.3396079,
    "longitude": -6.2585684,
    "rating": 4.8,
    "reviewCount": 1330,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5j_A7b-rPNGK7ze3ivTONsTyMLLq8UEXVamNDhAymONLgClKQCg2fCcsGB-mrygnSz3UKP312X7FKDK0L4o55DD-yCTqKGMVATAg6VUDDG_H-l3_0fDBfE0MxPWH80U20i5BHgV-gPZYZIAGX3vT8El4SA1XDwYATCtPChje9LbmoSGQ-48hj9Meo_oU18D2UinBqf1UFyo9AgZq2ajxKxu9wqjgMx6La0eelv-OO1jfncz93WAWbWMPPGyq5aAlLXjVaN8POIpLnspQWKewSNZ_GtNFPR4DHsWGsTNJAXMVRY1Vv1l_PFYzla7qQUEhmdoc3VXckZ2VhmnM2xWZgGzG8XHti3WZrPhAB6xEI5KW7K806FP_sSbmJUOwycy_-lSTDoubkadPxpzXGfCRp01FT59CBuRbbrVzpwRKgQMySNNElEa_koVvlF2LP_VF6JnQ2W7ZkiVGKkYQ7rkiUoVokIQoYxHFGcWU7uDAdC0xMaBzc5RBtb_zTLeMgTOipKPD3Ab6wNs-h-6K0teQSbZdX-hX59zHmuwOdR9dhR6_xqczfyQMQ5HqiCf5RLeWTcjquDnFqgZft03AIbAX3DIEyxHnmyiIWyQC2ir3SvmTq7PHmu5SE0iMmzZxr94T_eMw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_80",
    "name": "Mister Magpie Coffee Ballsbridge",
    "address": "2A Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3292645,
    "longitude": -6.230957600000001,
    "rating": 4.8,
    "reviewCount": 427,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU78fh1HXzXiID46_N3o8jX3xqX85HNEoT4N3H9zSdAdvILCxVpJRgBxRn3iyVKywK6BvzhomZ6xMx48Je5DglfU9n9NOvm1s9H0YDELqKRg0Hm1lhkkqECWHKnU917ZKSMfBb_PYAniAsTrYuqTgiSGng3j4xEfj9ryGDyJF-B08WVvqcFna_ZYA5ZqR75i69L8X0Rqkd98Y40yl4uUI0AlJmLdffoA7SrEkF56anEt5iMSu8dsIY_UXBdOQpX1nJoYFbwGKk33a8ohL5f5ZM2aedXgL5jIDEZ_geGSgJlqzXdZL1cqDSI79JNokakNxN7JFHWox_A&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_88",
    "name": "Together Academy Training Cafe",
    "address": "65A Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3228127,
    "longitude": -6.220868500000001,
    "rating": 4.8,
    "reviewCount": 29,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7VaI0273-GgXL3zmNof5y04vuyvDPLqeI_qWY3q1ZA1Cf8_0RDUzsKhyevZiGd8i39v_csNGtkgeVePNj2f_UGQDayiVK68Q6Of7kGOFQsKrhzAWgEOkWn9rhGkswX48xQvNAxJo5G2WrP5aeBzkw12CSRszDqSqh38dvQL-pfylrayrxz6MNA5b3_kCZgjLBybAD-vBjZeaNnpTPJhQ-ujwAyamnvhwImNKL7pPwPklvPP-lSzxlUrIUESIxhreEeVnToGNmqu9yVr-4WdmBanr204Oxp-JMftcx9rvO2hItkutf4VG5ybGVYkJXa5L4uPBkTiHw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_158",
    "name": "Craft Restaurant",
    "address": "208 Harold's Cross Road, Dublin",
    "latitude": 53.3226263,
    "longitude": -6.279492500000002,
    "rating": 4.8,
    "reviewCount": 354,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5B_PFcs8Xb0r6-4cgjF0l6dpPWeKvLopDvLouEHJkMHJFQXJyIDSOm_WRXmK4P6GcCnOZzBXeHMnuhErCtcxZ_0jzRgb5egRhFmJENqX7G6XkYnaE8TOkzhFoXWWCyrt7bQfnmU_E7oApyBP67OCpF4Fub5BynkEzZQdcGSOQcpsDUVwwVHQl2ZhK--WwxQ_Azr14Dg7bgYS8FrorscCAbHwGHj62b-ebnxlA1veSlPYEWpC2bcCGoJQM07o6vJaLm4feX6DxSUnvcCo35dphXqx6DJw1ZssPYunPJ00t9HNehzm9nEiZn1lKGR6afjGGk600dMQU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_182",
    "name": "Stay With Us",
    "address": "324B North Circular Road, Phibsborough, Dublin 7",
    "latitude": 53.3605741,
    "longitude": -6.275026499999999,
    "rating": 4.8,
    "reviewCount": 192,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7bwNF2-unXos8U6U_nVmbGXTzzoaecaLs5RQRF6N84u1vBggIowjDsh-Hil5G5wQ6OM1D8m5Y6vzE4LPa-s5AxM3sI_h2N2uyfR0fp7H4dVCkLbIQfbyIj6K7CzVS8Gp7qRen29xC5SrdQslLPEBKvMk6NA1nZu3KcyA3jDl-99w3yY_W3WiSYVheFbJGc8hL3BgJ3f3hL-PZVyoeotaUeuqWO6NQbSfxevOziuEEJskJLD2MaUXH0Drkzaxc5rMsO5CWnnx4DZC082W-tn5p9eKhUez4auX2dKFFbI5nO7hIaE83ezGVfkO1EtGa6J-uL4N_4rLU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_188",
    "name": "Yellow Cafe",
    "address": "6 Berkeley Road, Phibsborough, Dublin 7",
    "latitude": 53.3581428,
    "longitude": -6.269330399999999,
    "rating": 4.8,
    "reviewCount": 151,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6HGyRORadstRdMRlqResUDrNggMRwKh7B-QHNY-GPECsoVI3FMLwmZ1GM-xzxPnvb9E8pMMFdm_fvUk-wnwm-d_UMsyFfQI0-7TrigE6c9uSGeruowfUwRmc_MqIGyZK1G81wUh7gFjq2lZ9d-Ki1cLHjBddyWj22ZXpNM8H9BCSfXGMRzYychAFA-LyhzuhGDSKQzrj9M3_1dC22bzudtcexWZZn81OrdT-oL7-IaFOhd-BkzF-2YfaTLGMk31QlHZiVY7E14bLfxi38GLUs6LjtUWsBXFW46LgVa1onQhLgqOBHJTTOfQIqVvMqwW8PJCD0NbHI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_195",
    "name": "Chapter One Restaurant",
    "address": "18-19 Parnell Square North, Dublin 1",
    "latitude": 53.35441569999999,
    "longitude": -6.263945799999999,
    "rating": 4.8,
    "reviewCount": 1145,
    "priceLevel": 4,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4_21kEge-immwD6X7I1mDayHTMYAGqHSPlIA2cp9NbqZJuSq9zi1tfEb1UxYKcJpObWaFGbdkEVCCGfJbNnrs4z6piXmDlIf-SOJqRX5--nMahYQTuV33-ixQX9e4aYRZ9RHBf8JPLtRtBUn5UBWfy7w_OFMxhsXaEajauwE39Ec9tFSsTSLaCtjYhU_UxIlyiEtlxZLo-XlIp0Uj08_WyuzcYWT7TIqpUDwBLXf1bjoQo4XPd4BZd295kYZU9od4gSdvO7b4U9vp3IY6LyizRmmTiMB-XKEizHDXcmL8xGErMXH-f29Q37BrUI0693di0L_raei3dedLcGfYGJZ8CHSCPDjTr3vnaAhZxxoukwxRsPT6hjL199OQ_Wr8RI03-85DAZN67o3YllV0lR6AfELgTgMxqrfj--U7CfbOoqJHwfEd3YCVKF-6ONLraIg4yFlj-IfrtScPMcz8Ui8wtUSML4I3b18seKWLI2yY9mXlWLK-KM5i6-WLQq8ABlwxPLRp3Ykhaiz-SEI2rCQf7Qx17o5_3y1JBibh-ESmQzk-oQ8cHfrWZTOCWL5-y4b6K56njhEpoiz1aJ1DrUTO5J80Fw8fzgeK9BrjrfQJduXRLuOaCER21isIz53YQhASGLsGR-uGPYXpuZuoQePyPR54&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_226",
    "name": "Assassination Custard",
    "address": "19A Kevin Street Lower, Dublin 8",
    "latitude": 53.338131,
    "longitude": -6.2696506,
    "rating": 4.8,
    "reviewCount": 95,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU47KqlZVAjyVX2i0NZDmjbfk7p6OXOgEjxC2NxEtHs-gVsaW5YAG18sGGUvtNerqG9CVmX2sR9ap1fD_j-coAFoYhWQbWPa573epMM8xsU6eZWcgBDAAXc3ILj_aot6t4Im-R_by0GWAycGyhwv55Y4hwa6itQIfgQXx_hmmQL9L1NDG5c3IPLy-dTfQlo8USVaRPslw_gDeCMJG8nMbW-QQiX11kmDEOI-fEETONv6AiqbGpggPY13GgUWrrJaZyw_LGVslUaT5P44fGXiaFPNbw-ZdW3qymjCgnpttliIINWv6w7zHD0alb8Gn9J0BNGXc1k4zCzaAHLRZVg8jsTPlEQEkgPWwVgf0zdpqXCjMd8-ObcOFOjbVWfICj15VpMiPu9BrHRg1l73J-x6aaafMZjRAfFxGIpdGwXVWqbUZmgbi0wdEfuu2qQTdHE6-vSsHfTd-PY5X-nSRE1_i77Sho96XZg5aZaRvALahDaTjHFQgxkYEyl7jM3nrVaLy5zhkgqmvNtWEiwCysoCA6kCNoSVFbLiru2_LMDuNXE5Lqk7sBULlcu3JTSvcWEpuQxrtKcnE9zge6N2PbGzbh7UR-OoA1OT3Akjy8KQ7IS3qn3RVOwJWcv9L5Oj0HevweMX7Y6_ygi0qDQAfKh1gw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_16",
    "name": "The Stage Door Cafe",
    "address": "Apartment 3, Apartment 3, 11 Essex Street East, Dublin 2",
    "latitude": 53.34525379999999,
    "longitude": -6.2659495,
    "rating": 4.7,
    "reviewCount": 1614,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4j4v4BRClHelbuIlIhDxbA6MoN5c7tkrnYUiT6J-t22V2bjghd_X69ZHrA2pVuMZEbLbEQImCR37RLkAzYLHqQAkOUFOXzNyMVMrnmGdg56xv4Mg4Y62D1iKzpsRMvCwq1VUOBQ_9pitjNWiAyv1bDV4W52IzSh7Hl8Jp0XtbKu467cpT55YHkwxbiSjiNK2jzhs7AnWL_B_xf04Oa-iA0D-O3m_3qjKmNkr_J3TYd-MozN0aYJgQ1e4XeAkIGgYWOTji3MJTB4soiPFPFn6cUj0ggs_yrydTngnbatKjh2dJfnE-rni0rAKhFBW_Pwu3wJjAKBvn4FGgZflcP7CBNA3AiBXc3F1XSpjoDm65t2ci48rv8LOtbAAUg_QAAXo_UdxU-sE_hMN3dRsVoeZhFwWC78T25ymM0_BSBHj2wgTXBoA6pxthpg3im3ME3tmB_Uke9xYWAHDRlbniKNET1ChDGRhOg7DUy4pf08ZEnUsh0TKALTLkowOQe-ouPzNI_Lsa5x-9B-ZhBlhmBQL0pClWngPTC9qQRym6ugSn5J0RWPtU4vpLqXEnbsU4oGxooObuv6to540KEv0F7TTrrGEulLyVpAmYql6sjo9CQr2AfQvirzONLqGFdLQnu7Lhsl52CZLVkadne0_lZ-pItqPs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_58",
    "name": "Pearl Brasserie",
    "address": "20 Merrion Street Upper, Dublin 2",
    "latitude": 53.3383413,
    "longitude": -6.253182900000001,
    "rating": 4.7,
    "reviewCount": 784,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7yhgCaGQebrQl10TLX171JFXPzCwqgP5_h5MBCmBdCL8HaXKdMgxfY7QPXTtTmJDmCkwt3mECjEE2-NAZhMWjag8Ux4WtCNl50L75pDYWeVcXpW-jgHX4QhG20ivxSasdWd5n9PtQbYM8H3L2i-cGNymloHLCWF3YenE_2FtJBkC_GSMctDTit7gQAiON8scPjjzlPL4P37sOiJf3cALKWfa_KmtsI_-C4u_Z5Mf7Z4oGju9sEmsk6m1_C1-uabOb-FOwJ-T1syA5fglBLDHmE8G2d-UcubZNtKNwWiQ1hGmC9XljdfGMudAF_qwpUIqP_7Xzh3Bs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_106",
    "name": "Mulberry Garden",
    "address": "Mulberry Lane, Dublin",
    "latitude": 53.32269499999999,
    "longitude": -6.236814799999999,
    "rating": 4.7,
    "reviewCount": 384,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6NSucDm7g2rHtrhuLzGcoUb43fRfZLFHDZ6_jRIozH5TwGoMV8mUMzI5AoD1EcK7kisuU5nR4SYlFyk31ss6c4nmZJ1DoycdM02FvkR9pFUjgCRAS7Pys1zHxrp9CQw-WkUrHZapunMi2T9hxw_DOxJrIjBwtGicjTDxpzAuGiv2FT0WY2ttVlrg0jXPNVtVzYeAsVxW-lY0Hh_T_OOCHMi5yH0O_4QNtbj6_xA50zQqe-u0VzFTd5iR3FNLmghsTyXmsyuA__PqBbn9jk7C-rYZNtz3Vb-TvXpbnnkd6mmV4qnBqlXOSLanWT2iQLkRqUGXp6548&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_115",
    "name": "ICE Bar",
    "address": "Simmonscourt Road, Ballsbridge",
    "latitude": 53.3267035,
    "longitude": -6.225822,
    "rating": 4.7,
    "reviewCount": 3,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7OUzjPRY3k4LWfBDmOKD1FZwXxTAoPkNrmqE6sWxp8RRfWAhOZmPnkMl3k_lUDZYWZSW7pg96utbYhuuj_LKIuNkfBLFlHMaSHYzYV8nHF5f8xHtzTSEjBXRhzjhpfzpqom6nHswqw_Harv-cX1oDAqlRa6wMfDpDh5-3ala4THyd1R-Z6RhN06gEyl8upCUmbJLs8tUk24cIh7dMXED3XE8ylwv4rH0jMqGajmn9RTXoDuvGjVEtcGvdxCOpZPW0Hl0oR_uCU14AJMDT3fhBX0OGculYDhJq7G_uLKbVbl9WceJ4NEuYggx7ysno2VADJa5J-5J0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_126",
    "name": "Green Beards",
    "address": "23 Dunville Avenue, Ranelagh, Dublin 6",
    "latitude": 53.3210561,
    "longitude": -6.2563669,
    "rating": 4.7,
    "reviewCount": 86,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5UjI5ptBD0TbHbTlkTskUsHtSU7JIZ1CtTy30eMgcXdI4R3EI9zkOMGAmvdcj4Q3Wjx2p40H8RmqQPUsGNgBw2pg49H849EbwkYFQ90_UYPg0E-zzwT68CuKQbmSuVqyEhLBxg2QS_2GVUewIUH0xVNcO6iwbpPsTSGc--Vs6ykHNjw1JHDsDTYlMTnYZdyGbWjYss-MRRskzLxqxJDoeu5KbOCkKwCHQ29zlqB0DSitN2deOg0BnR7IEO7AWM67XHVHxiw5nXmXtwUa6iubR6kxuMIKL5Fqo7EB0rJcN3ovIY4Z_WXPnaM4Q0WVNhVqL-9hao7JtbQZ-Qt6yhXe9OpdYwFMlbcN62J9Aad7qtZmDI97It6277fMeizFsiSVsJTUBqBU_6SjQF-uZkemqGQEhHnmYPw7a8UUqut2lvA4Q5Ja1E9ORgc1zdcWS4t938mpddBcoOaTojy0M9Viwt9MCkHCMomq631vMgwLHsK0EbG-aH94yaaM7s3mpSh6tMug-zUTUx7BU86FtwXAfWFDZYd7hVSFX7oRM8YUvO3zE3BjT6zq7_m345dRI6bM2r7SPSBTcrOKPiLYdSS6Nnr5YzoEoDD2Zr_Mb-9qjlEPLMCzBx4B5JBlHBdqSjNPc7Y2TR&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_129",
    "name": "Noshington Harolds Cross Park Cafe",
    "address": "6 Harold's Cross Road, Harold's Cross, Dublin 6W",
    "latitude": 53.3241369,
    "longitude": -6.279562899999998,
    "rating": 4.7,
    "reviewCount": 140,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU46bBenmgaWs6A9ICM-Ma113gEfrHxhsRQc88DyP4F2D6vZnewUQSPwO5Fz0DudG2YA7kEBOqsLLLMCGVZ3HV8IkpKMra3WeqUy0YgJq4llWUweYeYTJH8X-vpTMGc1yoGMgIRyGAcq2RgKBLQDCqfDdFSDUo3WWDPxsJR7xxyCqezy0FkhKztHzFZRTWsxoEP2jJKMjXNj6LVoEtRkx3Wu_yLwSqD3UtQhegc2cip5C9xEeHOlYLJXDt0ZdHBFCXOZNZ7IejN7fsJYnK_625nTsNAkWTWIaErhW3w0hb8R99idKachDsDZNJR1uZCSluosm3QOKc5Wu30WQkjLwD_CwSpZ3YxFvzkSTAjXblBqpgvM_ZZJsc9EzBNeDpEEpFL4sgOgXdSfWqkKDU3JK19MzL9nLkWS6_wcLOTOnmNNY8-IcyfWbrYpCvDiMijwnCrxQERp4g-BVApMWg_AriAYZ0KRwbiIfQ3yji68BJWIQmF3gIkMKeaZZcXSxxvgRp2VYaafCjY_I6dxMteeg2IPOBZoEmoZ71pTmzq3ynccojjWkWyAagk1ZXP0F2SdP4_6hq4cUmgHvjcJuAc65VlI65nxlEPQJvEzhvwfQi9nCj55eP8_pBsjNIb0QfVfwdDffw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_132",
    "name": "Nick's Coffee",
    "address": "20 Ranelagh Road, Ranelagh, Dublin",
    "latitude": 53.32592700000001,
    "longitude": -6.255348100000001,
    "rating": 4.7,
    "reviewCount": 600,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7vhjTP9jz9tIc148JOLxXsUIFEe9ovxKGblyXRtEOJ2cN2Ia6zT1BkMQuZ5V1DTSWXAiGw8uwiJBCaMC59zczyjLTQ4dhUyFPs9IKjS7jLzTPbabvK3eKVShAvJs13I_GXg7EpuGtGHBr74ygodvnvVA77WDtWGe1R4rnygBgdV2Hh6XW8IDyeDjdwpqMAGB-VnvSjsC016J_5GFk0N9-WK-Bsg87rjHo8kzBIGxL0c-oqwvbUSVYR_Ms7K_pVko905-jNvxc73K52G67sg2KHrcxHGcrYB6K4KsdMrPepgZSOZsqRpuCIeiLGQonHe9Zxqxoa2RM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_136",
    "name": "Ernesto's Coffee & Artisan Foods",
    "address": "15 Rathgar Road, Dublin 6",
    "latitude": 53.32157399999999,
    "longitude": -6.267250899999999,
    "rating": 4.7,
    "reviewCount": 644,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU65mh1v4FsAqLxhvS274TEv3wnyYGwC7CGEfHeWXY2rBeYpTXe-OvTTtu7lsha9UzVZ39t7PLDzVN42ewi0XD02al6bKjSPLD00lBg9uSzCchTm1ysVuqUvsT3t1-MiT6mbsFg_Rc85tRs-g3CgHUGru9LyVxOeRcx7rwMNLVRj3mjQnUN_rqkmjyaJ-K9zmFZns9LcvOnS_HFz6_3fnIlfYPRjf5pTlR-OLirc19TQjcDNg1nystVddzxcHLjORFl58jS0oOi2IVzYs3b0BOx5alEOWKxP1okFGclTKfvykwsotnqvSnIijUtW5KoNwkQkGVYxGz0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_151",
    "name": "Farmer Browns Rathmines",
    "address": "170 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.3248129,
    "longitude": -6.264948400000001,
    "rating": 4.7,
    "reviewCount": 3222,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5d6PeJq-LHEQAWhjEvLft-msZwc5EzpzLOci5HQxxtBanzKyi4pdQ2PLZxDSEqTaE5ys4K1GyIR8G3vKyhiCQnPdZDHxpWiC88lZaeTeN_koGYOEs6ZG0xP1LyDRFmHx1VwfGaO8s39AEL9Eebv2trqSQLu43EtW0KJmLHIUbzChwmLANRVEsfpkgCbMoYcOXbU3L4fdWTKzS5M18F859hSX26EowdECHOUjmvI6sHd4FcfOnfwuBkqBhBUKXaxlBAChplLMHE74vvMfcja-dJREltDUwR1b_14jMaf4BfcpFi-X4mzB8XL1DzJoz6vWGVynhod5o&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_163",
    "name": "Kodiak, Rathmines",
    "address": "304 Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.3218159,
    "longitude": -6.2655973,
    "rating": 4.7,
    "reviewCount": 794,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5HQdyTYoTa-a273rmHg8UhNJ-lZ3FZ59lFPipopTIfcY8bVFCFTv76rTtfH3t4qZ3C4znGKqnOaB7IbU90WiqCHHcrD77lF8W6jucyUBoDypRyXA34_Um8jykkRiVkPBj_VeqLZR_i6TFxgWwY5MPOBZnUvI941WQzi14dbqPAp0EkFeXnFd3sY36XyD7w6iTAOu2pptpCCfYqf7Q1H2k9vthKziwhCNg0M2idm2DN2NXHowPIVm5pGOtsWCZ_RZ-VofGgkxjQJjDaAa8ShFgEr9AL47ko9wkBlOuumOTF8BQxIr1wP4V1CUZ8VKz17qNohAEhntp0Cong_g08Jisucz91G157U1tuLCpHsXFnMt_rfcA06oYSmD-_EkNmKkBAY3q_IKK1otOi6_o278TXBokSgWoaM8cybivIwrT52xUgPuKElm4Bgk-gD2HnOCl7P7XNXLPcKl8DPJdzLHd8L4edfCFEIt49gdSCz9vovUhkJrxeUBuoVreju9SCL0i__iH9lMjOIL8g3H2GaiKCJi_iqo1m5nrZMrWj-_ZeAcTKF0FGR1hQuG47P7CmuyABw92uHRntZMnTfCWOK0DWfHaU00yoECKFhhIk4JXm85h9PIJ2je6C2UiYgWfjoFFMtA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_212",
    "name": "Hotel 7 Dublin",
    "address": "7 Gardiner Row, Rotunda, Dublin",
    "latitude": 53.35514879999999,
    "longitude": -6.262835499999998,
    "rating": 4.7,
    "reviewCount": 912,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4ilItGRy8I_xVEklpjh0HVPPBEcm2PJcT_H2VOCpuhpfX26_5qMdANtU-4npFIIHoLbmxx1hXtNLe7PTyEW0FMyiChspI8zqylVdvXAfLelmC5a27gFVsWZbNsu5qCV3BeAqEqkoKw_bbKTAO5kG_oKrDJP3cvYLzNi0rBu7XHwVEESphawos4bI3LeoI3bwGNb9mKQCZPzOXR0TjxDO3RoKjUax-cwiPLJKdgCt6OZB_1yj-AQM5l9h4ohKwyYSOpaGT8kzSuEhvSV5SbU0CgIA89DlAodoCBCUgE7Px3Sphdi9N51RE0LogPcdjhJ6RloCym&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_249",
    "name": "Sitting Room at Delahunt",
    "address": "39 Camden Street Lower, Saint Kevin's, Dublin",
    "latitude": 53.3342721,
    "longitude": -6.265072600000001,
    "rating": 4.7,
    "reviewCount": 56,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU558xEuUF0kHF24pp7qJCfvRZQnfYrqkvic33jqbqM0VTdiFTaxQCcHMh0bOPg29d4QqTQPIDl_9ihNAhzqIbikpTHvGA3ND2Ism5WSvPbi8WTZUOAqvDV5O0BmQFYquIq6sXacgSUZijiDCXTTiNePaONyUr7koP1xQmdPXN5rGhgaDvntjhX-cj02Qd3XSAiC2tht524dGar-oWVY2UDkAiaw_MDFw1I3dGMMkcBJiuTJ-Qi8KHWS8HzdDtM1nfeloIQObksFS-fOohSy_NMNTJVozBoOS4HYgdSfSqg7RPyvj5zQ8oZ14xjPq87hUKi4jWC9AOrwZ9qLGeSzhFi4HaITcbZJS-urfL3-T3TK2npdTt1kEtisKNRinwiJT01A92OBcuVbf0nCCnHIIyVp5RP7aBu8grub5kQE9gcTBHFR7QNSsF6zTol9LT68nsb5TxdV7Ja4-E5iQ8-7S_Bbmgw8a6FP22QK2-cupulqy2XP_LaAZ3jMNo74GPr4tHM9-IdWeC4Ou9XRW3t9pQpC0iHHGVTTrcXv__DGzG3JmOzNKNWsM9PwSAFvPsih7cXOi-2jJwHTo9M0TM4jHTDug_t_WbO8PCXNF-em2Pe1lR12_zWEJcYptfCuRsobclF8SA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_38",
    "name": "The Temple Bar Pub",
    "address": "47-48 Temple Bar, Dublin 2",
    "latitude": 53.34547420000001,
    "longitude": -6.2641937,
    "rating": 4.6,
    "reviewCount": 40184,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7kiJf7aCjr5mndHiFR01ZQsza1CqDSg9vt2Od_viQunElykAj1tHJ8QAEA6e0KfrY3cpCTOR-jZ8atBzcDAn0EO3aj6tQqVYE8ax6ByVO_QXSMSuvMZ5AJXXhuJ-_maW2KijSk6hWYrv5Qu0_2nsOMJ7CFYBbPxhb8x5K1de5HykpjzYvNwfznJ30GI2dVL1zmIrHrCTfY8vUhh4blc3HIYxyo0tuHSVzuR_5wLY7zpvT4yHTh99MY4DXi-xdI0U1luDVbt7oB4kmqdKKhCK2G-PhzQbtYoDwf-IOzz_bUgkZieEp6IdSduBW4oR9Ike-UQ4C4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_48",
    "name": "Coffeeangel",
    "address": "27-29 Pembroke Street Lower, Dublin",
    "latitude": 53.3368052,
    "longitude": -6.251928500000001,
    "rating": 4.6,
    "reviewCount": 255,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6P2SrrG4_AXF064aprnjWPnQPEV-quc79MMcE4sC-iHn2isB9DUR_VY_IBvYpVjScrlDZqz64uB-Q1zLjQgjb-i5fq6eDXFY21u0ERcYOJvMBFxxNoJAU1pm1WqXrN1rJG_YKXBA7oAgY5-eiaqn_RbG47UX9TpRqxhEjNit2wM5MjCbQwRET4ODPSGpAemEoWk9Lz444SUvoNsdWxXRS6d7O4KF4fKRVd1r9NkumrcdYA6Djd1P-peBfYM9zf4h-632ngMAekGhwe49B7TsOR4zJ4vnhcKcQ_qGAmN_u7Vyc3vRxpFijXXUf8P9WB5IflW2lr2js&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_50",
    "name": "Beanhive Coffee",
    "address": "26 Dawson Street, Dublin 2",
    "latitude": 53.3397986,
    "longitude": -6.258824800000001,
    "rating": 4.6,
    "reviewCount": 2577,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7qOLYL7ObLmbC0UYkx7p1ymTZ1ZJD5UcHLL5BAv0T0ucoQm-LU9WKegYMTj6ZWm6EcqERd0CijC7ded9kKB4nCwWZ-s3bfDxTUoS3scWbEWzniahAq2aiyVKdpiBjse88bltI3kRR8SaePSWRae51niselXnzemErY7MOtcY1LRD8JTB68wL5SiS9MZhXGI5EFQRKebBdmdwOedZDuK4UJyFAmilU_9m2UTwupjF6q3vqPgDV-eCrmqbqBDUegNePSlmU7qAOtc3A8pw6l0adL02wCdspyIdadsSQbABXNtEzGsSMNcIxQJj4RChA45s5c51-jwus&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_60",
    "name": "O'Donoghues Bar",
    "address": "15 Merrion Row, Dublin",
    "latitude": 53.33820830000001,
    "longitude": -6.254229200000001,
    "rating": 4.6,
    "reviewCount": 6172,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4jZiiO_GIrlmujsCD0-2aqFZBmYIZa3PiUmH4N0kw00k356AtWuxVzE9tQpW391V2ZuLKZsMdH5LRh53hhMQOPekAJ7jDtLFPLwFLaMbZ6-7a_wGp4WQliGaFCF7ASLBQ_5wBOfECu2BU9Oto24FVPT12pE14BwqyqGjFLUor1Z9SPmjvUjJ5BxU1Au2JVvBbmHIQ9qg3XB6YqW5RaTx4eeKJK64vWnMAYKMBgS8pwleqTZLW62VE5JDmUMeii_PM6etdKORizlxslNKqEpgivvqNaRbJWovpXK3XPYk0oNOSsMvz3cYKDwTCR7AaGeat2EFshN9U&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_87",
    "name": "The Art of Coffee",
    "address": "Number 1, 126 Pembroke Road, Ballsbridge, Dublin 4",
    "latitude": 53.3313315,
    "longitude": -6.233849699999999,
    "rating": 4.6,
    "reviewCount": 363,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5NifvNWFaoCLo6rZrCokqaJwWvIDu7nsqAAmgsfWqofJpw9H2B8zJeDfpiFgGO1Dovo8fgTkZzzLoguiTJXTgbL2uCIqo2itPwuGXYbDlqyvxxh8DTGYjuM0amjDrMoV1CfNP0--P0wkvjwgjxCa27GT717McfTN0zeNlO5A70uPdqwgB98tdOQpznmf3FT850r-Xs2oag6cg3DKv8J6EW9rNHarv-bDzg27aTH0nRieRytW23RVwCfP_bpexSRyZntuTIaRX5_wwUGkOR9QeZKg-MGLExsTvxrjFzQc30-aDRLOPrbPpiH0ABAD3ZUGx27RkN_dw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_134",
    "name": "Er Buchetto Caffe Italiano",
    "address": "55 Ranelagh, Dublin 6",
    "latitude": 53.32459360000001,
    "longitude": -6.2537216,
    "rating": 4.6,
    "reviewCount": 320,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5GCOyu0UoK7RRHwpnmPlQfI1CcRNPAZky81PsAChWa0siss8eNDXwlwIzXmvbmK__9as2BVqq6KxkWzY_IP4YUE_uNakjgTWUjh_5NJBm6Je5sDrxsGChMXjtkFubw3GfA0ZAplgSZTDabfM5qCgm3EPxX-YhqrPGyK_sLY4u3ZDNaSHGIgAKJwH_BoRNZ1bqiBPTB2FtF6fklJvZTdPBPEqw9RjYt3AXzAEnjeJ9u_ZGMZ4i5lQhmFA0XJ3X8vPmYQClKyCG-b5tOf62NU2-V3o4rHYh2Iz4DojjCKQ6qMeFE8ncZGQS8p1fjjXN-s8V4obPhVes&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_137",
    "name": "Butlers Chocolate Café",
    "address": "Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.32277690000001,
    "longitude": -6.265450800000001,
    "rating": 4.6,
    "reviewCount": 201,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6d0i5wteqwZySzumGIlI8EGHtT-mHV0COfKCavaB3Mx-da1TMhPkRqLKUTpl3pLe40ZlUFfAo3ikRA9XoOGXjov0WXWse1hSFmfofRENlwUm2eHAEYe6jmXPYhLCi_zMyWYkNZyVwIphaC3kQoclt54crRpAzMNc7sFxmb8GbXS44YuM5ZuD1s1CsbJJ8MN9CFU5Ii7H_AImnl_0XipWIBGfenKfZPbcQmXBkuc6INbgLVzuPrPVxx8mwYDFmHwg2BittLDhIebdOmdSqMqSsnrfsOwISc3TFmEHYuOFNIs-b3JD3BJNXL2Jqlw_FtKhnZrIloO13H0k6Q7oYYyPrrQKj1RuyG9yrvwsb9LRPSYG2vk_zihUwHrd0otr6ZRNGmtki2HXZTEIOICRqkizqKEcsA8JrbLTM_BmMy7WIYFlw2FBsz4_lddQuAg5mFw-NtdqyvEMlPxB66Vaep44lqaI0SUB3fiXvWqjTh1803VH-FqDXRslMD0ozC_zhVXp9mSm9ZZu_BQZty7pU0Pvsp-MOxIxrNdo2kv2GfMH-_nsLlPAOUY9KF4bsR805CHqLy0ltbL0kpzrRvUH-ecvHgY_PPxuqqoEeaD5wmOfP3MfbmU1Qla-QggMwlBbu0C8aSdmxTTrYadvkBt1XkPtpx7xg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_138",
    "name": "Greenville Deli (Rathmines)",
    "address": "312 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.3216027,
    "longitude": -6.2656567,
    "rating": 4.6,
    "reviewCount": 157,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7NQ0wJong9pyGkO0n1556Ob7Ez1tW0OKNszeQhEeoAOeMT2MiLsYtZ7My39srTv_RydpTAdqi8-u0X1ZY8LyxRkfXcfkD9Sq57jtVHwAyY5ilYoDsZcKSwFW1TdyOKEBLB7zgrzLxlTsQqPdlexys57--IXiFQ8JvH7R5A1C_W5xTPOpcrEVE4zjDUMzUbayf1JkimDPh0TO856bGF6FpyliHzL8YA6fYqIE5_fDN9dz63JaY10dBi0vDAGO8Vui6puV8iD9VXSSEAgjMEOIB1FCnqRBe0wsdgevaeycWCgVARWsdndLZJ_4R0AuwqhTyK8-uQ4poSSHwQm7COO4sguqnv4RTT5LZt3EwCgHXDAleq4dgH5zrLAmir_EU4ztK-Zgyh7xbBl5FwpTKUMYrRzaB26TkygEcv7mPENehuVsT8WBuQNNDkbd8ZjDsTCleQbuwyPhmbsurosQiW8IQNPtSQe4y1cy3Seij8c26jBfjKHApOmN4rVhfU60A73B3QvX6lskSk4pO0bDS_eEpY8f0lmIUN2HUic3BJI3LGf_g5iINLye7LOu4X4gBr1uGrz52dGubb3UuolY6wLI7yonjBMz6lCYzA6QX3E44KhYLSo0XRR3K-DVoWw7nFnNjNIw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_140",
    "name": "Morilles Coffee Rathmines",
    "address": "202 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.32399359999999,
    "longitude": -6.265206999999999,
    "rating": 4.6,
    "reviewCount": 11,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7Wp-ItuV15-Qy2hCBY5FcBxalH-D_F1B7m5bJBHc-bZvuvqllrGb5Ey9E3HUm9DEQpdWGo6Io09f2E9PygaSTImkA5PhGtBkd-wOV8UuYOwTh7vhl5GN0S1zG95ZGLexAXD7HfCCFjLAmgjFU1vOpS-BspjDiSisgcsSGFGiVLBhCMpYllao8hkuCazU9GkVWaVSxncOSUAQOrfzS8Tf6qyCUYk3sRgQaJMT4rLbN3LTnGKUkoj228ScKps39aokVf4ZAtfPHhEI-B3QuJiIEdsPTIGElGFGDy_zWz_jZ_2D_kvWtYEnhXbjyVNlzZjiA8ujMUaf1FnuEqBCiQ9IoVVmHmJPc0gWanqIoD6Qcg-s8kdYzSXkks45wPv3MW_qyqLpWuNCvkdjsjNMbGVFUEqJF-aicDlrmoP5rgAWtjcmlRsJ9g9TacNi_zz5bPVO-mSNu7raC_jhkjkdkD9-bnhB9dDm_Ip9-OIalGH9ui67tzNmFvV4DQbbpd1j_EVTdJzfQgaj_oo8SiAWrYEDTjYPUK5vtPlnubyO8PyayMTZrSnOmM5WADjm6_M7WKu_UndKhSPwmiox4TB0-Ta2G1BBTelZjhH1trLDuBTKzs4eI-DLvgqJAGQSv3S06SpH9xLrtd_ORBONUpPmj5TqKiylc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_149",
    "name": "Bethlehem Restaurant",
    "address": "3 Wynnefield Road, Rathmines, Dublin",
    "latitude": 53.32215299999999,
    "longitude": -6.2664781,
    "rating": 4.6,
    "reviewCount": 557,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU607PFXXuG32GmRphYLl6hiaRGz_mIlSTdLjL63HDT57dx9ttfJ1XTDOuJbhma7tRSZNEiZd9NPOk4b7HM3QCS8mOyEF5KLtOn26jCulc1XouduRO9pl_BZ9os6wOe6It_xwUhl8NoMjBBQRPR00oaFqr3AdgGk0xxlw56ZnyvFzpOuWHihlW4cWqGXDd0yejZf6MuDTeqNmQFwLywzHStHElkIyKiOQ_26c2WwnL5uOtMv1-1USLrRkwCtqb6zXjYicO_Il1OH2VCUoxA76GU1V527BvpvNfnkbdrvBVFFOKoBB3bA9vTM9zINXjiVlORxaVtkfag&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_150",
    "name": "Umi Falafel",
    "address": "180 Rathmines Road Lower, Dublin 6",
    "latitude": 53.3246395,
    "longitude": -6.2649676,
    "rating": 4.6,
    "reviewCount": 903,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4yyDLVz4yLZ4ZnRGqOqu54lOq0RI-0_FVZHQq5URPC-36P6R3CIsqBv3DevexvWoL1GwHLuIwGtLCK3fCXm8283iF3KsVnKShVT4g8lYf2fn2YiWRsgSovWsrd3mU_L1w0mCDSduL9lknOFCfs5SEOJ9PFyynG_Hjiq6pfmdLfpxHYOYxvntiiJvwhWplVIC2y5Szc7q-Y677m_in2UBHXJscEOXfrWj_qqj6RgkT0-EmAvjDLEltuA2joBQ_nXP2p9BtGr7vKyITmDxTzC5m70Lv-2-Qf4Dt0x0c-4i5kK9UZ3fiOLA8SHLmf8Hk6fP6sLrlDpTT0zDf7pelxz6KZA2VvGu_JRr5Fl-d9ZKpjkv8-rHHYxCh-BB4W90F9fpq9f_EzdTipbfa6B3BSTBvZ80Ti6hRBb6idpAP7bvi_Eal1MiHiEdSdwxJLYIdwjpumO9ISc5itadLUdsY68dgeLzQXLyvPu20vnqCGnCuLAqm-NUUNy7vYjKnOQZSk3hIfZ6i4ULruCuS8hTgBUphrABK_wFYWD6z-ngCaRPjCkKwIz_b-8Q7cMprNXmuyvtZXh74bltCcmP-pKbVhqF1MW2JRHbqio1_Dcrh0dUOMMebIs6gSHCpPgtafnxOqFJ2yYE73&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_170",
    "name": "The Hill Pub",
    "address": "1 Old Mountpleasant, Dublin",
    "latitude": 53.3266401,
    "longitude": -6.258361599999999,
    "rating": 4.6,
    "reviewCount": 695,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6WrS1PtGhvQZ2NWZ42Cq3Rh5E3Imw2kfRnZzLYruRLOPXvpsFWibblzby8LeVCxDlCcKoZU41tBKqERW7Q6HR6FzpA866qNd9krisyH4xi4ULJ-ZYLtf3os6FOUc1m200sCjVdF3osziVgVuj0nvweZS2UJSsKFRWIJH-BeaHwLtPI5UuxT3vCgvuWJpAoQ_rmc50sK4UaikU0xW-TnqqPvnKZJl5x6hholqL08SlDCq0SZCV4jNMQVSavk-usFsLSvdKvYPqk7WSezfDQqxsGrNS7dApquIA556D3SZFUUqzbuRdYppkL2gajIrhdkqg0KEicd3s&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_175",
    "name": "Two Boys Brew",
    "address": "375 North Circular Road, Phibsborough, Dublin 7",
    "latitude": 53.3608639,
    "longitude": -6.271541699999998,
    "rating": 4.6,
    "reviewCount": 1617,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7pwS2k1qEeV1V_FNaEoyDhv4vxf2T5GfmGmBIUnxXZyeuygY_tHnzukbXwMFD3JaCGotVAVHcI7dRSC1raMqVaMz32-596SmgTRiwArMmBbLfQEyQFsxbY1W3hXn-93P6x8bxvqwv6PHAYpu4rNPFFWy-jpB3q3pM6LLikpcryl3CgafkZQsaqs0eZsV3KBxb2x_OY9GLkR2uD9edU40EvBzeVi3crAE3wZqRCRRUkXV2tfYxYfOZ86vLnK9948KX2za1aqzi4pOpJOv5Izy_7-wbB53rJABzzycYpYiSRa1vpeAtItyrlnbQrr4Zlo0ruoAtbcgY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_177",
    "name": "La Pausa Caffe",
    "address": "1B Blessington Street, Dublin 7",
    "latitude": 53.3562543,
    "longitude": -6.265462899999999,
    "rating": 4.6,
    "reviewCount": 1335,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7JB0v-VBPqQ2a9jWiUdNgSbJFtstwFYa9BPDdQoGY5LS3y59k8NcZ4BoepFwL6yrl3yF3n1UzRfRr3mqVRjChEgCQAPxbRc_JDEYQbbSyjYZIjeghBiNKBU5IpSzEoNsu7qEOVMo_LfmS5CA97vj2i9SjjSBSaOEehTHITTPlY6vYTagIMPsP_Wg-yMlLQw1TZ0ec-bW_Q8UqYdW5MXQh0A78IsvdWZ5sAONo-qktaFKtUo1JcYLldjPkHz4ywUWpQRRmXQmzwzGylpA-2n1R4lw2NoTpmQ6TP5bE6c9JwB4U7sQUU0GgiPSm_3twnwZfupndbbw4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_178",
    "name": "SLICE",
    "address": "56 Manor Place, Stoneybatter, Dublin 7",
    "latitude": 53.3522396,
    "longitude": -6.284560099999999,
    "rating": 4.6,
    "reviewCount": 1048,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5QqcR5RRjlRLqsdtfMCkagQXvRpualjofRuh8TzkjCRoyuJyfValhIrEJJYTVFcMqF7pE3NaM1-IMR1mka4Rbj9E06QyD4V_1aPdUYOtPlSj-QxqoJd4Yvt2peE6Nu2WaufQeyQNNA3QQnlisyNIi0lmZLJ7TbwMzWQGs3owRPIJCiKuHATQfNerfBoJ14NFhJMMtCvrcnqPkny0bmd3sX_qPfrJjlPpxIZnaOkuqYCXErIbV9VCgPVQ61w9V8urU93qyzBTtBWaTf3hze_-rqntWl2oVkOtU9VOrMPISYBJhMJIXk6x9w1kRywNRzgwpCTlaMvC4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_180",
    "name": "Mooz Cafe and Grocer",
    "address": "Manor Street, Stoneybatter, Dublin",
    "latitude": 53.3513487,
    "longitude": -6.2827193,
    "rating": 4.6,
    "reviewCount": 157,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4mjLRQVGPshMYfcDcvFBuDn1IfSIADz-sfOm2xl2Ma-k3hAGd5kLVq-v_jKexyg8CziS9kvYgRDqPWmGA3tVeijwS8JVMNQ-KWGC88XKtOqR-kl3MZhXB6oXCsiNWjqrvUvmWU9hceZzO98RLexnTUQspXjVJkMWzWdsdGHpS-OaHDJ_5QwoZ9uNOahWy_RR5dR_A1EDp9Abbo8gFlnHQCYVZJ88zoQWVHB7XhYNsh-fjL-iyufCTn76OJU23g1DOUIYLcnNAWQJ3fcxA90Km5xWtAj3FQqu4enx5GBieHxYRiNRUvZBKgvoeI5RBQmOHIHUGXZgY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_183",
    "name": "Finest dessert",
    "address": "324 North Circular Road, Cabra East, Dublin",
    "latitude": 53.3605807,
    "longitude": -6.2751369,
    "rating": 4.6,
    "reviewCount": 18,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7cFMIfNsafQEXJb7GrVhJLvyqndTiD3DLA8Cq5MkyJusSAh5XSZzT-cfOXmXYr4qFDeC8JuZPlGgiG2uzno4eLgjfX_zj_yrhAVNvHu-N2LT5YSLHG-ZlFH9yIRxzygCObnzfKI9PRDdCdMyOUUjQ2uRNNpQmvVHOoj4VJ7guzUFxxz0K0Z9gXEo7Vh6ZbCvY17NP8NhMWtqfqocYumFz4bNrIBoZFlSvOgqTZMe6OVohYCdxe5mCpu4Ji92U33F0bmLDG_wamqN9TiFkZFwzRdT67bRJxVOzUhxHQ0FDCR-9W2UaqF7q2GEHP-7a-WhTgvObn2ws&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_186",
    "name": "Ecaterinacake",
    "address": "15 Berkeley Road, Phibsborough, Dublin 7",
    "latitude": 53.35869090000001,
    "longitude": -6.269808900000001,
    "rating": 4.6,
    "reviewCount": 156,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6rW8mXd2HNF1qgOanLnNuesDvTFYny-RsFqOpqKYRJiAj2soPcfvNvp3CNpRRx6HVq6Up7UbWnL7GXz0G0l_A6fCEluQklk48U38MQfj5BzjXPlZt8Hmj63naE9dmimpxI-bvcw94iM1YVYRnFWwvoqBdQM0Mm3ZbYxzAU4nRcu3LKP1XL8tnUOzlKwD85WLe0YlWG_i-QVLTxiCFWh4WH-ZXmOQg2Hr5j2JVmW3DzM9Zcuvv6_yxnMo83P3mRQKomK6BoLTRUMTWDFfbt4Qs7mKkZvDq6UZcRLOH3lbhZjDNfq1jqU8M_itA3soWtbtzviCSTqU4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_187",
    "name": "The Hudson Rooms Cafe Phibsborough",
    "address": "394 North Circular Road, Phibsborough, Dublin",
    "latitude": 53.3604765,
    "longitude": -6.270092099999998,
    "rating": 4.6,
    "reviewCount": 191,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7YWblL5tP70mwIW8TZf-jU0-hUboCnhiK8VyQxX74T2QI5V0FZ1IuPg_vlucRYoh80_ccYK5-BRKebWVi9sGUZTfmFYqwpCfNflTqJM-JFFiEuA_yujKyCH47Vbv8d9jHOp0UTyQKfMMh3PjzDLhDJX47nVBnr7779pKwCMrwdIUJi-g1-yYVe5j5FFqClQW_vA5nEAaXoeC-0mwrh6s45ID9QmK6e7Otg7V1UtKveSms02ZEN2hCUHijKqT_ipaLIiiO6rEASXokSbj-PcTB5Cot-8a1VZPGwzPnoSxmNxQDcCJwPmFJbxBuYf-p44QwAJty3pRg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_210",
    "name": "The Barbers Bar",
    "address": "19 Grangegorman Lower, Grangegorman, Dublin",
    "latitude": 53.35213,
    "longitude": -6.27983,
    "rating": 4.6,
    "reviewCount": 852,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4QsaCZRRwFC4zCLqC2IEiV2zPpYpYsCLkoKzrv19LKNQxaZW7xFOcYrLSydAmYDuwlKJ7BcagoqYREFpdzehLxH1X5kLp1byL38qdQCaWDKN4vSLLr_gjQFzsy-2M3Pwfz1dma-2Y-oUk0M12lgLDBuoHA415WPoLm6Fe_Z0-N8CpF18opXjc-F6YI9TKSq0jvo1MLI56npQLV9BwU3IZbM6FT58OwItz8BcJ8CaODhIfHI2faa2lUImtsD3C4Oto5d2pABlKwfOywOA-XBo033SckfVRMY5Ur0MxcjLyPjnsZVcnQK6ZA8q7cLJ72i8lWDW3garw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_211",
    "name": "BoCo",
    "address": "57 Bolton Street, Dublin 1",
    "latitude": 53.3513187,
    "longitude": -6.2700705,
    "rating": 4.6,
    "reviewCount": 1481,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU43gHQan9hfrfOTvf0OECfN8lBGclyTQad2KRLAtRey1dSops3Z7GJ9iKP9dX-TyvOz6ID9_aiCPC7LJtpEnZrbsbOPyP3S1GijUXGNiDoYC1ClPQwUIiS5UegDHvGiXLkrphqqi2HS_55slZmgHs1ilzvoG3QRiibaoXTZkfUlnG4np_UiIoCWBQD--AhqOfQdpiRo04btP3Fmu9YpQIKwp_ePrYf_wRi5hMcDt_7jjzg0BK-yWixEDhxMLPgvkXAsXkRSMqFntcX65H5_viB6SuRk-YUfkZnrzHG_cEz64IgsD16IRatu-LKg2luZxyx2hjOy52Q&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_214",
    "name": "Bleecker Street Bar",
    "address": "68 Dorset Street Upper, Dublin 1",
    "latitude": 53.3571801,
    "longitude": -6.2639138,
    "rating": 4.6,
    "reviewCount": 875,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU70jpqopMJFhIccxuSIWN4GwKFYfCX5L2-cZQVezUsqyqGjd68fK9f9qVMtR0dNbFYzRUxPImhjaWfY8lR62vQ2dcpC2oCZzfaaGAUFtxRjth7XnULQ7hl2VMUgRqJ3ifiRwLsOLSHiWplITGwoWWa2wee5oX8a1pceJs8d5PcZ181rMaGwhZoVJa1iG542CZfSoAF24NlOdZJeFCKbDCKVRH01IIfgdQLkWNkjlO9Fytm42h97XU4T37vsaqjUVZ24RSBeNBojkqpPiPjG1ZOXSAZI-Uo4g84C590WP0xvNZm3r4AJbqp5ECigb4Sv0HQhg-1priKlnxw7eO54gYvJ5IZrYBXc8pSTKZy4i_RLiGsF2o9C7wqBg1czUNli3JwZpcE1UTk_IUUcey15XW7HmBCUnaXg3tAwIe0Ff5DWSmjm7Jo9fapcwQI3PqqiModzcTokv7XJO-KjKHn9CdBjq81GZAGAmVduaxZE52uJfe5r-cO-kegr2-5EcMU375cFHDGP8MenPuI7llY3PPj9QgyP49a_yjNaAXhh62B3zeHTiJajsQwHNJi2Y8q3OjTRp5neaVjCob7bMFddiv8qrAFBmUjqYMT6K5dc1bX2FgcNomKcj38yiZf5U5nB_vrMmgjS&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_217",
    "name": "The Bohemian Bar",
    "address": "66 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.3609081,
    "longitude": -6.272925300000001,
    "rating": 4.6,
    "reviewCount": 607,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5qvNHj652ywUpyReBY_NbTauUVchbRHxQFcYDW6uAle7ieRsXcd_QF5D2g96c4VVNbBfS2nSi7d7BiGHXrWfn2nm8R2eIB8zWhjD-7hO00jvJHG4OR3Yu7ZnVsLXcGvalVi6RK_QpQZeYibXUKjCrJ0XZBs8EzDiaKScmMYpuWvVJ-CXKlcnwnW9p7YUexLV9ymhlR5ziBZVau90uEAiuntamRT9MrgO9u2q3AM_miZU2ejGzLwnlNnZWgci1UcaSGh01RqNhm7YJT_HYpChT37Rv_y11bc7SvUekl0w9I0_YEf7uk8PUp_4OH4_J0UKEsgweDTmw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_222",
    "name": "Gaillot et Gray",
    "address": "59 Clanbrassil Street Lower, Dublin 8",
    "latitude": 53.33250719999999,
    "longitude": -6.275489599999999,
    "rating": 4.6,
    "reviewCount": 606,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5eJC1UcjgxhRyrWmdi1_M0K9sUQaZErav7-jKfZ2uggx00ri-j5WWtBDnNK2opiGGhrPNlww20ZC6egahBL6YUCEjhHz-MOGvLaDwpVSLVMfkvnHNGP__c88nGqif_Akd8SGOALsopRkiz-z80XxC1f-3n1G2fcW1yQv21ZrOMh-yjkEPDQ8JdfsH10IHdaekRrs5TPbUArj2RYI9Z1X6Da9bRKS7-RyMqmf1bPGN6a7DGM6dxks__45i4C_LnmFtb938rkivmmJ5_PqF73EETXh8piFy6uCsjxOSjtaas6ulYp5Lg6Sgb1H3OqMx8KSij0nsPEgE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_224",
    "name": "Ebb&Flow Camden",
    "address": "71 Camden Street Lower, Dublin 2",
    "latitude": 53.3350267,
    "longitude": -6.265484299999999,
    "rating": 4.6,
    "reviewCount": 546,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6YIldX9d-nF0ZGdEVfy978xqp6QZ8EHGXEzdTouqdQzv0K00wr1U62ZhKJOUOO7mFM-lFv1hpoyFkE7D_-z_i8V5oXfksKm8Nfj2sKT-yMbMSFfeqXsZVtwfrumiA02G76VPUpA0xjdiNaF6LI3UgFpmAnm4ZhSGMwkJIfYtIzxBgj9kJE0kHZKwKsqCo7fqiiKdHEuZ-2GFMSFC-lOD3eCtAk0V4lWIDxA6eRp7rTmmN4cIPNeXt48u-z3t8puty6IxjTXDsiKgznxAWR222n2PHhDOS69OoD7dAWzKqVRDEoFZY_y0Cq3IGV6IMxCqrZhrItMRA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_229",
    "name": "Di Luca",
    "address": "10 Harcourt Street, Dublin 2",
    "latitude": 53.3368719,
    "longitude": -6.2633433,
    "rating": 4.6,
    "reviewCount": 579,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6Iwn-YQKnbXxfmiF00lRM-AcTbWJFNwGMWANQXZCTKQ6QfdQb53sqWYzSzapF9EsvSMhkNOUmMInsjNzeOdkGqEaaEU1U2Z0n_WeAeU099sUvJvn7ufvAtgxTgAYDrcx80M6uLGCq1Jq5Ix6Z9werKVOxTe8QquCVYrEIFufmc9UpnNq-PLEp0ISqWQVTA40hrWU0VPcOpF6FvAJcYJG6vW6JPb0URar6q56hyjD_Lj9CA22cv1dgNLOkf8IZZ3Ifarvb6XOD3Urg7s13XbwoRLutd6VgcVrUOuQd63nBD0a7fQGIwpltLTW1ecaJTvOvb6yYOKGU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_230",
    "name": "Two Pups",
    "address": "74 Francis Street, Dublin 8",
    "latitude": 53.3393555,
    "longitude": -6.2734203,
    "rating": 4.6,
    "reviewCount": 1658,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4h8_PKxO2wOs9N_GqiD-5c3mT2xNjFBt7LheLCauaS5DdLTQANcNurdERbtBFtfvpWyNB5LCgc318QTfSc0EhpdOEDOI9uooI01rfx0CqJSPuqwmTukxxtAoaOiv5Y25MJSebGA2fT72-lRn7W2ebOTCxBudT4EBdzXK2d4QunJNK2M2pAwxm82Sj96g5ovbwReVqBgOtCww1raaDNgi7uE1JdCT0jX0uN-ITJdETQi5cfFZ2Yr7jTYfYEA8kriyOgWhqOHwBxuVTDdxIwwvqaWkhdcpcB1UKw8pUkLiKatfp7Rf1OcxyltGuZcxdOHa91Q8frhUE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_231",
    "name": "The Fumbally",
    "address": "Fumbally Lane, Dublin 8",
    "latitude": 53.336991,
    "longitude": -6.272990000000001,
    "rating": 4.6,
    "reviewCount": 1919,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6m9sNSwIVmKVYyuqYyjjSvP3tyiAhqk-9Hslo8UE5LeLK8EpnZUHrXPdozmmiVrUAGe-6VIXw-5xzfC4Tkh9N271GA8pfiWXkHbxnIJHpA9bgpi4jDVazSOpYpZuZGdHTlDa1JlwRanPjJHLiH6MuRZ4CzJAKCsQ7ks3fL8EytKU2MvR71OXxBXcwuffs0Chlyi4uSnbsx3EN7qrI_JuQVRuZYwIJUGpzkRPTQk0ocrVpMM0yNcGdLX59TK3okFBBf-DsuqyPOneb2o9D5sxCKoGmgNgCiSg7KGVggO8hg3eVlmluWJAclZb5uERPYk5vi0cE4nZ8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_235",
    "name": "Camden Kitchen",
    "address": "Camden Market, 3 Grantham Street, Dublin 8",
    "latitude": 53.3342406,
    "longitude": -6.2658919,
    "rating": 4.6,
    "reviewCount": 399,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU65F4vsD2I8EN-PDpqQ1GaZES67AN-yxUd0ATaIPnzZBMS2o6D0D5XtYz1gDnPxY_5HyaE-d3lkDB4je5FdhFaRZ6bKpUcs_NQOgZ-LVQDXjnGi_BZUknYBAb_vWRPxtjHbnDzyPzhCWKiL9W2rl4QPRTfk1yVy--eoCmdc_epOUHBxvNlFR6qxTwiDXWH5F9DfjlyGCgEkO27fovYbied6mc3N8abbSRgaq8ucBiG6w0R9B6YISI4yXo-u3WppOjGGjDadOb9xJAJD-1bHSXH8benWtf315oG29G8QII2nFXBaXswQM-X3_zpnuu_wJYtdiPsZrik&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_236",
    "name": "Las Tapas De Lola",
    "address": "12 Wexford Street, Dublin 2",
    "latitude": 53.3369696,
    "longitude": -6.265387899999999,
    "rating": 4.6,
    "reviewCount": 2366,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6ohQRCl_gu89O2o3OnOsHJodptfj1LU0M7OxveQpjmHY2bZNH0imBq36XucxeR0TNo8UKFJVtuNjvuMtiy4LsFZGX3TXGY4jldJg1-ry3jPF-50nKKzNQcW8R9T4CfJKxzbPT3jHMYJBAoAlzIewSgO96sBYh6wZxYGSiFdfsMZmqlIyl5qRPFvkFpBjsVq5Ycm9HxLP1XHNxAkYelRJqkFgSbRICudtKkZrlYBl7lYXKrFQEDBKHN0eof7qzXFh5iYtoxewHaiyBCDrRtmGgMWOcLzxNJszjKgUNbe4j7e7m5f73i3uNEV95RLW_k_aWIcvZezQk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_241",
    "name": "Bastible",
    "address": "Leonard's Corner Bar, 111 South Circular Road, Dublin",
    "latitude": 53.3320926,
    "longitude": -6.2749177,
    "rating": 4.6,
    "reviewCount": 634,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5ZV0NFYKkp5D2pBFUFgluKVEdUniS8psjUFVAp44vj2I7LGwPYnnfxZis62DzIWROeBeExyr8SK6bG4dtgupTWNMPoKRhNn3csAvJwpFOKTmvBcf275OOwPsALqEGyQvc6PkzninF0oGWQDtElzQ1GG8FnW59gjthq9XrU4sRFX6qmWXavpZFDB80oCzp4s9t8083I16BaIKt15K3IcXfSzkCCeY8j1tCfEOcdYAsHAsh6WzLQn9fjZH6mD81rOVnhs92pgjte7Z4ca6x4gQnrMycWv0LTBrpXVixCb_5nuI_G78jPckOOCEnHQ2GRCj-7sRUeKYI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_248",
    "name": "Peadar Browns",
    "address": "1A Clanbrassil Street Lower, Merchants Quay, Dublin",
    "latitude": 53.3362276,
    "longitude": -6.2735282,
    "rating": 4.6,
    "reviewCount": 773,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU41kt_1Non97l7Ugi74IlQ3uoJ99q4ZkzRjmxhLZMuNCrwTHqDVgwsmcGnaYgPpk39Y5zFPqjI3ON-YbRFyNU-ZZGyDch9wZoymThHLzpOItvvzPc8hF_LhBW9ngBggWLEJV1jVvt3jf76phANJP75-KSuT2qcu09-DNU4mBWfuYXwc9ePzbuxPfLW2wXnS4tyKEsQAlaYu8vBF_1ft-NXRfNKfPbA9lZIOtUG5QW1BXzlu6wrUGuatL0o-MnSiBw_Twn1W8-Em5PLOJOYwjJtPaabGnq4YEhu96Hb0PQEGmV7VD128KilSOU7QbFZkRiGx-bfRFT4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_15",
    "name": "Dunnes Stores Henry Street",
    "address": "48-50 Henry Street, Dublin",
    "latitude": 53.34963920000001,
    "longitude": -6.262982300000001,
    "rating": 4.5,
    "reviewCount": 6096,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5RI4MaM7SfH5inoPxSyvQpu_MRny6XlPm3uhZ8SbFNroHbSgdEslXfcYiBDct2LgyvvnYUEcOo41pf2TKp1tPuf-jQb1Nanqy1M8HDRYFgKHUGHMW2YirJZR4w_CRgVkP0PNgriaa0SJJ7bXHHxfvawOkz69wFfIG2U6HaNYRWTiR2cnLJQrFKKzLfJtp-IymNjQGtsANM2FmDuZfl3LBQs7ut4YVCrvTu8P-I4FKvSMgvrxWw4M8QMXTmr2mObCckkKSPFvgvjeEyIOKTGqU7iry85V1rYUZOzRjEh8d24HtrqJ-JIrXegHtZ72jQ1xBKmJ7Dmyjd5gBaGrd1aOD7YCgm9uLpCKRaxabmbm_BePwHcIUvFYpZjMQOQT9iht8sJSWe-iaGH_whI0WXBahbYwVdcrgt_5OxmzJrl4RaU6ZilFtool0hsPMeOpIp-FZD1Z9GmHkdlpetvf0tnMNp6LO8TpZpYVdJzupRwHiHwkk4OAdCD0pYycPHIu9oy0IBKD0uqqEdrmNMwy3bDFk0JoszP1_V4OQHTUGtixYja9wGyFUgCiXDKiWxr4C1OdsXdRHnVjfSGa4ZUnm7lAE7HxKzOMRvu7Gt8RWt3dqTkTtLqY1imE4ZLTQ384WK&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_20",
    "name": "The Art of Coffee",
    "address": "Unit 10, GPO Arcade, Henry Street, Dublin 1",
    "latitude": 53.3489686,
    "longitude": -6.261478500000001,
    "rating": 4.5,
    "reviewCount": 258,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6BkhGfwdIxw2JNNjtzsiXm3qxBis81NTExpUIJYcvW2obXfNFpoeck5KuKXnwHR9CkX-F3YTJ7Fmp04A8DLrkhRqpj0ApexM9ku8jM8MkZB4da6nBueJ9Uyrfp6rd43MyAGqfOpePvkJMvmsq9WmuWb0c7nTTvx0xNG56uIISPfyrwqGqlfnrV6yeSCIEaztykELNr001d3lAqtfp3IkasY963mA-Ju01NWHKL7lblgwwPPVZ9sJtyZHb7d1HHvCSEVY2fMcwBvCqqDrrHgs2nvy6wvNzFxt7suydtRjrzxYunJ2WMonAUCbYV0e-Z7YujmIR869slnRWNXlz28x7mSmsRYCMnOerTb1FOX40YXZvI_n8LZxEy2gDpy0ur2x35K9ScW_2Dr9mcFWziSce3g0m4lpmtCdoFW1IyLpLDLrALWGn4FBkXpBuSpiI8w6Dv4pLOeGxI-SL2Ik2W8KvyRLsezWLOm93cIK39qxMDdMZBPjekRXLIp2QebBjP-2-bdR5daoESHZcItRBIrICC2J5onhiAQHWyvFVg2tQQQmQ5_7x1Slkb8A_xaP8bHC-jBWyMcDXg05JIbCB56APu3miGAKL53PsSHah17T4wQaRZL__KuZ0DZY8_0pAAVH80m8T1&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_34",
    "name": "O'Neills Victorian Pub & Townhouse",
    "address": "36-37 Pearse Street, Dublin 2",
    "latitude": 53.344885,
    "longitude": -6.2524708,
    "rating": 4.5,
    "reviewCount": 1272,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7Ws0Wft96lyRqutV2CgceDZ8dXzyElpEb-5SmvS_MN1qdHsMEFJTExTrY_Wt2Lohy5tyhXr4vj2XwN07XH37AWTzvzD4EX11nY-GNJD2SKAmvWdEJb26rTKq5TCv4m29YfIb1Wll2qtn6JcztO5KqdnzyzDTKjvZ5rgPlbV66G5KQ2DWkusmlAohI9CeNQAOyYg3QM011Po8hZi9GbdhJo2LYgplE40nkSTfzRgqWTQ1DwVuhoTWs-M2MNKwSSG2vL_L6BCUFMW99brw-nB5-B4wMr-_rMMygMoEOGzM3A8f9_bXcHC5MwcR6rxSpwPaexvMJTHks&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_39",
    "name": "Temple Bar Inn",
    "address": "40-47 Fleet Street, Temple Bar, Dublin 2",
    "latitude": 53.3457431,
    "longitude": -6.2597552,
    "rating": 4.5,
    "reviewCount": 1612,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7yWbiGsFd5m2VWQ2ZtJ6CynXnGeSyTP1MSLAC1HjlKRHiUaR5vwYJFgKB720U_WF9-_i7X0e1Ha_aic0zHaOZxf1ij5aI7jYQboEDrds6Ly7Cr4od9LWsBIg8V7pIcJba02ONFQdBVwXGu2C5CDmaBm3ljGtfHWGAiAK98Uc2ZQMnAyrarNY3UCyeMRjaJWgI1zW-5ppfM9OxmpuzmgcX00dxjGXanohvCfDTmOYXp0E95HB2csXcyFdCs2mjp0GH6bP-gFVO4SchSmALxRiFUXiXQdAo8ATauDNPTjxTQ9GY6fQ3_99g-MrirUgDvHJXgJV7o2qY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_46",
    "name": "Dunnes Stores",
    "address": "Unit 10/11 Stephens Green Shopping Centre, Saint Stephen's Green, Dublin 2",
    "latitude": 53.3400719,
    "longitude": -6.263209799999998,
    "rating": 4.5,
    "reviewCount": 4660,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7ddKDWEL7dNriq4dYWMTuL7qc5iMe98jQUBkQ03qZpRQNAku6kuJ05opKhCzM7veqdc7j7YAkdkCh6VxxLjojbt5EkvQSgnUFGlhJEbvO0s_S7gaDUldIQypcksE_t8Z0xUHpwMJ8xXtTQ55WXQurR-4efVwAcFjLbXX3m9rm-t2WMYYqP6aA5T34xc1Cs9uh8TKwWbMSa9vnutFzoof77rzBJEE1S3BPNI5-QnpIIrULyMgh3Zo9bLkrD7iF-rAt1BB0KdvqWp5YDjAXE1T9xbsMojkSltZF9vJ57-uPGeM6DFn5RY1aCW3yYKtO4Macxevcw5YA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_47",
    "name": "The Cake Cafe",
    "address": "The Daintree Building, 8 Pleasants Place, Saint Kevin's, Dublin",
    "latitude": 53.3345197,
    "longitude": -6.265897100000001,
    "rating": 4.5,
    "reviewCount": 843,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6Pfw7_fALRjP-JdWNhUknWlUBSbJGyZ2V8ss9C9Ac7oROduSzyAI5dUsAHpK4AekR6aX88KWXTMU5wsJvCTxoVdEW0xo0pPDL2IyOLUzmRpGgmbV7Sq-HwWvSReFprx_1FY-feUJzWYJ8hrd2lWmyoV88JkTFdWNghRHinxd7mBO79dWX_Wl3ZwUuEi3ZwxzSOwF85e6HrL-dtXyACEsfVukiXAS7UQxaoObzab4rtEYOGPXvveYOPG9MQQIBiLiLKyG0OMlhUNlPq0s4-Sl9zxL5oSv62UT6CtGzKdrl6qumI6B-ZS_YgvTfN_k2kPrg1Wst03CM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_51",
    "name": "The Rolling Donut",
    "address": "55 King Street South, Dublin 2",
    "latitude": 53.3401744,
    "longitude": -6.261085499999999,
    "rating": 4.5,
    "reviewCount": 1013,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5avqoHel_PHnEcvYvIlqcMe0Ideqsm_GTmKlpG4PpapNhfadPQVBWiNxj2rsmIzvJWFY6CHr2tHky1XvngCLclU6dPSwq33bHslGETqX4dk-vsyr4BEgrygdSegirTpot-A7vQrxQ6Q_xiplsasvd9ucNLw4RToZoh8Wt_o_AkpTuz9Oq1Z9tPDuA3HYdl1X-3mgt_amY6MMyWRfOpTzu4loSOnbTJ1vx-dT7Y0COm82M3ODKf8LPYPtGqpekdTP4f89NV6GnDK1HC98WPiWKaQ_Jf7VNBxYrhjeB5HiFSUS4UKYmZdCDou3qTb877JrX5prQ55MnbKVUXfBvGmQc0e8Y6WdMPoi02x7J2Qi9vBtg8xUGIa5cGP24FKB-TzREGBPKJhiuBfNSywmN5-DcDN9RpuB3-gjD2A4NpEwxO6PoFonJ3kYLKR3Fljx7UKX5HA0b-Pv72GviVmo6Q6jhyUFmCVEtjiEHwLIO7zZ2YWHxsV8fSwK8df2FVRNR-Kcojb1B5S2hUD-tQ1oSYPtQDC-Nk7DWcHtgpU6aYeQvNHNUCKDAYo8p7vEd10wlv8fk_1zuwy_FB3E2wbMMrS_EFYoKAlRopXfvjhWidB4jNiGHug7c9Nrw9LgkSEqEWELhKSQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_56",
    "name": "Mespil Hotel",
    "address": "50-60 Mespil Road, Dublin 4",
    "latitude": 53.3333283,
    "longitude": -6.246893199999999,
    "rating": 4.5,
    "reviewCount": 2421,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4FYDQgY-GklcvUAN5nI4gXPFEDzWj3Hji75cyEgcVQHqDLTbgqwkcTlrN90wuv84Y8eMvkGgG7M6GWkQLyyv9UPGhM9ZT4osKz-AwkyHceMv9I1lyUXA9LCkQ5Wk-DYO1UEAVQIj-j4_s4Pj5H46HptYoUcmPOe_yo9C_gfEKJETZYMUgvGxdlI5qJ5vUP77UvF-NvLOlCLNcbc1LEO-13Xw0OaQXk15eEkJ986dvdPZsL21JxmCMY292RS01M8uog90zeQpaG_H3k8C9IRa7qcVfKkvAbwm8u3ougKtJL2j5LgVr75CKUgIJS5v7dBKM3NqSsVXI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_70",
    "name": "The Stags Head",
    "address": "1 Dame Court, Dublin",
    "latitude": 53.3438235,
    "longitude": -6.263658800000001,
    "rating": 4.5,
    "reviewCount": 6719,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5gf-hAol_RPcvOJH_T6VnhmI615VTWQ92V5NgiusX5pXBozCf1s1nCNreTPVqykYUCFdM3SYX5PtYBAdsHuzUCSuev9KTpbcXzVjr5hfMxIFuWEh-GlgZ5InTjS7p02ovV7LfIhEWTxNHZN3qLUSpWKqAoo1l6IU-UbSkeLCwsWdUx4gt9eHmjJEb-sReYxQLqKF0C_H-zbnEe-ErbDqwec6cFcG_xDsH0be1wEyhV9XWj-s7zZWsVtZSWj60iqr9ZGYGlPavxTJd8qjMLvG3orFbB7eJAqZR-9iXMowEG_qq5nI7QLYMFqr0s9ZPetBmof2qI_hnvtQ3ijYXlm1vPWDUHdJlM42e-y0H9Yzz00oE4uLUOBOsck8l1RR6s0AINAJYzCI0GGP7KWThGQSAc_BVIPvpbzfZ7-95ISPbJUoQ0C-XfNRkO-mGTN-VZUkjQg-01oT_LCLpMPjbtgtSxwJxcfnfVivSYk5L22V6zpWM8lHIaJ9Op942lW38N0gRtdIOBR7d3QKRFRLRnlu95aUWXS368FUFnUzAo7CRX-fvsmzqnz9HqspaYVZMtnDMizzxBLC9sFyBbl2vbDUpS5Xe0hyk6G5unNMG-fJN_unGmcWP4akQ9PgSXHsN1IuN5Yg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_73",
    "name": "Sprout & Co Ballsbridge",
    "address": "9 Ballsbridge Terrace, Dublin 4",
    "latitude": 53.32935359999999,
    "longitude": -6.232156799999999,
    "rating": 4.5,
    "reviewCount": 257,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7yKb1D61sNsVo180DLOlfsdWe4X-ngor8LMd_-UgLjEkV7jwt4DUF_IhmhR3f0cXIlaneqq2NGQlhaBsS3Tams2rapKYNWl-M8JfigiUt4Sm3iOv07x4ijjQgWE60inPBpjbfdN7kMPLc63CdgUTNQBB1l7TnDQjN7T7qUL6GFfKGN6lEJtkj_j3g1_xsvhuLXR1Rq50Q_fEyE7mSw1qF1TiuF0mictyRwemirUYhsAyrNxrp-RQ9k2e6zyFwRdNZHd9yJdz4jdhVdlAZjzA1lT2QAy9Ilxatg6hQ6w-bLxDhY2NddbOMhBppgI3HRQnRwG1cTm24&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_89",
    "name": "Insomnia Coffee Company - Clancy Quay @ Spar",
    "address": "Insomnia @ Spar, 54-56 Donnybrook Road, Dublin 4",
    "latitude": 53.32144169999999,
    "longitude": -6.2348915,
    "rating": 4.5,
    "reviewCount": 15,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5DRpUlHtV7AqC0bzHqytVLDVKyWlM1PkkkbaGfNKwk9NYAYld1WJ9hYC0xUm0SuQ6KjzPczzbgZ5mOfBiO6Xo5ZDTV5H664rGbvryPzVnwCAVh5r2T6NsiMeC3VjmXRxcQ7haOrxW09dRUg_LtA6a2JyU3KPsnvsjwmM90Zo16Z0kpruFQ12l-P2R8RLs1r16AnHFrSj7LcYjUvhLKwjcHAsUHxfMKjDe4aRKPx7x38DG5sCkbi4j--W9UXKrd-yKQeZuOxh24CpGK9M4XdScyjqifx8c5d_G0ghUOeA_ayxlYxeIsr_sdYckK8DfiAW6glX17O_mnwAKpuNJhPPRhjn1DG2ud3h7PdfthQcRm9DMPZPkOO3N_IXX-Yhbh5qZ7kuuLFKF_0Z7V7yQhvelE9bKWYa6UJlaxzyKmrUD20eVTfQDmNx-0ynDzC64Uy8Fq4hV0JNXZa-bFZQk3ZGGVm4sod4XTuW2VlyPpU165PJA2IQY_yZoeAnd_QT0lobc-S8zV5tkzUekSn6rqUIKbP1v80tvjjCCj6Nf-bKLUntj-H871kQzWQGrg0fv2MGoWid7hh-ox_eR-o7FSOILdCecaKif1LwWH-kNSwuyzScjVpUPqOjlJRv_8VF_8H1rJPQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_96",
    "name": "Baan Thai Ballsbridge",
    "address": "16 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3289919,
    "longitude": -6.230210599999999,
    "rating": 4.5,
    "reviewCount": 696,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6X8AAG2XFM9dI4poiTVVdAvCZxGSiiUUHTHUCvfHCjPxjk1BJha_p4MkN1hRP46iT5T1vFenjKwuIWwpQcpPm0zrQ85qRUjyw2uXKuGOufT1x3cUt_OmI5buZ7fXKHnWC8wvY1fgKEJUkMNGXYZLN30PSySSeFB60u037dY-Zw3qGH6UMlD5hU2Aoe_2uoermeArOL9qDEBMfa3lL7o-bL10jh0X4EAKCfDox6AHbWEHmlkX-3Drf7BJYWROtGOUdOf9pw_lgeL4aGEWGgIS--zmCc9V9Y5Q5fUHSUUkJRh7Ojrn7-bCa5nJPDKeWRFpESpX3vox8Ex4R0WiULrtj9pOE4r0Xs5AdYAosOxsDd7iMrgweROQIO6Np5-vysLIiSEb0y9OYqMc9RrgZEmFuB8EnaxjG-HS3UFJq5v-PzdcWvakZ3Qr4jcQ_4tFMBUUAqDHamtN9hSuOYl1FXf7oFcgYis1xmzJSVBLsgOIXnm3rwFSiyTopjGSm-E6cjb86ejkjv-mTG3UshhEP7ohq6zceS_zNU3fuWE6lkygg3VtjfqEBWWvXcxxLNF7iqMLsFu-9NHBZp2fN4-2tsXO8GdTaUhE-vVuX2ADGaMcyNIwpJ9V9RFF4G6IYyPzQB5m6A8_St&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_111",
    "name": "Arthur Mayne's Donnybrook",
    "address": "48 Donnybrook Road, Dublin 4",
    "latitude": 53.3216727,
    "longitude": -6.235170300000001,
    "rating": 4.5,
    "reviewCount": 466,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7_4Fv4ZMIT-kGa7nUY97MGX1SSvv63oouT2ZAoHx2qLzIcxv_PUr9e32sgzUJkByMpDhw8uPPLerGY4mBqNSiaqw234F0gGdhuvKCWJiHGq7Z64Asj0ZZerQWhp0OT3E6vcdZbprQX8cGXY4OyvX5beAFsS94xWTLhU5RNG_3OrxXnNTOcGL_3N8dJ_XqCwydKbqqrDZBXWmS44R-6hwxjNSFr4Uhv4vdrDfhwRdoTVVl4aPC0G9EXth0J8Yn5PS3BZcjArDjYYN3MaUKVimZ0i_iXopKCZbp2Zm2Le2ic8iYHfKBNIuLvZTXa_FHsorUmnbTL9jdkcdBnLJcoBdFVX2E09ckOeDNGYVq3gZP0rjKcnRvI5mB3UDXeuN8k0QBUx3x2t7gUv1WhIEao9LsKJOGRcnMdvRZuO8HCB8Szr0Ha3X5veGWgs9FEtAa0rV_XbDu5D2UowRqn9w8FDFvkaouch1pDVRmWk3yAEv42g4VHQ6rjiiBYrpISbwA5kMnfFZEYXAf51GGsNouOJKAKP77D_t3ULyorGpf_6OijP440SQdT8DMJ3fkp_fObHKXawLX7CbU8b7o4-CBtXgTjftne-dB8GSNALkR7HLPJ3nY00F4ZUz5i1NaVp1cDR5hUEZz7H8ImS5Yph1ENjyAxe_U&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_112",
    "name": "Old Wesley Rugby Football Club",
    "address": "Donnybrook",
    "latitude": 53.3200902,
    "longitude": -6.232962399999999,
    "rating": 4.5,
    "reviewCount": 153,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5RCf0_GhJxacqK_-wdKLdqlfHfDlLW6yWhi-EDqegv-l6TuzzlfbWRX6aHN1k-tZuN7Bm6PJ1OT2Wm3LZrTjCQFmXv24xOEKKv-_pHK9_FPQDyiMAXeSiBC8RViKsPNHN902JjDfcl55F0hVA15w1dunacaQBpdjlMyr-5YfSWgrycWwBmtS13I0ozPOLy7mRpNFFDvm2PqdwJR0LrKNQH6ocC8sJFHi1NGan_Dthn6CTcchpdN8XUy_aGh1AqVvWK-fEft4dTLx1uUWa-JPLFj-3sh20aprfPcZWZELjn9p0J-Y6dIlUJ9Zg2XJrHssByIVvIK70&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_123",
    "name": "The Art of Coffee",
    "address": "Swan Shopping Centre, Unit 2A, Rathmines, Dublin 6",
    "latitude": 53.323592,
    "longitude": -6.264963099999999,
    "rating": 4.5,
    "reviewCount": 231,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7hU40Il8LuPCAOQlOZFRAz5fPgUaSRTqPVOkuzdfhZ9r4ZN5mnU-FDFjXIXNYmETBzdg6DveV0rn_M-HewpBRPzerCtWZDg5bBdbbVN8A25jas6pU6qDvRWlu9TXXVXdLOVhGV7pjraa7YaSXccQN0hIjzqYxmTfF1br2f1rtZTRxVfo4ogVad-Nydv2Weaum6IIMBZFI83J13HRVtpf1YVhO8lWoKuVcFTqPLfKdeYgc4yv214iaFzj3HZKjVHjuVOS6SGEOUSISIuZ_GaUyyWwMZlcmqHb-qVxam0CdtwnDAMRjFXx7spwCSNzJsDcFMyRLAEWMsAzjHHQPRK0ha6oBnL_sj3T3fJWS1bD9lXsG_ANIv4slnFp_tZdzg5u-syke-KxvkdkABIXJ5cWchCDBc5QXLBpeOKaax05I9lQ_BOmQ7xMMst3-UUjOdVN2yrXZ7BE4cOcqyeZrit_KYjTz6ydfVk26dulOUXerdQ9Jas1--NqWYitiH_yHCXMP8D78qKQFtAnrqATcOh_GZLlL0r_z0ifedQT4uSvLFLR8qlDgAN9eHwzOUyHmJYKfJvqrwDkKcJyPI3I51gWslA9WfQwLhXMh4p55WEu2Qckrn5rF3pcu04sXGpNvpfT9pTQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_128",
    "name": "Urban Health",
    "address": "Fields Terrace, 9 Charleston Road, Ranelagh",
    "latitude": 53.3250144,
    "longitude": -6.2556923,
    "rating": 4.5,
    "reviewCount": 273,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4fNLFU4mtlbwnXneIhfTpGwsVxYcJ_qzHzp5A3nj5hjSC-7-VUh01rSP7llnkzQgpe5DC1pu40AWRaubSQtAL5_0hYf-YygG8svhKHCVBWOr_GaqE5VyDacqo3muX5AnoGzmOi1f7_Lfn9woqRoYak6zZfoMsubpZyfd4zqAY6FwA7ihTBxRUwF1kC_DjuTKfAjOQaaRSBwURNVfX9JpsVid8TYtoyus_Vyiebav0WKtXvzqkFMSzkDOlIeuFELUnFcgieXOS_gCHFyQaEZcO72tRe1yBM2Jq8CUsAW4ia1KTExMNseJgZVB9ZZcjFPhvEV9Qg_oc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_130",
    "name": "3fe Five Points",
    "address": "288A Harold's Cross Road, Harold's Cross, Dublin 6W",
    "latitude": 53.3199524,
    "longitude": -6.2790104,
    "rating": 4.5,
    "reviewCount": 583,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5gBZf1S8KYFwbmCAsH661V7sXXv8OL-x1G7edUnHILT3CsYRFFHhHzkoVcKJubxFFsc_6A5iFzVn_erMOzZEJGSojrblQ1zSHQkE2-8p9TZvSkgxUwfQkodUmRJj92iEndz3WzI_-E5GXu2Que5MCsCfRmTygIKPWyQE9-rNrsCbrQb4ceIULKNiddUwuQYdRUNSlR1iV1Zg46Pfx8FmwUA2LB0-zX5OQ08Tz0GyRmnrmEioBmCsLQf77nfeF1tj36z029mRjl2XX3yyBc3Oew2D-Cio1TyZzTV3oubEUSVLey6HzJvtcWaaQjNad9YyjmMkdYFB32imM7iwgJ12xaCwQSy0K2-6VQ_TI5P4TCq-MR9-dTurF_VEfGR0biizqOLpq4wItS0TS0KGgZ1UtmQ1j7lrEY3tTilK4OE1vV81WAM1F837DVorqKKgZG2NQiBmuW_mNgA9MqXO7valUtSSfHxjgKIGOoXbIIX_ZFkf5sWpXnzi0pRuMFVxxKDSf8uM5bmKgV7hMr_oJ6Tunriev4vUNKNsgWCpZv4U3T7mqxSmiYUNqLW3dnwsFFq9uU4B__rFbP755sl34qJ_-mnuHZLsKl05f1A8lLAMrwzM_w_0Zz-GqKTFxagnR2pDLiCyUl&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_131",
    "name": "HX46 Harold's Cross",
    "address": "46 Harold's Cross Road, Harold's Cross, Dublin 6W",
    "latitude": 53.3275545,
    "longitude": -6.277441399999999,
    "rating": 4.5,
    "reviewCount": 574,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6yJqbxyjvRjQyIDNydD89eEqE-foaYXsTutlpMzmiMLLu6_RhQcm9GAwwplIHoCAu81cSxyXK3O0TujXWECizvn1ALqdG6hHz_ayZJk1u3CF9iJpGyHc_pIEPQHZf0a9ixZmbCYCudZnm-JfuHyZRv0BI98o1WPO7cnHX0pz5cLPrYKcW53WJhhxBmDIS4PtSySCf-JUUj--4BQnU2SV3ZHSoGsrIC4BrYb1cyrHcD7OeshAu6n6J_33uMoL4OAAmiL4zxWbLtxKz2FZmd-Gu6E5R24GCb1DFFbC15PXadhMYER5BxmbLZO84PxtyCMo_IcDMLScg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_139",
    "name": "The Hopsack",
    "address": "Unit 6-7 Swan Shopping Centre, Rathmines, Dublin 6",
    "latitude": 53.3235276,
    "longitude": -6.2651542,
    "rating": 4.5,
    "reviewCount": 120,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7CrJyZ90RVSSbVLAtUF31Hpdzc3pwx_PK1UHagd7wNb8miifoyAboG5Ahj66VjRV_bL_f4Orff-Xiuf9jZ9xp8Iis-riY2BuoEvkOlyoHVRJPO0jZLwRwb9MZmrILiSt0wQYHwxIG-7chfygsIL_lVXvdnsoaEAJ5i61OmJZECI-E34xp9cXGgYDtaz0lvGC76iwcrzCaJbz0Vz-75USa6gXZImzSWwIoQxRVzfYLkCFfsC_LtRt2OEyXFsgK33HQ6ZBkC_jEfLI3b6LFS6UcLzMU7o-9OejmF-SSpsmZRI73sntZBILvXk-QY7dhbCtQqQAkMrXDc9ArKJ2gsjIU09GNNSd0InPspW9BtNRKOKI1Id22AMp4gDxUoFI7sRo5mBlc0uUjKdjzvgJW-GKcrej9EeDOSFQe3bni9P-DGGJK-cVSKGzzefwycWCjNq8VS-ZIkCW2e0bFYRJIy-B0Sl8GcxrPl1swyownfFqczR7qL8s2t6Idw7VKWZ5RST-UISy1g0hdY7e6KMgKZ28hRBmCEs2tgIcKer4kmXBaHmblHSPrka3NFE8l4QGnDNPTMgruH_0Nwg4a04uz9DezUdmU0YwVbCyjPrT4e75jMQQbieeQc7iZWurFbK_jXC55ZKnsm&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_146",
    "name": "Martin B. Slattery",
    "address": "217 Rathmines Road Lower, Dublin 6",
    "latitude": 53.32213459999999,
    "longitude": -6.265879499999999,
    "rating": 4.5,
    "reviewCount": 844,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5DqcPIf9vGdweUijDAeETMTmrLFe05FZLKcXgmMQIR-eJMVvPQAWZ1hmNQHWDe764eddjAqRTKyVShorMjbhqN3aXqhS-MW7wmEWFVPKcL6tO4FSNc8PnAu_NICFbQNPs_Vm_qs5TgCP_4XM9E1UiMnM-gWCPkusJDK8dNAprf3c5pPiFBvlHn34xJuUFJm4mD4LupiuvbJnrqUiBzFfPzHRIU2wIXmWFgFSB6fcMaKfDhiMuP_2oQEBXVHm5jo24VPsCppNytXV-mUujs52k7tlAQzb-xRJXD1GEk-jMgoAe4Zy8VB-n03cOQTrRF0DgFzyX_tRfu7jKe0kztqxH1JJeP864Jp4hjz41b9ramQIXl6bKJRTFG3UZPuascenh-FT-Ajm-iY-x93n1JWrU-ojt7xfEbRcgoiYmtHXpBNVGJR3dBmZAkwt41jTZIrEtRAKCA8FyyFR5_-pa2xkfiQzxJ3I5Pb0CL5O7O97ChB2QleU1y_9KctSMdKfegws4OckSaknzic81rFbmGnMVnAdRlRAQYQwVgdpK6VdKQcVpkthfYC9paPCJEqJ3cqbEf5Vk8wuM4o6OSiDB16bXRRf5HIXVmtu-cCYDGncyzL9-JYzRgGYcchSLYjcKgtml9Sg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_162",
    "name": "Voici Crêperie & Wine Bar",
    "address": "1A Rathgar Road, Dublin 6",
    "latitude": 53.3218536,
    "longitude": -6.266179200000001,
    "rating": 4.5,
    "reviewCount": 951,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7z8_fzfEBWcNJRFx5VFOadOwW0ZUEpj_j263EDSwOZOpoeOCiIcULMCLyoaWYPlgA20Pib-UymilLP0aM_bWsbLucVRFYszI866uZDBR_YhyuBnls--otm7miaGhhAhgWZ7WXuO2MF1nZ-hQ6ttXaN8HxKxaSWXFXhUIHRiLy5_LD7JBe_35cNCqTf1bcG4ZFsLQIJh_e_CKM3iuX7bfeI5S93KLlIUtIqOXtEnsLWhn60aeSBVFTJ0fOwLS82jJJwnYNc58i2j5GzlnCXY7Za77Waaf06DXvcWJAfqk6RPJ8RaQj3oMPRL61eQFBxH4GSF3n0_Bc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_166",
    "name": "Murphy's Gastro Pub Restaurant of Rathmines",
    "address": "93-95 Rathmines Road Upper, Rathmines, Dublin",
    "latitude": 53.3190891,
    "longitude": -6.264588100000001,
    "rating": 4.5,
    "reviewCount": 372,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7fsp2rYiUvfsf9nPbJbC9glCfHCwdnAsoxOJyx5iUJWVZy-bjOZnI1-U7nJrp3B-DC4dwY3sRFnpWU56bBGx8df-VDOyXCuuHUDeu1Og-CDiLq038a5bKWxf6GNB79m4fbzEy-_3z8NyaYoAyHkc-hjfK52dtr5tf_MYleD0z1w7CV6yfruOrbzNWH_vcXPuNhLPAJEnA4X6zovx4_kvAPm1BofV98O2VdY5dhYlhr2Pk0aUSGnxAHmqEiqqfVty3OrINgqt-g-40zS-gZJZZ1mgBwgXPBLKVCUf69IGd1dZjMdCRUAmfkZjdvxWlZIl2EBSPDzEI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_168",
    "name": "Blackbird",
    "address": "82-84, Rathmines Road Lower, Rathmines, Dublin Southside",
    "latitude": 53.32690029999999,
    "longitude": -6.264626399999999,
    "rating": 4.5,
    "reviewCount": 3477,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4XX6k1cwmZE9KOwM6oImWxodoiPWlgrZ-L79ZY9ZTt7VVFScpTuyBIEw5IgSuOoAZTcLUYtJTYBn0prNrjaMChS_w4uWt0CcwSQloBs6M8sRvhu3FVwVU7MDxkhBe9w_YLnz0hPcuaXynlz2Pp6kCT6ssrYesxYvaD4VAl9CWg1WfQvb_wORQD2ewDyO071q0TsWMKGECjJjep53hhlYApobxPNJauzb6HDLL31iMEQ71wcrouop_2SdrLkLkjX9DH1og6fBsfyNMPUkgWPk0N08r_qB-BfJkFblmQ30GSEtQlkqjjj2FgT7uTo_yMUFHZD1aw6Zlbo_R_2N3tk-ISn5MAPtoT0dH1diJNBjasjiRWeorva7XY98dsW1K-tAXUbnAMuqWt227JBIwMgoRKsnbrN9L2cq9lT1pitdpRYrl7K0h6rrncUMYgng36U8BYuj3qqCfl6L7Au3jstSq3bEQqWcrecFAnAmCwbASdYA4Q3R2x46AUUKwTOuz27djpteJWjolRnrbjPKQDTN8ZKNgJHlm-o8Ckw9WaSfI2NnrCtjKipZ9-IfI4G73_tbVD7IbKan_7RV-AaFR59h6JO27F6XATN9pRUtcenFHrghgF8Due_o-FRWMVWNrk6I7eDQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_169",
    "name": "Corrigans",
    "address": "27 Mountpleasant Avenue Lower, Rathmines, Dublin",
    "latitude": 53.3275111,
    "longitude": -6.2617335,
    "rating": 4.5,
    "reviewCount": 284,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4V8GP49RB7uMi4hAnHLajBZbIigsd_x7DhQm7SVByOkWKtbeTmqisNVYnfdnHlFSrBq07M-dyeOn11Lk8poTLpvkQi_EOUHvmQJI4u70q4SLX_w1JXnxPA2l3Op0cH2b5ToWR8ol1YreFJIuMmBIcm5KUOGEe81WG72QfkIRfJq_5TJmErPpmpweCDITsnZOExBoye5WeD5uLyxGlqTI036vt-tJvGo_L5uAU8D-7Eo4mEfiyDOXoGjMOwqrLFYZcER09lIk1o7lvObXthqzyhk9KKJope7qr1OOw82LWwn2gCRIErpSkOliPFNzRKeYpyn5eq7pUc_cTu0lRPtINS_IBdYkoQJgGEKMbMVQlgmeCjU3CEV_eZxMISzI8_NQ5kC4neH3LmTZTW7OCNg1kDUn_PG7h5PLgNSuspRf2qr_OqTFbWshVHn0sG81eU-w4-T5kkaJOYx5pKo0xiuqu2x-dIkpchUcSZqU8-GmRwBxizvlu1RSOQYsDfZU3z24StAZl0tr3wHdAXu3vR-I1__ZLjhXVzO3oxVRGMNZ5Vp1ImACZBSIBVND9Ol9QgGPOcZ_m8HQmKY76Rwh2fDhlQAXzyoityN0UbmuDxSOP3VdPw0vW_1aSJiSW21noN2w2Thw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_172",
    "name": "Brew 204",
    "address": "204 Harold's Cross Road, Harold's Cross, Dublin",
    "latitude": 53.322719,
    "longitude": -6.279462,
    "rating": 4.5,
    "reviewCount": 180,
    "priceLevel": 2,
    "type": [
      "cafe",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6xF4n5F_c4kM8jFDIearMQtI_VtnRgN25FBg-nwNIBcM03Ss4dtRp0CP_bboF5-Yf8c35yxW8GW-ALWs02yI7KLuNXdZewfd4yiQzMAE1-qi1EwAxX2aDqlui_BsPP79uGYhBrrZQ2gmTBVbhLQgPgjdImI2ATqULG2gShSV7y6vR1K0PoHmmgX-7rNM7uS4YueqbJj--ZpILI47xRC7eX8AZB_uMDJrj-ldmiXTC5j3l0NhzC6vDy4SYb_VAzkmqmCGpdCvF4J3Z__0Ggh-VMtXZQceMjKqBNIGCEfBRO6jC5GjX8uC1kg52HfYZ1FSXVf4CdhWA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_176",
    "name": "Clarkes Home Bakery",
    "address": "52/54 New Cabra Road, Cabra East, Dublin 7",
    "latitude": 53.36086359999999,
    "longitude": -6.2834694,
    "rating": 4.5,
    "reviewCount": 810,
    "priceLevel": 1,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU729iem1fajjaS6OkNQ5VP1yV93u5Fn7G4bC5NSt_2qSoCyC02FzcqBpVMcM4R0lS1f5keMJtGot1WXUVKA7OlgpXPPgcY1b1icYDCfRwmltrgUZOo7xIQMBr7TCAnTjOUyXXCcKLFjpopei30VsmKQSUfE108b-AtjGUtswhF9Y30nYgyQSRTFine_4N6PhHZCJwyt3eVclOFOAg2o41u0HyelauVGpavK3jrA4xZv1mk_tt-Ybejt-GVNDbRCluLOybCsOktR8t_eb1Bz8BT1UyGDrKS4K0m_xk2i5x1kGirofwMx7k03_fNdD0F_wiWgrKFPJDjx0kGfosegY3Uj-aid8QoPWFUyPQ7jmpKWWUQUtafR7Jnj0bT9Fkx_7fLop1KDG6FjnAhksSvaZZdYWNmde6fB1Zu91l-64VcvcDl8Fa-X29H7BaT3ERqKkbUfCoHSbBgpewpoiUt2wdz-pXoyn5DZV2X1mButFyKAyeG1MMWurxE6RG_osBeIzhpm-oleTXRXcGbDOrPmH55Cg5ZxjWaW2O8aPndS6I7Mw4LigsIW0MTFu62SJEpyyYRtS9IzZuH-xfnO-rZMPpCWjoe6REMefh_AfAiHA1I4gvuv6P3BcVrcBbW_VqUS7x0XrNgH&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_179",
    "name": "The Chocolate Factory",
    "address": "26 King's Inns Street, Dublin 1",
    "latitude": 53.3513714,
    "longitude": -6.267439500000001,
    "rating": 4.5,
    "reviewCount": 257,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4QYyasCgsGsSI7NBFttlabnIvZ8_ICWiVbxOFUF7iwr3-VgdjEx_UlIwP4HYbzAfAyeVPEbbbrmFiW8xlSwo8y982irrg1TPUCMHxz_lMWztiIPu3vUmF6XfF71cTTQkKUArFuk25vvaeFpxT9hYysbKohEW1DkGchamPlZ-dw3EAVVBiELBq4NFC8hcvrGyr6TXjqltPYVBqwwhYD5Hkwv5fI6gWZZpHvPjOwf0RFMv4ooOHM4tNV6bU62wP03U0-_zpFUSxtmerrOSEVlzcO95QuKhXlcZLG6fWADd_U7WeLMIUFl6iwEepOhhxGuSuydw7EoB4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_181",
    "name": "Casa Mexico Art-promoter",
    "address": "7, 35 Phibsborough Road, North Inner City, Dublin",
    "latitude": 53.3586325,
    "longitude": -6.273474699999999,
    "rating": 4.5,
    "reviewCount": 44,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6vi53Fjgl-ZvkMvjnEUQqXid5Bbfl2dIkDZDA98MiBBP762kBOnd9eIgXRFTwAfJUS43cdOL5g6kD8CwbhsEsIKT5EtaT40xWiytBThlkpwAysSc2kq8iUKJedgxQKPKeaH5yn81OKayb8EEURQjt8Wd2bZlxbcucNCj-7gXkIpMPHneSvpLmhsinfmzPriv3mSHlRD-diFyVv4TzksgdkAjGk4VX2gXWexWWno2s66Reeaf4jbx01S0mQvJLmFvkH_-xkXQTuzFtqrFaPWpToEhzq0vNdTZD8I7ymZjg3z3C8eynMEX9VEXrbEhEMm4_lR42X1Rs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_190",
    "name": "Clement & Pekoe Stores",
    "address": "24-25, 24-25 Blessington Street, Phibsborough, Dublin",
    "latitude": 53.356799,
    "longitude": -6.267588700000002,
    "rating": 4.5,
    "reviewCount": 107,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4SrToxlj_SjE0jBpEV6HdqCorhBfe643OKTaIIQKAFRPOftMFX9h_pJRZh2g9LONrL4MYRYUZiwfLyqfR2ictDufRAWvZ-BBYE9llmICBT2eF2FDCWVMyb4hkgkeWi-B-I7YHlLW7Zdju6b-K4dDnHOv7364Ba-ZkLyEAcQ3tSrYJfHwdjPc6oKtlqKfAqBwqfwerQVXjZI3o6Hly0Ee5rpjnYYjU3h8vybm8xhdWtiGPW-GI-1gYPSxveuu6grKUK7vlZFXJnLqjfFKQ-v76WHc4sJlNTHiXzdCCsxA3sSMJ7my82htWQUZN3lzBtCtoxV37n3BM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_207",
    "name": "The Hut",
    "address": "159 Phibsborough Road, Phibsborough, Dublin",
    "latitude": 53.36095039999999,
    "longitude": -6.2725262,
    "rating": 4.5,
    "reviewCount": 510,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5bwunb7yed1xEREM58-8SnS_1nRmlJ9X0zvp3rnIybGeR2-pl-Hl-v75D3nFpcmc2Sty-6RgnD8nAc2K5XjiqWMR-95N-8KJdZne0rSqbwuuLumhlfGHsZC8zv0j6X3_v7jJnTb8ZErngb4I1spy1N1kI6XUlINHCu5JpqIOQYbF2sjHRiyNSpdEVTBKFLxo7v_C0fk9nkgIgvTjsXF_lJ8Kq5T3F3XMVG_O6QPZ5ZDfnvgeArFrMo0xOfMdEmobH7viBmEl8kGkBCviPeDsGhqMQ3SYtkEMABA84wc081iHQHpBDo41vh3dUwG05OEj6t1CbJloVROAuuoWoNqLlL6ViGIZVnVKNBWhRiyrGKBkqUI2zyjh-38BuizoqFAsuMnJyv1OC8rID3omHdg1SiiDxJs0W2tC6AmRm5ERDEReLC38M8J2bWLWGgMO0k7Byd0uhY03RL-Ycnk_1LUT5HhIqtuaC-zPdXhVbbfg6J1zl_M_qUrhFB0Bw23at06wRgPmqQX2hsItj2AqQBsnbHAXBkutmWJ-u6P1KtTJpIA24PZ911v5s1K7zj49nkgXBma3Sh6z2q1pgFVO1MAkUli7aGaAuv28ymhMnjnxBI9j3JZm11VcIQh1u0Zh2dffP2ag&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_209",
    "name": "Dublin Spurs Lodge",
    "address": "Tom Mayes Pub, 19a Frederick Street North, Dublin 1",
    "latitude": 53.355798,
    "longitude": -6.265248599999999,
    "rating": 4.5,
    "reviewCount": 15,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7Qy3dOs4pAbCbg_S2Y6fMVDPrqPfUz8VTdp4NiUMzc11PgcF080L38aS-Q0_8Lokomt-DGjcnVvCPEFBRIK_ftxxFvDoPWfvpcBt06FF3ZUPFqXjc6VZFpUWLVVQkLJPR3E5E3P7wQR1kspuLg8LzyinSG9kdRAWuwhzJ0A3f9Czr7OA-n1Ydmp69IiP5kYBL0SL10IKBpJEFhb1Tgm-2W2NhBhWLPfj0c4ic-GGqC2vnMB3mykuPY4cGR7z3d2eJEn-77ity5sSr9FtaUHmLRg1M7WmOEprDVwzkQwmUU8BOTd0APlwdTa3Ona8tJoSUMQIQ7-3zavDYABrXrZ5oMrTAAXPC5Grvgy0Rxa6UXfUKMX1IkceTyI7aDO_yrflXZKRJ9Czq8hFZm8eFHggiazn25pDJhXnpyFQCeugD6N6Kr7mQos_4FU3Z1pHvJGlVK2L8kela8W9i5VWQhUZA2C9b595mdyu-b1-hCjOxCAO8DiJNtZsgK710hi3EW8A_bAM_grMNmIA7ZgKP-K3fYO6ZR4OCK7RJ-PAFmuh4mlH-vkCrPTUGRimXBdOr9AkvyclKlIba00p5uIJHWjKZHthNTujVYV2keosU9umq7UdNRPnT5hv5cINda4hNURG38Mw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_215",
    "name": "Phibsborough House",
    "address": "36 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.3588534,
    "longitude": -6.273705699999999,
    "rating": 4.5,
    "reviewCount": 56,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6ugYewrgllmzwflkCsIMLsvqRvYgph30coGj49impItbcrztwxkz3tEaTIZ5FBR23LZEnkJMq2V2O_lh41B_U14uvKFF8BBxX1_u0nTUojl-h37W0lFGOuLJxofIxpD_zwVC6WhwjaZoLMP0rZOb7CVNTOjEbuX2dN-R8-4VrNUzlUztS0TcTz4-Zc6uBdiH3rk4kE6NDU4gEp7tG-1UKLloB67FKk5DdHIu-qADmaXQkYdNDwAoNMDOPSDp21Ir-cUEIbwRAxs3x53QBniQMJ0k49063AeFkgTNxp431dGs-uGlD1PxlR50jsyhxDrvcVYqemzpMTNjSEOeUhlWbYmV9tyc0A649WlA4WuTxh0zoO-b0iAu-oU3ApCx_DRulso9I8V3CwIErJNNzpXgb0D_wm02sgE1NfeLf5QtoqxgusDXcOLW_KEXJUm6naL2e-hj1Ri7IcbOT9dheIRUckxmw5yAfR_xU17nJZqTtTVfAZr0bF_C-lOPCZf4SUvl27A2RGxGz7ig7OWpYaZWiANlgR0WDRIWOWba1O4KN4db6YCNAh3gEzfsdkJ94R-kfHNP5Aio6uP3flZE7GEWA_XAb5JQ39xcPuPkSSXIpTLFNjxkm3xCnqe2uop4SRVsdltA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_219",
    "name": "Noshington Café",
    "address": "186 South Circular Road, Saint Catherine's, Dublin 8",
    "latitude": 53.3315073,
    "longitude": -6.279808,
    "rating": 4.5,
    "reviewCount": 805,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4Bt4ngk_1irM6Mc-YvAZp3tYfTX6g7M8WXL9IdBTYMNmpITofK7Nf4fYgcoH8ABiXRgi_GOt0CbzG7nqvrtZT5IvtGAcNLofjS5Jb4jA10UIwwgPkYmAhheuuRsrFjgkkO2FnxKhh5WpM57AWHOB3YCenbGveaglsDCE7kzI_gRua-HioKTcSANXU4sbP_lLGEwM3zBPrYuvkZPsIZWT_v2wDmQQxANB4NeRpnlWGess0nZF1F-BbuftN2ySBwdC77HbWOW7FmDM7FUYkw7IRTr9mSeNDcxxSBB7kFPfvlP7pJkfUSovk3Ih6pkBJmG377eYOi93I&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_220",
    "name": "Little Bird, coffee & yoga",
    "address": "82 South Circular Road, Portobello, Dublin 8",
    "latitude": 53.3323198,
    "longitude": -6.273660100000001,
    "rating": 4.5,
    "reviewCount": 324,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5hYZPuvJpg6siM66ygBrQe5eSh8J1J3JufpBvYgFMiU3TOXOMqp_aziCCT9vK4ENI-xQk9juevm-1a43WN0P1r6LJV0Rv4MFvpsrOuS46z15cp4mOyxKSw_uFC9odmCsYntrUd_yTxgvAtb2Q4LmfaixmbzxDEzLDnD7LAbOr5OO3VES2X_LUfC9QNHMUb6j9PC5uqVTrEJuDKwONDgyc7g39vAuoTE1x-VJcPq4Q_5R922EFbNdrYY1DSziP383E2-mQ6LLllkkXhwqR_5prfQXOnUjvvEGbaHTTNQQ8AEqCk9v4ZsImMU_DSinwuwiw7pydsDwU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_227",
    "name": "Phoenix Cafe",
    "address": "13-17, 13-17 Newmarket, Dublin 8",
    "latitude": 53.33778479999999,
    "longitude": -6.277199,
    "rating": 4.5,
    "reviewCount": 170,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4CKBV9_Gi94oeQCG9YD5jP2qDycvudEzypsPlTkOuU-ooy6p3e2mB1BzmL7sqcRWqqKMT8uLy2QPlt-fPgGukv6RssfDQCA9JqM5h1JnmHUNLBDVlFO5hoEuOuAz_JiPw7wUVbfUN-elY6q6CcGP9GL5tqYp9SeJ3hXbIay-EK948DM49iHy3C9UwEh904Ujp38xVMbNwHuvG6V4AE2kNfVZkpEeCBBsgLrlKOrcLsLO-ioYYWWvtCT9SQZD0UK66kXbnXWrZ2V4IYmTEx5GeiybmwqS_AbDkRQPD4MVYPP6J93wIc3Q0GYodzK2aPfA-we-HWvqwFEanurxVIMCK-HvTx8oVbQuCRGW1IbK_7RZe1PNhd4jKe5OgxnMVXKf5lckor2AYEAhoWSlBb_quQI3bjKfiOIkvpCqGY8B_ZlY3oea8BS4_IdPU6DhKWGCAVuchyOv8iQbASs7rZqhVJfjUNbI7XmMScvIJuv6_e-EvBlPFOqjbX_MOxHViHMsjcUD8soE9wZeTMoVbcfur2EQQs6xs0aeozPrnJLNBsZJevmTkLugUD7QI8ptKdxor9B2dXkr7xJQw-Ty3LM3wOWVlzFkChN0aEY3T5E6sXI_3SKTweia8VVkt72CuoO5MeNCTL&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_238",
    "name": "Konkan Indian Restaurant Clanbrassil Street",
    "address": "46 Clanbrassil Street Upper, Harold's Cross, Dublin",
    "latitude": 53.3307983,
    "longitude": -6.2750497,
    "rating": 4.5,
    "reviewCount": 636,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4FUeAcMUq4tIhfSurwFDPrFHQEs_W4ue9Y1gGAvNwQU86oWm9ag_uDDtdO6CBFY2NpJ5_PpK19umZO3EKs7i-rer3H3f7P1DIKTH3M07LKWuWtpTaPLrFTFazDHtYOs1MVZj-IuAo4if-CIGiejzjQvQ6UqlDYHstJ4NHmYfOsrW5Tb3992880kswFnwX1gqYvLPDiFF2W0_iVjAJPJgoSP58LMIM4IhuxmF2byKMb9UdBceILoND8Z7MoTkTdbONPj2vUvMSD55eo_BrFa0g7HcaWW0FTfBut9uMKXV14mBMG_aNneLFxXrebtGVO68pJYEbMSek&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_244",
    "name": "Passion 4 Food",
    "address": "27 Clanbrassil Street Lower, Dublin",
    "latitude": 53.33447690000001,
    "longitude": -6.274236399999999,
    "rating": 4.5,
    "reviewCount": 1975,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU70YvoWcxvInkr7dNdsEt7kaRlILBeM1xUHh-8ubV_bbbvRv7P6m1i3xQUZafaJN_3Dctnwl0FTgOrt5OnP2aXmaXQ9Bt3LIxpThXExyYD4ihb9Qs7PdYvPhrFo8d5io1yLaQqC4EVZlb7xd7zwHWZ4FvCGa5_0jQLWa5Da63qIJB4-27nJXDf-LVsUr2jnLLCdK5EA-Z1bYsm8Un06hSpmVCf4oPaNYCTX9lpJpDzPpfF4vpwlOC-Bj0gjOX7cquvRVoSMMYNBk0Wpr2pLDuMoT6A05dGfr8DhTsro8TP4VLQkt-yeX0fbM6M6GvVKGxoK-c5zoTs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_245",
    "name": "Whelan's",
    "address": "25 Wexford Street, Dublin 2",
    "latitude": 53.33658,
    "longitude": -6.265715000000002,
    "rating": 4.5,
    "reviewCount": 5014,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6oYpQkdEej2LyiV7ENr43UrSGyct1hqAggnT5mLWRDCIEKG1VgikfpbP4HLKoFEQxLbRyCRX5wSn_kFORr5sv8QxbXiVk8FJcmG3oKh0DeVeof3Z9Lww_Noo1Hy3qE4_cIVqMYQf3dK2awIGKJIgmXTzldKogGjrUiBkMHr6Q525evSdePbWGCv9ki143Yy5rtxmv_b1IZLxwKZbCVSZ80yYOmjMFITKNIqDfqPS2nwDQNy7mcQEzNNFlv4B9DfBjimnMqddJbFih95_KK2JkB4QAwAKhnUks_LnsSXLrWgVFn7xRTshqDwxJVSHCrl331qlVgwY8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_250",
    "name": "Hang Dai Chinese",
    "address": "20 Camden Street Lower, Dublin",
    "latitude": 53.3352079,
    "longitude": -6.264988199999999,
    "rating": 4.5,
    "reviewCount": 1616,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU74UlUOFwFINvYU4foTEErFJ96uezqHp-Mzeykmyog7FwzyUHi7g9jDfzortq8rzlg4XBI3yQKgMg3FMdzXKe7SwtBdNWtUzrOAURT8rf5yaPqbPy2he46uk6B-jYc_7fZ3UJk0jodMymLzu3U2sbS-WHawBxJ48sFvBKF9bF7Utt20X6kfIwWHOQLuGBrGOnj1vhNri4miGt0A2kSYmDkUf8X4yxSFcvoMqc7CFNB_8BruqZcqkfxKjgVoDQvvG5BrNEti2P70GrFtL7UrAUI_t2r1Bvo5Rq9ugGu22xyEahkY_as1VA140QYLtRGR6pAxyFi9mhA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_2",
    "name": "The Church Café Bar",
    "address": "Jervis Street, North City, Dublin 1",
    "latitude": 53.3486718,
    "longitude": -6.266826099999999,
    "rating": 4.4,
    "reviewCount": 18251,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4ZY9AuyTlQvX5DU9pPFRFTubaOSYv0TSTYpc2V9NL4gSXibQjkSQbG7wIqKqGrhFAhJIkWM-XCwUQy8FL7Wu-Ksj2eUNY-omX_Xa6qom0-ceTxvbZdFMAKKG0oCfA6C4k-QGgd0f5I07lO1LQKDHyuiAXR0dQLjm9DzPHzwlR30kWoxd6pOOxGkd4NWfv5VDxQG7UQXU3p4PAzIU7pEdr-sBrDi5ioOZh8dNlPnz3Hd-mGJ1AYZpQIHzojKopcxYQ82G9ipLUEqYt8OCHEB5jxz8gb7amZNTjBDYLWXfbh13lBN0In6T7-wISctQXeNiooorNlFlk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_5",
    "name": "Chez Max",
    "address": "1 Palace Street, Dublin 2",
    "latitude": 53.343825,
    "longitude": -6.266326,
    "rating": 4.4,
    "reviewCount": 1999,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU55HCqN-2hww1Ytb7ceEMquyK8YELV1PAgky_AWIh47wQVlgjdMpC1ncamLBPeR19KyKGfMgizgr2gTAk9ztOFJ4uZ8bZIqKwAocZGiXkwDYj0_lirC5DtnNSdjbvY84mxwRj6WiTfg1JZDagohB_M9K81hphPKvCaPQw_02VwNM3LBDNYSBykoOGYTSkrtcd-zVkvjPbOLbNBxDBPkfsOw1yaC_fOb3fiK5n2vkPYXgUCH9_vTKDJWM6kbRUvItmkE4mSKmh796aOwH4vXbKEBLr_64V_w_8fKy146zksHbTVBVQFxRxmUxr26Xuf3DM_zrnuscVI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_44",
    "name": "Camden Court Hotel",
    "address": "Camden Street Lower, Dublin",
    "latitude": 53.33321360000001,
    "longitude": -6.264256199999999,
    "rating": 4.4,
    "reviewCount": 2745,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU50ynzrfdNWB87JQmz9vrqTYsFOWhdMTtGtHshPMK_FZ5lGsG7iVM4dNfhY3POHo3CthGyr1VmJsrXdQErPlgcKnEgyGDWaZAsJG7-B_WrJWNYpnLl-_dMls8ahKpocgnF0LdLB0KtHB-8PRcaSvv10SEKB5BoZvtztN0XRVOdEO0yLFz6YQvc128lyjf--YoLJsHuvd8pn7hSFaHs5Tx32LJiQ7wDxUwb9muS_3gDAVQ8A2puw-CK93CLnOkIcxpLdoVZE9jlIn-ytEOs_wk8HCfHcQzsbFthvg_3PC79jgW67AzghjyTMQjuonf8J8GxubknNOqQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_45",
    "name": "Café en Seine",
    "address": "40 Dawson Street, Dublin",
    "latitude": 53.340658,
    "longitude": -6.258619899999999,
    "rating": 4.4,
    "reviewCount": 7358,
    "priceLevel": 3,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5B57ABKLHjsQ8PcuOZXjioOA0gVGrO8K15juAlgZs6M4j7Ez1dChh73WT2xFQGl2UsjuSEI9hVVwiE_ZzD16FUb_dhubwTUoqu-25T_bofUnbhFCNFRFT9Ii-OFJNv8Oj7jopxEWLq4iYJOBv6TdP9qL6B0aweHk8rqHCEVN3zq1jCmq2q82VWlkpvdR69rBeXmfF3MXbWlFHFLJSKb4d8yFN2Mx01vV7Mw3v2rOtSbmoc74z7ixZqnap8I2NE3RJmQalaZKTEEQyj1Gr-25U_V60a7Np0bKZFSSAZxaFp5OMs9SHUzjOLdjxlXiVrU3fKIGTBJ-4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_59",
    "name": "The Dining Room at Fallon & Byrne",
    "address": "11-17, Exchequer Street, Dublin",
    "latitude": 53.343151,
    "longitude": -6.263287000000001,
    "rating": 4.4,
    "reviewCount": 2842,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5w12oK3dCyxVZ6dmrj1Q7bsAjIZxo8OYn91gvs8n35udCpPYj3V8Bemb1pzo_AOMOrgAhyT97y5zjIXMlB_xmry6JZuqLZDAgknBwW8LihAY-f-cg9t20D-voyOizysQ-lnw_17kM-xb_571_1fWgzRRFd1B4xJeK-3AD2rErDgAkabfKh1dx3VPpXxhm4x1QDXuj18tvalsCWq_zGDkOg0rk1kRk4PlNN8jEDqLop2BpYsoaNOPj2tDXXq_USocvQ9XNxKEjudsj37riPpw1jwZ3CWLKDhmhLWQxqWaDm4cRt9hjiwjEnHmXrA8BQuCY4-9CMQnI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_61",
    "name": "FIRE Steakhouse Restaurant & Bar Dublin",
    "address": "The Mansion House, Dawson Street, Dublin 2",
    "latitude": 53.3405397,
    "longitude": -6.257922199999999,
    "rating": 4.4,
    "reviewCount": 4031,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6QpgAs128Zd8n18yqUO-_M-ydfQYNoUbG9DWkutHMhhnQkfrNtf-3zFndD8kMN04SIAbzd2-ZTeu3tzAQ0TlbX2F1uNQ4x0dIXh3Zps-84jSCDqDoD4M9tX0Vy1Czxff9y3MC2Nf_ZzELlmXpKyLfNa5_YAh934Q7_ZyM4pL57CQDLS-0hlelMI4AHuJFEhee8fR43s4Coo7DkNIT688lyRT8mBOo6bTjGr8jZXCZIRkKQLU5yRxB4JHbvbCHq1O-3zpb90WlMv_5alTHF8_FB-NmscGw6Ir352fgm1uPkWsCrq4PCYnPi-N-50kOiC9AVS5iyNFM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_63",
    "name": "Peploe's St Stephens Green",
    "address": "16 Saint Stephen's Green, Dublin",
    "latitude": 53.33949,
    "longitude": -6.25817,
    "rating": 4.4,
    "reviewCount": 958,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU65VWSiMMb45LTnJN9ItWDuEI6czIxL8JSp6t7tM7oxM2Iux_3R3gOEHKe3rf13TSFTQl6Qi5ZUb-_cuqHR--0u3MKeeYkxnZGCZLbwP1gqiHc6DpgqiVnSlZMwU6TPdb9JipCYJ13AzvSXuUgGLcPZWWwxHaPMsOjnb39k_r7T91EmkomPbf4eAPR3MZpwj6V-q-WKJBaVPjIFDwKaBQVrEX9WQokzL_t2daGKDmRT34nZkCzrV2NaLKszJhzAlTf6R8QsPQ8jAYGwETJ1_kpeyiw0_NPf_6S4Piw2hUJcrLAzQcZf2pqK4CErdkZ13WUL5nN26cs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_65",
    "name": "Buswells Hotel",
    "address": "23-27, Molesworth Street, Dublin 2",
    "latitude": 53.340796,
    "longitude": -6.2557584,
    "rating": 4.4,
    "reviewCount": 1357,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7-9PdoLh87Fxw2sUDsVFeETyQ3rWsCg-VVR2vo2eqsZ7B_7LVu6y4SLukW8fyoQvtor6BsTMOzoeuurOJSRSQmVKLyDH8HYxmoMiwYmBLluxIThnViNBu36WmyDeLP57aWuM6v9wTp1iP3juAeXsEfk0hpU1T80XbQKiVJgJ1Uq-v5H2I_wePyEWEF_rjfNA-x8xva1A6arUEAVfuUMohpS1CP8q04gMNlofdRof-kjHqGCdHTdPn4za4Y_7W9PUSeqxZ8MXnQfYQ3BD5oyDV-oP-YMg6g49JYEu0A_rWCmcEzcgEcpxyd_AbXFTI5tFWAJauABWA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_85",
    "name": "The Orange Goat - Ballsbridge",
    "address": "50 Serpentine Avenue, Dublin 4",
    "latitude": 53.3304233,
    "longitude": -6.2250796,
    "rating": 4.4,
    "reviewCount": 551,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6mWR9AlvAr78imr97-EA6U1OvzoZNoUnPwCGEYbcx1iUIh8e6i1bn0HJnutiZwMX9vDwZIUzVi6XrdjMNpJGwmE4d4BQgfgR5YV56AEdwurK2TVulzaY-dbJzoJLQQkTNXVvu-z3leNhn-ChBWaL1J39Z66yuVzZDvKZX6PTAGptrZR9ohQOKMJzO3rlguHMhS2D8M5PAiYx3DEav0ifC50RlRpnZJmdYJXKnx5IvSWbar84EzXnbs4IVRggZBqaaF-WGvZvhwax8Z3fX9FjfAKglbRc_MbDdkZbhLM6LTQksgRzBuj0hcXdBP6dVdW2kIn3fJGLw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_86",
    "name": "Butlers Chocolate Café",
    "address": "Unit 1A, New Pembroke Street East, Shelbourne Road, Ballsbridge",
    "latitude": 53.3314854,
    "longitude": -6.232133799999998,
    "rating": 4.4,
    "reviewCount": 377,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6TdDFc010ALPt43BWedXbMrp8paEA7VxzfP7bXUrOioPzAIEVUBKA6QZiI32Lub1Lygon_dJ7CasPiYeo-ieYDYg7VYOSPGtIAyBQ8M_QUPqvNOLokPNvgkuZse-gmv_Vrxqi2ZKVcvulCTb_kOsvdoX5yruPB86MjYt8ODXCYQzrygL_jp6qx7TunZLD3qqpMJAWXGBlRZ-KLxYGUAq_3WnzLesq7bypL3G4kjvsEswlj1zUWZmWk2Zh0XBsHfWzb1z_dATAngj78Hf0jb7Px3qI_yT0d36QfnzIdQ1yK6I_J2iP-4D1RbT8n49ZET36piBYeiSc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_92",
    "name": "Herbert Park Hotel & Park Residence",
    "address": "Ballsbridge Terrace, Ballsbridge, Dublin 4",
    "latitude": 53.3282436,
    "longitude": -6.2323312,
    "rating": 4.4,
    "reviewCount": 1737,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6VGlZY3m8dV2s5ypAjYkPsCH0GnutXiTp6yTZyiNZ9eCpntRpmEjvVz8b2jd2G13b1MwWtcQaDr4C3dEV58jHJs-olyyIdMNG6SuzXJfw0NLNakzbAdN0Jm73lSAPaEW8Yd3oH2Mbe1haMTgildGwHmdbgFSeqBYHigk_zKUlZVFlJUsGBhgH-0X_y-6DY7_Yga4Z3V7UZ_19hfqZUXoEkRW4XM9WzQryBsN7-tWWyikiD_yXozxyIjfC5s7ta6XA0-mDQpr23jM8-VDrD_eoBt1UxdgNpTJIkhvtaZJt6vZPow8FyvgsUDHYpkFnlqJaP83X2SG4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_95",
    "name": "Pembroke Townhouse Dublin",
    "address": "88 Pembroke Road, Dublin",
    "latitude": 53.332506,
    "longitude": -6.237973399999998,
    "rating": 4.4,
    "reviewCount": 556,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7ZIeQ2ovl_JUFXSdE-R9l4ljsTyPBCMHmPZLa_bDVo6DBnZQqxMMTch6jkc6uQ8NiksUEs5mngg2npGqF1yQkhBE1gS4Gk-GVk1A8-WQ3ozTLQjLggq2Qqtj2JmbJLm087X_MMIhFISTsFo581XsInnuVuqi2L1vyGovvhPk-LBlnE5RxLCjA4HbvsZ5GwZLXOpAEbpVp5qwiSjHdNyApMjPXDbgD58KcM47Qh2eIJzRqQBRxA-lTZYtaJWd3rmnxoCHVYo9F1e-G4yU-00t3qV0OKapQIhU_oT0CNCmIEPntZwikR74RAijdBgO9WjgvDKYkextI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_98",
    "name": "Seasons Restaurant",
    "address": "4 Simmonscourt Road, Dublin 4",
    "latitude": 53.3266895,
    "longitude": -6.2259682,
    "rating": 4.4,
    "reviewCount": 29,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5zGSrPKuklbYp4EboXn-o0fLDrZvsZFPndsfi_GltYI8h-TR8EApKnWHvCIn4WcA2chhVgosmzCxeDjB7I0_ufmnoPL0_kEKzDbadorFxC3R80OEN0rI-unvUtoRSGovN2z1PtfpUwJ1sF2bVNAkbuxILaP5deM4RS_9LcbR_aVL5JCF3ocjRoBXSbngDUKLQ0M0kwKyNqJIlLRmzu2hoc3OL4RBKywfUlYQHbtRzNE_I6Yinmr6DAHUWBsGzFqvIwoIOc4jOv55ZNK-YbagcSmbTVTw1auoiqDtvENyxVwesL9M5aFl6M5ojqUx2Gud-udOh94M7NFjoblo_1xc7PoTwY4IqghQyfr3imnstiNHGOCLHJSR15e1gkqLsnnPv7ru6A0oSVE84mBC1ZyZm_YZOe3wzOLgpeKo1qmvFnN1C5w2UC0UTmi8gOh65l0f3VIFztZfEwwFlJOnis6Fcp6T-RhcY6CvIaMIQI2svf2LeuSO6REt_ebpbdGHvj_IrPOBzB13Q81a9A-H04m3idW_GiNMUYx5-HYlLrkjv3D1pvZEu7t9Fu0dRHAbCvHTgbrBXZZ9NkQKWJYusBeALWBB0Aqp57tZISb6WrMVjOSUYZ8nKoIO2AzLoS9aE3yrcYvw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_113",
    "name": "Pembroke Wanderers Hockey Club",
    "address": "27A Serpentine Avenue, Ballsbridge, Dublin 4",
    "latitude": 53.3290259,
    "longitude": -6.224090800000001,
    "rating": 4.4,
    "reviewCount": 250,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU62mK7tKImbnNB-7pc5bYfYS-naE7Ymum_7c4GUKrPess8BeVBMygeNgfTXyuWxZY-e1rryKna5CE2Gt8FOgM0n6bzMC6WiCTYdWEXBgx2G7hy1EM91y341obzxZpNpXj3NT3wdzBt17KMybhm3Vo_W8TOjxFxRSE0sZwmhQGBdq9nZBa3RxJaVs5rgHcvoh0P7hLdZPMX9VC7jL0sVWJcIQ812fK7o8cOvOBpA3KzhU91ps3UbnjudyDi-jKsTXptzK21MkQt0ziPgDtEV7AyFTmXvvHiR3ZdxDxFscaJ67AniiIEE0yl_WwCvccWeBHs9m48t8QQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_121",
    "name": "McCloskeys",
    "address": "83 Morehampton Road, Dublin 4",
    "latitude": 53.3244873,
    "longitude": -6.2404168,
    "rating": 4.4,
    "reviewCount": 178,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4dKi03nBLCOM0_660mBW4afAlHfpWiPTaqIg8kXhG2QdfJQXuQFSZkxVtGZZErj2JQPrNSPFgvBRxr25cFJytywDEFnKE6XiZ0Cp0SAzwCNc4ZliaO1MAM0vd3ijptBsy0co1XFnOPbR2VqFPNODaWLCZvn8ZBG1c2b09Co-C0L9e4UT-hdn3oDIUBkzlE9pBvLzIYOPFrzER4mHtbVDCl5HHbDm0adDbz9sr9xbkK7YYOS3-jzkcvlE5O9lT2iBPA-8QTWdZI1p9wbUWzgu74upXBCbYd7xDgJWFGv_MYBsPl7XLhzVlFZCla3BpnWiihm4h-4UnU08NbA3t2EiYqlRPvaERmkVSIzq5vgdpvSvfyxnTqMPXXz0PZdZ5gg-dYS6fgQAyGzFLTLwB0APWh-EPbxHo0zxVyqgOkcZFbHtfC-oEXSvqF823kGNR-TXJwjwz8UpSc9-WsE2htuhEwoymCserKrD5P7yfqcwHf7Cr2EfojysRGj2V6WqbbfXlMOfgIRtIeblqQB-dIlS6_N1a4co291krg0VChDz2dNb9VyFLItnE5x7zk1OCMqnEFT2ouGC9PS7mdpkzNlK_RxJ8vkWjadn0LxeXzs-5Rpv6Vl3LkuUCR6Tf21a1iqQrVzQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_135",
    "name": "Butlers Chocolate Café",
    "address": "61 Ranelagh, Dublin 6",
    "latitude": 53.3245178,
    "longitude": -6.253515999999999,
    "rating": 4.4,
    "reviewCount": 439,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU43KferclzbiDKemVIeuEXwjH7DK0X93ki2QhrkXwS3yOgBie6049LGR-KHPym-8Q743kX7vWAo0y-a4ShtZBHiXtVxbLFZ2By4_BtWhFrI2qJUexUwhwZyBt3inxj4efuCRfOMArxvDx5peEz-QRM7RfRBe1JOp6eDPkGZrRzF2xW8AFvNu-7MsOVXo1qINlfBTQMGHr3t0yFNwx1Y7EGVo38mJR56AQSvinpTJ2g8kpJwYWb75O87yK7SY0puwpD9nX5sXrwOgx3tvrOvXgCPunLGWGGua4n0EY1ntvWQvKZuGD0PHkyNTAUToQVzsxcAfpeR75I&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_142",
    "name": "Uppercross House Hotel",
    "address": "26-32 Rathmines Road Upper, Rathmines, Dublin 6",
    "latitude": 53.3208552,
    "longitude": -6.2651864,
    "rating": 4.4,
    "reviewCount": 425,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6VwgkTUSvCFu0G9Rnh9uSq9oIBtj7eJfHreS5ZhTQnia5HSbWVOfscqd8x0AYBwc1tSSEMd8iGsUU90T5WQa344IeSUnKDUe5gvq2pRY2yG63B73TytsZ614cMwJb4B-u7x3wcw8ZEawhiR0YV1U58wKcFV5yDQTLl8W1NcqMHMkwpF3i-GOsnL_lYxnm20c8kGMtQJiI0AtJYIFgctzvXGquYPla-qcpRHoPXYBwpd8INJNAMIrwdUKLgwkCmuTuPYldhb4M2Mo5hMFDan8S8rKbZ861ErSdL3Pd5jf3weTrFMKJnRRL67OuQu5uZhgdlor4Nkb8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_143",
    "name": "Rody Bolands",
    "address": "12-14 Rathmines Road Upper, Rathmines",
    "latitude": 53.3211439,
    "longitude": -6.265382400000001,
    "rating": 4.4,
    "reviewCount": 1292,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6NcerKcri02l3q6P1OyyfJG7F9CMsAtF6mICH-sPKIu1E1gTpgCFbhr4xSvIsw9akph4MQ9xZAn1-hKeNxd4lhtrwn7qOjHSYYPKhnSPhCkbHQNjXIbBCDigywzO8JIfmCreMW2lfUOn-rNiomJzgkkGULwEP2tQuEcuS4ASNVztFpHG7DYECjr6s5AMlaqRtReNlZsGThqMtDG6PkBMkGwLlD2yewWoy7ggrkodjnJKEjRnqRmqZrTjFsh3El2gCPPfBm8HuU_xF0UTJ4NBKBNt8ZtX_K82wCKB459Y-giUh4kJEPMQZxrJlplmzbJyAL6L_i7Tc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_145",
    "name": "Kinara Kitchen",
    "address": "17 Ranelagh Road, Ranelagh, Dublin 6",
    "latitude": 53.3257241,
    "longitude": -6.255564499999999,
    "rating": 4.4,
    "reviewCount": 749,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4v2JT4VRYiOqtCHvDTMvACJq3GcKLlGP05fYwcsOAWao0wJg6f3r8D-XwOi_kNHl2eoNs7Dqg1PInfkrYEmGKIgsi2gWfzdOwR5Pvr4GixhFSVhh3oYnhFRtd0ZlSOvU6srEbiXjDqyzmILWRfs_z44IW3X42oW-DZHEvFiDIOw2V3HaTE2Q70DIV72jFk6zL7-XtgfxbkKHYWGEha7GfPOSqHxaxT-wDICzQnhtouTwxFGZ_znHVA-wMVN0fXNVA_fdIueDHAp7hZUeCCGEUL4eZLt4Rzyzlywr-8AesjEAdn1uaFbi_owjXHEPNLgG-YnODKkcc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_156",
    "name": "Peggy Kellys Pub",
    "address": "161 Harold's Cross Road, Harold's Cross, Dublin",
    "latitude": 53.32371,
    "longitude": -6.278570799999999,
    "rating": 4.4,
    "reviewCount": 1195,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5skkIGxeMWScIxK0HQ4d-piupj5Ni_H9xcz7C5Ce_powNS0yb0Ms-smY4OuzYwoiSJjIOovwfdpZY6YZuNKH8Pi5vDoCqOznwAxyEulN_svowZfWNxvZKdt9CDQ105jcpqAvATKUAtXB2czbiTXYLJFUiUC_IBXv-_JALAmr0abRJ4vLxiESYGuDOUFE6Bdh925OisIooc1Zb_xuZsI5UjEtU4V6HbKgtrN0Zh-XSLCYq5wlL3y8nnvZ73axLx4Ip-QN4Io0K1rIYY7WpQXy9h_XllGD6o_afHxiflt5tg-u2oYzHawQITwMJU6mbQEIPFy7aIyiA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_160",
    "name": "Grace's Bar & Lounge",
    "address": "2 Rathgar Road, Rathmines, Dublin 6",
    "latitude": 53.32176579999999,
    "longitude": -6.2664355,
    "rating": 4.4,
    "reviewCount": 290,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4DddmY6erjfSmur3dwP4u2GNnUJ_H-80897-_benH_rwJyfgMW2lou8thsk8JSilJWmT2DtL5VcYNHZ-Lt0uPY4qCbbWyGjUfp_MWcTsOS_TfRdzGqMWQixPNPDBbXuMgo1ppSCws3AuhS85ndhYtpFIz0flwFG-ifII65FsY3-udZT8BBuGQ2VNvhtf1NTQ3jl6nez2a44flY-dHXJS3QsidCX5iKK2EyuLFpC-5w473frHASmvNGcEeccyo9IPovFNmeaG3nd6Kce2pXykcShilWwxy8yEcw6SEFOUHMGpYCsAujaaO2pt509JzdclST6kPfGr4G-sxIKvKQRA_TpS04AYL546l7GOS4MfHAQEhvjdUTNPEB_0UhdlmXn5H9T0iNfWL_u4iBB8TygHk5vzuJI7aseqGWj1nMjtRtXQR-IeQTqynRWzQOQ_Fp1Xud2OOs_5rqxmSpIkfENEqb5fRRkxlH-MKiaJhvqtNOp7-Fv_udonNvBBsqWdy6eZHdRN1NPDL-zXmf2n3vMmwTJIx-oJcYaGvSDIvWSpOdQf0TTZt0i25lt8PSPyIyZ523I6_MVexPKblb6h5ujHMr4TPB1z-QJPtCFiezXzwxznBv2gFa2T1-sofS2StrE5C0mA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_161",
    "name": "Stella Cocktail Club",
    "address": "207 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.3223724,
    "longitude": -6.265903900000001,
    "rating": 4.4,
    "reviewCount": 208,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7e45ANoDnMaW0OW7xRzhND6cgfCY4uzcsWgbpLiiRrfn0cV3j19uenPlnsN4Flf6Wi3bZkmgY61_wfiIyqTFAiMrLajIQ2hmgiTBsc1_bodmJRXdsnuGRouFvsa08iZzCgUwTcaAeEXBB6qC3jX93jqbetqYCAIiOxMmHmS8BuJBGmeb9_YoNVoTh_WmWryfvThDBy8zTcaK87jfQyAVHQOy9i4ZyP8VW143QrYPjt3gW5dMgLmpNUmtuWhDUe31dYdhuVXpamu0mX61cwnm_Cep-pO8zigTDMX2Qj2q1dS-tXuw3HVw7x4jme8H08kzd041Ua_mU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_174",
    "name": "The Back Page",
    "address": "199 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.3585165,
    "longitude": -6.273058799999998,
    "rating": 4.4,
    "reviewCount": 2742,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6SQnObQxSkRZFlGIJfDtnAW03DFWtc1aNvqfxLdWNHqlfirhOXEMQl0BKbxB1hMkrBIHPVRyFshxMgifq2nQES0168XDZGTei_jO-xh_wZCGCRZ7eXuVxCPq4SxBfJgsFmSbsTk6HeHf55PcZIVuOvprL8XsoiWUU1ATdQq6NgCO5sQH6NDN77FbSQHM4J2X2EgFu5h5KCc3NP-4DwVoW23GQUPGp0NPH88APuzijGYv0M2WLSivg7apm4aFuobxA_4eSggZxbocmMfIc076u6GoVu9bZYFM_tIOg27cASNcTM_lbSSYEskeWEbk-P1xT2-8dAJGU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_184",
    "name": "Coco cha coffee & confectionery",
    "address": "344 North Circular Road, Phibsborough, Dublin 7",
    "latitude": 53.3606938,
    "longitude": -6.273840799999999,
    "rating": 4.4,
    "reviewCount": 8,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU58Y7956BZis6zcTy3BvesYQVxM3Q5V5qkNwkmLzJzOonsuIBc1hruL8qOTK7-FQyALnx4Jn6MBBx3wCbLCJJBJsarnNForTKHNhEK2WlJnH1QCreZRzFx3UE495qwo9iu60DWrOMOLj6kFdJZjRzfIt4roE8MhAOl5WBMJICX26jWpK4Jp60YL9ttKRb5Su4ntrSJxoU_oJ-Bhy-pHh8bu1XpkWHiHlJ1FNrUVuzrJ46NxTCy8uxp0hTCEOUlp_azcdo81ZZ3UC921VWC1s6V70G9zgQDdO4cXPyAUI7dzQ0LDlLpjdIoPu4_mqoNsO4-913SSAJg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_193",
    "name": "The Bernard Shaw",
    "address": "Cross Guns Bridge, Drumcondra, Dublin 9",
    "latitude": 53.36468970000001,
    "longitude": -6.271210099999999,
    "rating": 4.4,
    "reviewCount": 5302,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6ihncCiTpAW8AGxfzbqQ-vLsRZiOzOxKQJa9NwEnWCfS3J57nobC7tfk-bf062F4bb9oIaOjZEwaUxeA53GPje54LZpeBMpeglkNlfbNz5x8uLRiTtzd4ReXHnUxdbEJXjRXca2asiYJlK5ACfodf8G8hDWg-72G3xuBFEmPZqVK1tEFqRpaNur4rrGkTxFgpTk9CA6w8hWBbpHdlGykvV954pBZpv0e8jzLnTP2D5ADrKWGNmyPixCRGQLr1XT8Kah8ohmt_QMgW3drIEJTkzwyn0pW-Azjf1ciKMK9C3NHSV7kBLHr6Y9ku0NGcQ3bvAYcA0PN0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_208",
    "name": "Eatyard",
    "address": "The Bernard shaw, Drumcondra",
    "latitude": 53.3646954,
    "longitude": -6.271309599999999,
    "rating": 4.4,
    "reviewCount": 1109,
    "priceLevel": 2,
    "type": [
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4PTUL-OtNakIcyi1feYYUyFVGvSYbnpfNx9dUcFRpyR0uX_Efwwa0-KYTzQS89R8pYftVyw1exNmxIV0qqv3MSpTGWjnyx_phdHIWCIOAtpRUwM1gleQmfdtuUAkS-t_BCDLyUuU27EZgez8HlXBYMBUIh9e_6nb8MuN4XS5GXTPk3GtwY4yDYMP0Pm833upSq9ySYOzil5JnVJ98zNvmyTkrWWBTLZpdsaZo2RGsaiPdEBmAVABcziVxBOM52JsTHefrbrLQDXjOLpDSJzp77X3pkYUmpkuwILMRebbl2MlDXGckf4k4XXQ4i9u903qMq7pCVBkc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_216",
    "name": "Clarkes",
    "address": "36 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.35880999999999,
    "longitude": -6.273421999999998,
    "rating": 4.4,
    "reviewCount": 183,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4Xqw5o2avHBbeBbHo-mcgtXbhrLGnzMs5DiLMZLP2YN-4IA6X6TsbA9E6xgdZtnIKX4ekYeaa0Jq-RMU-3VbzWyE9c2j3KlNvd_OPLoZEXWW-b-XkHTYwLHjqOvVVV4khMT-zTKBpeyBVAobA9nXgCZV6h0bcHLLICTO2_zOKMcmTjJbF-eqUB7rqxzhLVaoqCLA8jc_qSiI5IzfCy7Acaue0P2DDb_bhqYjgUPUcgoFtCuwuMPr1ANyUbOny92CiTSHRF6bKyX9lW1kjX53NL3fRkmZAzHTQVgLWP_5rvf0ylB4pAV6UBUTHoE6ynbAMFH4P71ryRtjFFSuN408xnqtFemTOj--n9Z982xaep8uRa-EfaQHNRZ--KMTZ0udcA-NgrQmrsxueY1Y_SJRgI2PPVnDa1gfiuuqvUS0PFroA-nYwVIp73qf88wAdy0yEjmkwwqgFdllljtxuSqCv123HdHkcEJQKXdAIV-_sc4GpLE-qA_tn7ffva_AJhudRHuoWrXj_v6aVITJ8xa9cTj1lzvwT98RSZ5PbEp3W9qiXHMG0dAfrUAd474Q0zgbFf9pCowsktRwDPTMTo9g1_r1fC3y-c_xRLWfeHbmHw3Ze-gZbuxY2R9tYs9rNJA00SZw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_221",
    "name": "Board",
    "address": "29 Clanbrassil Street Upper, Harold's Cross, Dublin 8",
    "latitude": 53.33041859999999,
    "longitude": -6.275619700000001,
    "rating": 4.4,
    "reviewCount": 953,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4wqxApD2JmvT5SSIX0SmOUFlO5YQ_JAAzBw1oqggSBR5cys5ALNNt7Y8Df7wFHTIlmzxDqHmwT3bkF2NfMky_wi8zWWYmD5bss2oF_IZCbptmV71otumwO4A6m2XUKBNpGkNXHTvxzilSulgRT5Bi5M68CWKWLwoo04WUqq5feSJIEuCClEXwdfyPHha0HP-ZOpLTzsJFyTrd6lIrXOw3X7F82aD0dgE1MR9xyEeYagRGzo9oxe5NXFRbYbOxX33ChLNB34Bo6lYI8Uo8JOTRFteF7cr1sBMSZQ_Q0-7g9NpWLe4OoKC60lZ_ZlY_4vB0BWNYIlfM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_223",
    "name": "Brother Hubbard (South)",
    "address": "46 Harrington Street, Portobello, Dublin 8",
    "latitude": 53.3327441,
    "longitude": -6.2656385,
    "rating": 4.4,
    "reviewCount": 1236,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU67zdBE7VGUr2SyhPr5F-rTO2MkvAKOi0QfWJQZojht_y6ZttHulh45wG5PxEdEy9VSNcpwC9FqqD0K_NC03OR5ryhTJmGN0F7aDm4ac8A4J-lR3xfE49yKltyABc07SaTneB_kklp6bPd4nVmAOoZbNa91b0smoTj2yV5BMec2j3KDmW87YmPy7pI9LFx1MK1j6JO6kr13XuuherGqT-9oGSP52A3ugED_4quLY-COMXiaGTJmSHAWDORRMNAoO6CUJExjF5giDeEl0BpOBNR5uhxoigIuonejlYSMmdmkDFtvoastXjYMU_4pneyRz9iSNHkKsK4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_1",
    "name": "The Fleet Hotel Temple Bar",
    "address": "19 - 20, Fleet Street, Temple Bar, Dublin",
    "latitude": 53.345875,
    "longitude": -6.259792900000001,
    "rating": 4.3,
    "reviewCount": 1230,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5HTwxcYA7Fcf9UhJ3mqFM-i8K5Cdou5NmZ7iUa8jbqGjwyNfhCQtZ70isC6Z8B_uAj3rw06BZqRhtdiJC63MPD6r6_S3HrRk5Ftibb-wuaOnb13j4OkbCKD7sOrLk3FzbVdfxd12AqKKHMR5vM_Ose-4Nis3EEYndpkOYrM1ARK0pRGNcwm2OCf04X6AmLvgvtfuNSGtSoUkmgAxLJGP7F0dRb3NweGcTEkqAC6j_tXrxgy_a13cKRI7Qpf6WzbpJupfTtcisbb59ePtQs93L0MatEEEqMFmPN5YLdb2LchWRBPfQ-tB1Q8hTdkObUy_87JWVqwqI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_3",
    "name": "Kilkenny Design",
    "address": "6 Nassau Street, Dublin 2",
    "latitude": 53.3421558,
    "longitude": -6.2553189,
    "rating": 4.3,
    "reviewCount": 2441,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4VDOh2psnU6bVrFil1t5d0uBlNctd_NZ1k7O0n7pJlh-4M4jM2KKE9Rkm-8ofQCXdJ6lJXZKGA6Ro93sHSQdeTAZkBTjztUWUumGmJ5QLt4xAQAOnh_yFZpylE9ZnhBE8T04sgz_iEmyUOsqkywiEfSyvCZ7l5X84d3O2914L96VCRudotjFn80eYzqLTY8UW38b4eGkuIs_3wXuLSI-hVlFObUVoXzYKtu4l9CR-rZXo5nGkWClTktUnpmVD6jMne389h_4suIRJkUTPgRnMXBcfkWII1OG_CY9hAkzliapurE6qG85S5HD-AbM7njU1IQMDAtTQXtMAOyL6HR6L0v66IUz1j8eYkNPyrWo0M6utmEVdlgVBwfwC4PuVn05fyANddym5_zmEvSqakeDvMLugbq69fE1ozJK3H3B0QJqSXSluvuzmIMUnRR0Gx_UWcRQpGNk1_UM6Re5LkEWfczRKqOkmpS7welxXq8nOEwt7LwCScyM0qonNY20ZUNOlagHACnpSCcRNeKklTtVLvEcnEtrHpgxqhX0mQn5hSa3MpYEaCPz7GvpQcxa_kGVAw65IgeN2TflwVzR1vpI0pQY_9ZGrquxq8sXLh4pfqoXm-cnqcSpwReUhd9zO4pO8whg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_4",
    "name": "Bewley's Grafton Street",
    "address": "78-79, Grafton Street, Dublin",
    "latitude": 53.34172019999999,
    "longitude": -6.260290299999999,
    "rating": 4.3,
    "reviewCount": 5655,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6RqjEvlZNcM1RlP7aGWgebtJGko_0rUr31O0S6ZN4sobyKML3QcY2J_V15jq12z_Snc5Q_4D32ivlST2Xc_jskFu5bpWUpBtk5-HB8f5AALJaPHUntuNNrqb7KxKnq4acSphG4C57BKdx-qEpGYHGQ7Kjt2_Q6kaUPR0vaHb0oJ35CFlLqZu-q-ytcmBrZvkgqlPr9P1n6v2u2n4Ouv-lofsMVGxzUNf6agdyPUK80FIS41qW3OZsunDdfeIQAjzTlwLWLLHpPpnUYI59nLnkdj7HAbhfLeoL9ML8ZlKtXcGTqyqAzlYA8reirh2wxERQhw6rmfHM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_7",
    "name": "l'Gueuleton",
    "address": "1 Fade Street, Dublin 2",
    "latitude": 53.3419748,
    "longitude": -6.264266999999999,
    "rating": 4.3,
    "reviewCount": 1284,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6AGXE8Wg4be7cMNsog_4-wsHX1tR-r-G5m9HAs8JeQcwhf_xDW1ncIblUvMzE78fSTuQqtZb-MnLtQr9qm9CAQEOOsieJ2bXaJm2OuaG3FI-gxjLW4YjRIIzNcGHul2mJdEMAg5KonQWnDQ5ll_qCUqXQPc_BwBLJCz0n9ZNnPYIhSN3hgbDGhRitOcwg_81xgwIBoeAUlg9wYZ5x8sv3OcGk0aqxvGvh24pocB_db0lb00p7YuKRXnd83-1QJM1BjU-ZMBujwS61TcIpEqG-iBtqAWaM2OstjEDhf3v5UQDb20gWedrAS2RNz6tseGaqj62zLuCk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_8",
    "name": "Bad Ass Cafe",
    "address": "9-11 Crown Alley, Temple Bar, Dublin",
    "latitude": 53.3453472,
    "longitude": -6.262899999999999,
    "rating": 4.3,
    "reviewCount": 2938,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6s7k-QoE5nB9ft3rTH9q9guq5wzVjbeB0Jb4OAC7vgMXIdOcJ3FES8ak3fRBOT5Ue0iO8n-VD7k7jUuLjhS_Ib8CQe4iazUwx4ws5WqnaHubq48Hit5SDcQvnj8UhkmBWqwvKT3AIo2ngqPnP19JUfyMGYYL6nlHLDTPyu8l5rSZJYaGMJuVMqN7ACR7fbPR7qUwcbZdHuAGeDmNQXa0Rp1ndJQQOSGBekphqhURXsKFERE5H3T_o3wO1ORWOke47WQDn6EMRjwodfNtg5TXuppWowZfJXvYnbKPCMhWQLNBTpjYNLiSjT-wL4ISB8Dvv8Bx8HYeznI1jzRiuf7PwYg7oLoC4vjsGVBBLQuHiSVOae0OT47rMUA1G5lN-ik-DsawlwuzS1kIr0qGr9QG9uCH3_7HGZ_R83ZM4BCxKE8xfrMY-UpCtEXrmVP6TWY7D1x-jv1K5YUUA3TRb7Gyvxyh9dHCMIjbqIg468OKOfXDL8kD9QtlluTwFEzQ22372qTjzGSkom9qD6Vc8ys6v7aICqTkFdF8IwPN4_OOU32lxk6BTWBUT25g1i3p9LFVlhqwEITCsNx0e87xq4_uO10wOUhSVcyYG35EbB8n-ytAXL3r7On5Tcs81TAby4oyOcDw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_11",
    "name": "Butlers Chocolate Café",
    "address": "24 Wicklow Street, Dublin 2",
    "latitude": 53.34299859999999,
    "longitude": -6.2619593,
    "rating": 4.3,
    "reviewCount": 881,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4rczachex0rvxoPger-AlWqwAD8iCbwSuhkO8WO5gY6Ymg3IOC-XGEk-v4U3GSVlw61jul7KBlmYLNDeQTFiQPqeomuIZlIJ9guHS_kzyJL61o3pqSBwPu7Snb_4onlU-xwMgwC9K08l5Ud6nDzcTQah6T1PR6UtfAt9QWzym3pD48nPmW7TeWJV0U7gdGJtmubtbYU0aa5dFigJhEpL9Lar8diGlQ-bZQzR-iIBAcG5zmNPuhfm0tCH780Cjod2UzxqxB1-ZWTsi8HiSXNdqV9hT9GO6_SB73X26DUrqKAZt2EDZJ9wYPHAjvXHhcjW5xusFInbk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_13",
    "name": "Brother Hubbard (North)",
    "address": "153 Capel Street, Dublin",
    "latitude": 53.3471139,
    "longitude": -6.268372200000001,
    "rating": 4.3,
    "reviewCount": 3978,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4opDjzPm-cd1qZ6Xel0FFerN_sjuGCcZM46H9HDhcLRbX7z7F_CezWswPD8503vnFJhItEb4LDbmGoFV_PC5QeB0MQBU5YXe6wvQL4jX04ED_qtuqtQCPYm1HRnSHi5wXkTnOupKNgT63NvGdXWr2GD01GSzekGJPth99Vy2rAMLC3GDmyAipPem9tI9GqT7wYSCYPceFSXnQIKBcEubaYp2bl3HfrbCqMqG8s527Lof_NtDoOgH2PveN1sL1MYS8mBUHdry54goeXHWvYYm5CF_PROb9e3Q4vUzl8f-N4WvIUk37ZieH790w07LN_r7N-7hY84sM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_21",
    "name": "Maldron Hotel Parnell Square",
    "address": "Parnell Square West, Rotunda, Dublin 1",
    "latitude": 53.3542412,
    "longitude": -6.2666586,
    "rating": 4.3,
    "reviewCount": 4053,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5I1-ZBcVvnQac2-c0Erz3bTyQk9tzEN6ahvVJlf8RJXlNGIVIo18Br1NusEkSeWOa6QDa2LG7Ml2_ueiXbae1TU9hJlfJo_-m1XwdRshmrH9z2kw2o0pbkyTrmrXCTCHP5L99TTwZTr_PbmsXbe8W3aFcB26aDCjLc9Qz6qhzcPmsO8tyBB7H1M3XBwtuxIJyINQr5Q_GY1-0MAhKrRGwAPDa2LfNl1jbUq9YU0_H4bvZZCuI97Wrnj6dBtaZ9IE6IkuODuknf3Rj60zVab_1C4eW6Y7McSmG-h9Dqzgvaia8gnmj4R3NOa4UNvfaLEXAPzRdG2p4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_22",
    "name": "The Trinity City Hotel",
    "address": "Pearse Street, Dublin 2",
    "latitude": 53.34522510000001,
    "longitude": -6.254099699999999,
    "rating": 4.3,
    "reviewCount": 2186,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5m7MEzGRA4GVovUqJgU_smIMahQr3WiJJklivsF2xwF4urmoUiTpGTvnlNAoH_o41FDo3M_B76Mud-CJCr4zQNhp9gwxUg_MNgx0ZrFSOCNYXg80XiX6dpn3GuIWHL18sw8ridFFMGC1OzNRMlaDTSp2jAvTD67Y1Su8kdbGfoDGdNgkkvFPNk1DTayb2mON5WpyCMmpWIG2gR2rwdE6w0PmyvsKthWuRSa8pi51_LEnftLto1_9NUoOXa8603JXtYlG2utddd56Y3i1hvArBpXoMXuHnGvod4Tjm-Kox4FX-d3YPgKMJUSSlQj-MBQnqh2jI7P0k&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_25",
    "name": "Gogarty's Temple Bar Hostel",
    "address": "18-21 Anglesea Street, Dublin 2",
    "latitude": 53.3453782,
    "longitude": -6.261729700000001,
    "rating": 4.3,
    "reviewCount": 4509,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5l9acxA_9sylo5Yz9eSL27BjG4Mr_qb-7gDjD6K2JYqwKiCPpBK3G4HlqzSEpJoNwilcrWqqNQOsM5Tyee1y-U_K9dQE0rjeG7ONiNRggvonXVGvM_g4E6r_iAUnHwxSs5UqehAJuVFRGgHIxmkRqLyXEt5cBWM74m94wlJtQ4ggbDqf1rPfr-84qGQmK6BKfVO0KGWMZP5Nv8chdHNZUcGZsYLfyxouDX4fWxOg2ohff1MMJBhrDFVIU6pPkR8nGXAhmtys9V_-IbD_Ead2-rbyGVoWFeBVrOebsgLgg16LgUDCjm72nT1sEb51CTLuGHjAgkubQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_28",
    "name": "The Norseman",
    "address": "28E, Essex Street East, Dublin 2",
    "latitude": 53.34535409999999,
    "longitude": -6.2647671,
    "rating": 4.3,
    "reviewCount": 3385,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6sK0NqzpMZRSGmmr3HBP-dgL56h-Iht8pxwjTBBK-rzW2zkW1vHMLy5oLkc4jHOglf6Qfkt0Her9abpoM0wxxd10HfV3TI5TUiziILaSKiplek8X9w4AulfWmw4kl4XD96Hwd0QQlmW4UkZ2GG5fL6f7l_TONKjUekkFa_WOWxMrn6saIFnS4VROIPevbMX87VzVZEmTvGEfUEGFeGevwVycgpHZB3GSOU2BYfWOjEohbN2TkdcetVjFcB3Y79OR9uWAbf9kCnHwrm7PqzbFfQQQHS9Nq7YPM1tD2ps3mHphsCKzW7B3xBhnO9b3YEbvCkoVvYbKQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_29",
    "name": "Castle Hotel",
    "address": "Gardiner Row, Dublin 1",
    "latitude": 53.3547688,
    "longitude": -6.263354500000001,
    "rating": 4.3,
    "reviewCount": 2842,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7_sKks2Px7VMBuZPZNx9rCfam_GipVXiktgAbDl0ySbMfJXvX_zSRz38K40EDHzAAXGm-9T_LlDvhpbYYfqLmkFo05-QVruZUnBApfmKVfvkbIKNpja91GRtXBrz7V-swLCncu52sIThhqemmGdz045VuBVHrLs88wnvkIpDDRPK87_xou-ZMph2hX-eO6KvlcJKJwsHakfzOH5CYNb1HGUQXdt3z7vsX2x_jhDZC1mf10lBICzFd9-U0Kb0iW85WxkUJJhz9sQCmrAoumobEJY9zL7Wz_fwzQK14vbBuK5zubBe0SCzRf2Iqz5A1pkxXqIl7NnUM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_30",
    "name": "Wynn's Hotel Dublin",
    "address": "35-39 Abbey Street Lower, North City, Dublin 1",
    "latitude": 53.348342,
    "longitude": -6.258687999999998,
    "rating": 4.3,
    "reviewCount": 2362,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7AZi6-HwQzit-Cduqa9cksxscThvMVZ36-vwRnriiCC-nU3kheHyZTlfIJVwQuasvlpuaFGM7YyCYTfkaazspBEE-3sK9SyKeqvD-Nl_euhlqXuLveGl64ES8URRRetY7UuMYMEecVuwwzblBS-3t1t_tAUq5s-vkHzxmfCk2LA39vtccfUC_uwi77huci691Uz89xne3ElGGUTuwbhl1mfPhVusoqLidMEJNBt1AXKohvU5vYMLU4VdpBVQn-hSNqHYYRRgxoe799jduMz8vjKP2tf1RRUnJyET1FeOTXZo8RLc6B6MjdRahhqIpM8eZEZMgHyso&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_32",
    "name": "Cassidys Hotel",
    "address": "Upper, Cavendish Row, Dublin 1",
    "latitude": 53.3531054,
    "longitude": -6.261574299999999,
    "rating": 4.3,
    "reviewCount": 1860,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7U4awxAO5QLxdhOSIDErxgoEU7frENGSG6-B7IOh0eODeCGhTAEvDA28dqk_Ezd-RPSO4AssxflG0e3LGaEEher9lBE402J2QC0ABQjhyP85VdeiTIfbZ36O0R_gsK9G1fkf-P8lmSIR4AWOt_qAM6Ck7Ux87-QgSxLR_uNQI9jm-1yrpePK3jBWQuQK11voszPJeRmaau2-xsCasPtUxXURUUL-a_pDNgtnvMApjLbhZTyulXrwFJ0SfXvkkZxdQQjUMc72j_BrDeHDb1D16fjseWznYAW2a5l2GHAbocUZ-46sDjoaT7MQ_ZJTP3Z5VTtT-Hj1k&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_36",
    "name": "Trinity Bar & Venue",
    "address": "46-49 Dame Street, Dublin Southside, Dublin",
    "latitude": 53.3443507,
    "longitude": -6.263569599999999,
    "rating": 4.3,
    "reviewCount": 3197,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4LnRA0P0zfSSTgSHQOJmjmwKZIMPEsUrT8WznAfv5Sj_gHUciwXC07pOM3-YMFN98pU9Nj4WWz1aFpHUzGVYaN2cfWqDlqHPLHs1S6lKNMF3Wyn5OV2qSX7q41SqQycsdOQ-R0XgSyQn5T2eTLdGdVmKN1bVYYHroSMC5r66Rg4Q9NyE_NXC2vnPUqZe9UnVNhCjl2aJcqLjrWPoNp2AyB5C3Di9pHkdfX88a3Unle6EctT2xBpLFP6Q0RNRVHGX9HnYOGAjH95PD0-BvYPXjX6dWMNcdVLZlwpWdCzLFnGZCBUuGOjjNcyeHdDPO1xnHcLqDayQM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_40",
    "name": "LATROUPE Jacobs Inn Dublin",
    "address": "21-28 Talbot Place, Dublin 1",
    "latitude": 53.3507035,
    "longitude": -6.2517865,
    "rating": 4.3,
    "reviewCount": 3628,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7DGbCFhFJJQweaEYi9WPwtDzdpTz2YJhIpBi_EyC4rnWBd_n2aUasYCP_uvOgb9ZXvQ75oSfe0hZCYU4myJ5qpgyyVswAwqzknzJoJJMgKvHIZzxEVKGkoZj-pGK3tvVzEdR-IZTw3evOUeNyshZpA8Iw6-N3IzHt4oeY4HuqigkNL37TKUxL_QQZoF6SYTThhrzfop5eg-GiD1qpXasZ2NSDgRmBpIzblmEDOvSEzE1P8WPukKFud3lNigFtFFQ7V3KLMfPkX1HEO-O1rpuJVuSmrxLuH8CNfLen5ug-EwDIdjfk8RWfzENOMTry3CDGANbISC4pAr_ayf0XHtxT1XNrG43Wle53YAzs8xbcwBqf6DfbVYvMlO_n7bRdGmhrxylWraKwvEmMc-NK7qWWcNYhFBrG34CyVGDGRXrCvKSFbtpBdYCBJLGAPyn1jg4WEkCRTVfiJp_GtnR8zSGOfFSVxsYzdLvkBCinij6TwHohuaNT3xQVPe19VATvgFR6Yj2DShvDp9Ooa34o3JR7hIyK3CmCpk4VcLgXdszAg0ZAQlrfPHWFHs72cXYDWksNBjrVLWZ3UCp_8faGYX0Gz4Kb0zW3yd_MVwQ6x0oirlrqdrQVRfy0asvEfJbz4NSWhkw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_54",
    "name": "The Davenport Hotel",
    "address": "8-10 Merrion Street Lower, Dublin",
    "latitude": 53.3415931,
    "longitude": -6.2501106,
    "rating": 4.3,
    "reviewCount": 1034,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7EcZAUXAkPl9pFzoVIP9QVYueuKFEskrB4mmghO2cburlwV2klEVFW0N9yknaqlK9rT1rZ7TQpdSEaB_NCk5_YhQx0N8e-ViTRa2fFR9MW3Qlgta_Y1xVPWbGBYfw4pBm1Ezj9yDaa37itmEuOwa4kAW856H7rUHq9xSpktUMlGOnvxsbFbdh49s7TYiWHs-qgTXfFoKMjXwfWVk5OCkyCgqAA1-HK4X3zPif7IFjQ8NsBClOns9UdAlpoxygp3PseUXnq9tRPrRybo5CRDdZTiYaHFRv8J7kCUhgDUFgA4VNa23bJ7gDgOOZMRa4UwVEW06NXDac&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_55",
    "name": "The Green Hotel",
    "address": "1-5 Harcourt Street, Dublin 2",
    "latitude": 53.3373746,
    "longitude": -6.263279799999999,
    "rating": 4.3,
    "reviewCount": 889,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7TjAeLzBsZFErfeqxOWbkcZV64WgtK-redB0OnK841yF1HZBPN6765up_QgHSkANF6jx9i_AZpjL53gcUrfwfJw5fLcmn7rlJaA6TveRKktG_w6XgTQknpBSxzN9uqAGONPpj8j_6eXMUariTPenlfnPjE9RrePF949qx79HmG36sU3b3SBPluI4Pbg0ZDLeSoE6Ef7fNgkJyoPpHZ_3SquXEA78E1h1aCHgXiWqWU083F-PdwbJP1maa1UN8-DHr1jKagQuuT414zgYTwsQYQnz35tNMkJ31sa4PCNPs0Iy0p2Jpcwr61csOoZ8SjWm6xN1qOxHg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_57",
    "name": "The Mont Hotel",
    "address": "1-4 Merrion Street Lower, Dublin 2",
    "latitude": 53.34150409999999,
    "longitude": -6.2507158,
    "rating": 4.3,
    "reviewCount": 766,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5t_CBPAfI0tbVtOV0zCDaCCnKlyBoIh59pSeSwVPVNkaq72cgNjuqIjsKjjN4zqlOLiAYCgOSpq_Wasoyy3PNPde1CGEBKxjPsa-ZCqBV5iNouTXF4OrOictFYMWMgP-PM1guOokYdct6AowBP6Df9dT7r__A3blsiA0Qa0ha9JfHl3aOjpPC94kAp0vGT0dPrXlHhiYBvUaPmn4biB3QGxZFa3BG8Gg9m1hg0ULc3bTdjAYEcMblFqRvCmwFBhJFz7dwydfRCsTWA2JGdwaHM1FcntJdkM7NEgpTkTYydYKneUpg3NN-Bt-EPcfAnT-hoEmd6y6U&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_62",
    "name": "Opium",
    "address": "26 Wexford Street, Dublin 2",
    "latitude": 53.336693,
    "longitude": -6.2657163,
    "rating": 4.3,
    "reviewCount": 2346,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7YFIhNLICehv7I7LOXAKULmsgaXsWx9QPEaZLypftA59PTgYDzeAamIcWLRXBkiZHBD-lhgGtWwMNsppl9jHktiuLsbaqYVRqxlrHuhB7yrFPQqLOVxudBR0zqhLpaObnT2khFK7JJu3wIFZAdwQ0pxMzIPd1UZzTOF8oIhwaafMhZaIbPjmgzj7PElkcXx2NSOkEEIK32i_0y28-2W9X3txcni-BOrGTi_IQT8rpIBgA-2EExDBaXNXC84x7EX8ORlbjz8Kx8YCJrMCQ9zgAuxrb6udwFm9VNfyFeKB5TO-6L-ILfvPCr9JbjdOqkbKACgZvo7Xw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_93",
    "name": "Roly's Bistro & Roly's Heated Terrace Restaurant, Cocktail & Wine Bar",
    "address": "7 Ballsbridge Terrace, Dublin",
    "latitude": 53.3294158,
    "longitude": -6.232321900000001,
    "rating": 4.3,
    "reviewCount": 2538,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7B7NnHL_WJmgmEq7pUqeKxySlu5Q0D49LQkw8fBj7KnBxx6Y98o8OvDqSmUgJwyYgiNaPG9lpQYOADQhNJ6YIYq8yVg2F5FdFtY-DasW5xTiplQFgrM4RLG-NEyzd7jq2N2-XCye8g9wLrYlD4fF8aPttqTb2_z76XjFtdjBt0p2LwlvtmBovbHutHUWfMp9rOxmRRrGjtFUCNasq18qbfypeSi86pcXkggVUYvUpg-JGgkPeYdlNywlSKoLXJbOGAc62r_QV9vsuJ2DEgUZgwsAxoeQoZiTCZfS7oZM0D_vlj-A__YT31GiZN5qraMAyd_QIF&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_97",
    "name": "Al Boschetto",
    "address": "2 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3292724,
    "longitude": -6.230903,
    "rating": 4.3,
    "reviewCount": 995,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6-Dy_wAXrpFTOr2rTnZ8G7fC4oxrkGrtocjnhF_g2Q-KxrVKXIH2JyYAqMd9KuyIDJ8MKsBl2IlnoS71rnyYDavoqo9GrvqoDOrLYfshSQI6G5nvCTSxcEE1S5zOdT2vB36oVPqlPBo814O36nRJt_sIJ08_K7M9A4NLSFzS2B3Tg1i1_U7mUjs7pfdkMzdikPlU318AAvXDjGYNZ841Bq7VzDRzlBw7oiTuu_HUnBRSsJS5k9DZFbVEBIWIfR_fzcPTd6k1gIMRZqxXqn5tK5tca2-SlgrgjwQtcrO8oD4XH2KDUW53unc-mQwcA5HGmYYavt7Ik&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_105",
    "name": "Paddy Cullen's Pub",
    "address": "14 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.32901950000001,
    "longitude": -6.2302863,
    "rating": 4.3,
    "reviewCount": 995,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5Z-Iq3k1rhf171Uq9xSQuovnS4sgeA_ykxid0PrftMCLWwrociwRkijUGs5-2QBUydxL14Fe8toMQj7DpkhhqavDrY6sSunPz1747-2gzjNro_k0oVi5IxSm2CEjeJgRyLQ9hwCbUeDppWkxrKPtVF6CuUNKhigEAW2Qk5VJccAX6-SoRkQ_EOOECGPwA4A8A0DIqGFuybNLrl_38PDhlik2E-x0___3N_dNKBxvLB_lMUyZAZVNCh-vZhCxH8Z4F5diQgeAPi77cliz16szNsclthEnw9Ar6b83A7OuX4kmf3Bu9O6w2HqgibILSWEZRcvyz9DMLscoVF1c2YHC7fVLRUFRweQbxxBUo_anXZouuYPCDphrZHAFu9tJoFseBGOat_IjhiCbIibbrBPOjeZDdsrcXyYe5t0uq4ooskWUCcZ-Aate9hcKRqTPEVbNswIZfsENgESc_TryvdHjsQLk-wSkDvKRP8DZipzsk3a_h8iHWv2FQxIpBogKx3Jrer5UXs6-E03GR7FIqK1K4Nfgoj3Os7Z00GvqzSrHDanH-3ZUuM0sFe0PN1UNLlOogn8CNaZMaFoH9Q-A7pAj1pLqzfltN8bLinidYXG2oVw2C1dM6EJMbGaIhu6UL7lz6UgrTi&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_109",
    "name": "Kites Chinese Restaurant",
    "address": "17 Ballsbridge Terrace, Dublin 4",
    "latitude": 53.329193,
    "longitude": -6.231952300000001,
    "rating": 4.3,
    "reviewCount": 312,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5Bm4TE-N2WYLmQXPjb4fPLXvC-5EMKQ3yrWVvJBiWZXSeh4sDZ7pVEpMtDSz7Zfb9O-5C3kWCC8WkUk1-iPWwQTVZSzr84fr3xzXWGDOpj_EI_g_Z_XvNCSf2IA4HJyFCpYWcRAFZRDm075mY-etTrrGvPPDMcPkgdQfFCAiy2okPwACaYLDX8Rlre0asMwD0ctoxzSmUIFQarN_Yu9fv2xoQnGh1_swGf2IrMOb5P7sOlD78r_hvKmmx-9TAeqysWQld_ybAOPVZf5bHvtX0WbZJzAD1TCurZT2Z4NzH2siX3ZsmTHnt1CCxN6j_N_RwB55vXFJk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_110",
    "name": "The Bridge 1859",
    "address": "13 Ballsbridge Terrace, Dublin 4",
    "latitude": 53.32925739999999,
    "longitude": -6.2320777,
    "rating": 4.3,
    "reviewCount": 1663,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4Z6M7KqSvkok2rwqQtnePrCflSnGVhnDB_TV92CifTQCLm-Pvv64c5O5QgfilOQ8fM2S1l_PJthLHx1mxWR3UliU2IV1Wb-nqYBV-lUw99IoptjwU5qmEe7_DJdBE24mj90ud4ISCSZ9My-c7KjG0RpfdOwlU4-Jps6lrFtqio_gHm0uvywd2zhgNjw8WSuePNSrTxIk8Wn3mjxGKQYnhL9ZKZYx8S8n-teuNuZjYdgIxVEntvzswfJCLzrBudoXinyIs0nvSE6TDxqQmjmGBrNxa1vjVL9dMEqrH0weTFCFpDNDSs0KhfZkkVQts0F1U_wZuwlUE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_116",
    "name": "Centurian Bar",
    "address": "RDS Grounds, 80 Merrion Road, Dublin",
    "latitude": 53.3275233,
    "longitude": -6.229679000000001,
    "rating": 4.3,
    "reviewCount": 3,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_117",
    "name": "Mary Mac's",
    "address": "12 Merrion Road, Dublin 4",
    "latitude": 53.3290469,
    "longitude": -6.2303925,
    "rating": 4.3,
    "reviewCount": 703,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7uWpUbMiXL3wBAZvJyCFdoqVwgnZKPlVSXE35yamdsDEatBpXHFnDrixAYNCfneXfMuSDGg5PcNWt1Q-bE5BhdBpybpSnWiPsnWJAfpB-xLWkhS0HVWeEkUvsiR5gAKAv9qWvqrqNEZSHBraSRQOiuz73_U67bnfim8nGTdSzGwOXtau2e2q7EBG6ijwnD7KXatu1KpPLB9nDXp6Ejwde3hShu5Q6WpH9BDLQeYd3rBDzGPNtTOXSO5IBNLrY57b5Z6Wc9D1x93PyExy301xoOI8uH5LCt6E1KC1lA0ZtzvRtZmTyelCfjazP1BcCTWYHxcTRye0dQdvaVbVo_6VzGn2BMvZs0GR4xXN5P0XCbRBKeZfL5iyaCvlVX7j4DfaNWT-gtjVN3SzuiXYhFcHBLSafURYZjgqdof_nq2KAFQb84tGGBSMdka57YSxsaNSxFZdWpKunLamJSKSqZFCmV1tBcfBwpHAujqtLkB87t41TsVFb82QUIisNQutCqfaB0QU7G0nM2QEM2aYiq9dL-4DS-KYM_jwvBmj_tQlx_Efq6jXLmDJ66gXwE7ZA8abwIehwtCUMI6ypQ5L7-O9-HgLUNfPCd8w_VOOM6Z15NB4DlL911Ju0D8LonrZE3DpJF5w&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_124",
    "name": "Two Fifty Square",
    "address": "10 Williams Park, Rathmines, Dublin",
    "latitude": 53.3252898,
    "longitude": -6.266260099999999,
    "rating": 4.3,
    "reviewCount": 579,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7vSvZE8tNysvhAXSeHbSJ7H--TSm4IL6neeJsk130xtJYbvF99Lv18qLFCuBZ1Nt3W-EhxB1XvxQa6b7dKjxMFXh0Wnvz_UV-KqVXAKQ34cNz23p1vjc22j4k_3byaoV3q0EZiXwwOTloJTGJMPfMD2zj1-X03kZzVT2okiUUljvPM_bBzbI2ORaZEFXwEkHCfbFmrV2u7lpEGNsuexvIMiZYhrZPmhp2ETrK3ZyUlCvlJ8XW-X2xLRp9MrtKpJNDw5YvQIj3jVbzXHWbiLQy5Zud_pz3-k4hindYelcuyJrMUDW8RkZCWv5WWoI31SbetgLG4apY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_125",
    "name": "Fothergill's",
    "address": "141 Rathmines Road Upper, Dublin 6",
    "latitude": 53.3163917,
    "longitude": -6.2654227,
    "rating": 4.3,
    "reviewCount": 134,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7NP0KfewcEmDau7nhhFxYLwlK2SFkGY1n0AuhAa7yr9wvHKH4Fy_OMY-R3P2NswMyZXOQLAc2QIwOlI8AFn6W5MRSK8R0kfSzNqlytGqKh67SylSvlG3Nlo-DDJmWT34DYn_4cjqEnCIhxNLD45RKrYxURQIIjNrmsVKDNF8PTZC6eUHdKXHanJ4hgsiueSyDA8mYTL_3eyVEzIrrtcDDpGihm8A-P5SgNLrzhyVUDYPAjyenjYJQshiK37V_48_glTgu2O-AYy5xJw8qFzXCglPIqtRImwCDsJ7LZe6_8uxelQRVXD7WhSwmnZpoayBHtPSF96Xo&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_127",
    "name": "Maxol Service Station Harold's Cross",
    "address": "231-235 Harold's Cross Road, Dublin",
    "latitude": 53.3202327,
    "longitude": -6.2786444,
    "rating": 4.3,
    "reviewCount": 225,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4V6bbfq-nBVuF9cA_Hr74tqgr7Hi8-5QfsGKeXTRw2nAz2I-bpZmZOLFlvbUVcswX9_oNr6aXw4iS-H5fNmU9Q-VAsqCBwdabrW_6B8C4C3CjYJVeRcODDqvxIHuPp-xALXv7CQKi45-CP5kDEAgJ5CM1su0CtAvkut5l9PRwjTIwY7PhHet6Gc8ChqgApjKDNT2RVFt0SaeIndoA7Eo-vf5O6aCaBqsWTEl9dLrCfABQQLRaQGxDEJEFH6HpBualUg2MkwBTjOiSuHCObDnXlC__a_jSrr8Di7EIBhi31bmUh8ZgOT-7u6Qfl_XFhg10H6YGNJQs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_133",
    "name": "Yoga Dublin - Ranelagh",
    "address": "28A Dartmouth Road, Ranelagh, Dublin 6",
    "latitude": 53.3294235,
    "longitude": -6.2583119,
    "rating": 4.3,
    "reviewCount": 74,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5fx-7dyiWw-nPMXF7SJgXn5Ia_gAQRGQo3kN9478DXx907AnsugsRWRi-0ZhIA6ms0LDoeD7ZkM4N6-YO5qVS4NDNU7uwuC-XHPChl0mxDX1BcpcLKkfDpMZf6dBNrPmAzGfklrXzMGrgGUfp25ycvzFyn-SBRbMZbgbrdvphY1JU49_M-_ogFawfz34uk6_s5LgkXqUlWZVOXG9MH0vE0tqirt1GjSayJ9A4lTfZjtwwYFeU8bfuspPxZxhe7pADiQbvDiXrp4cGwPD8Sfya9DOuqob03uPnWRCK_ldGC7kjhLqinIJ6_5paOX_dWcAdPCGUgLqE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_148",
    "name": "McCaffertys at the Barge",
    "address": "42 Charlemont Street, Ranelagh, Dublin 2",
    "latitude": 53.3306023,
    "longitude": -6.2606264,
    "rating": 4.3,
    "reviewCount": 3441,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7hnNn8Yp8qnX9S5QuhSu5S3leQXSoko59RZQ1TmipOqrsKF2L0GLw4LvN05fRQsgLlR_StRV0po9BsDbEoJ65iwyIanV1vHI4KTnec5tSXMGscRYhg8-O2vT_t7BJii4fFcGLD58iqaxQeVDxW3j0NtrcehnQz8TblCQnDEZY3bCKZJbOFPB498Ou75MXjixJiNUS7GOpm6ErpImcTumTz1D_PXvskwTFWoGhvDOY9nWvWzTYe_6Fazr-Z4qdW6dCnfXjRAahJ4LOBxtYw45TxmNh97cniteNnGCAwg-mWIw09T8tElNkhCKGbWNUOKXIh9uFKIys&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_159",
    "name": "Rasoi",
    "address": "Fields Terrace, 2, Ranelagh, Dublin 6",
    "latitude": 53.3253642,
    "longitude": -6.255420399999999,
    "rating": 4.3,
    "reviewCount": 122,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4YkElUA7UDaaKuWJoHWYOsocamT_-NApNvajqwFOSQI5_Q8CA7Th_IYFsxPZwVAgSBnrmX669tKjkCw-nyu0cpzjZEKrG76ztHyiKuhNwJsbLhGvosBC7IEBExZN85OzruoO6p7pN4UyzV-hbN0Kw89nhrS0Zs25HX3RW6oPbvxvc5W1RvW-gmZBtYei-9lH0XMPdE4HyYnyoQdERRu5YCARmkbyHb44mIe1-kO_pYWykbmGQgwFUfSZO6n9jCIAi19cNsfBMsJaHopNUyhcwwytTLnZhyQUpJfmwy9RnUBrB7YY0uvVr7xeHZUQyPW9fyO0fTS4Y&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_167",
    "name": "Uno Pizza",
    "address": "103, 105 Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.3266123,
    "longitude": -6.2651764,
    "rating": 4.3,
    "reviewCount": 565,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6GF0Zu1PBw2zn_EbiFzzD_Nv_3g3iwHsQ91wtza_jsVL9TIUc7-LZousP1QPAuL6ooh-j6VQKuVSWzSYPr-YDlpMV0fjvgXR3r86RmL75D2rGft15uWbxhv0aGvNmNxvbYT1CwdKkV1jNLps1KQE6s86ez7htQwXloXUzydhBgfJQXvdmH_4DR47IJoT07EcWjhVIHQMqo40RRv3YzK354GqvMQ4FYvbqwZyTADlU_HAUjsulPKmQnl81IHE0-R6yqyUZKLxSDcX9xjpxl50d-p1oc1H49BV8yGbwVN9P6uJ0HyuKM__kE4rhS07vlwF0uHoSIryU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_192",
    "name": "Cafe Sol",
    "address": "36 Eccles Street, Phibsborough, Dublin",
    "latitude": 53.3592108,
    "longitude": -6.266353100000001,
    "rating": 4.3,
    "reviewCount": 6,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_201",
    "name": "Midnight Express",
    "address": "Dorset Street Upper, Inns Quay, Dublin",
    "latitude": 53.3563873,
    "longitude": -6.2651807,
    "rating": 4.3,
    "reviewCount": 381,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5HgpO9VbrFaDdQQh12zfLZoYAsqqKxwfk3XCSsyMM7pp5qn00Qe8VwxzrkyAw5L58iWvHLHnv0ap3Yo6ZoFhyhSY7_0I5SC4AjCMyjzkh7z5Ls7-J4Oygj350evu3ePuMqYw6HV1CwhIU3529-l-rIYk5AtHN1RjzJBE9cDGgAPDEFecTjlGpYvPiYP234XvVp2YXHycZ3N9569Oy969RbPysozsLYdfjwogtrpJam-Zk3eByrxQOypR8G2XLQ90acetO2Z1RLd52MlLaww6Nam9Z6GU42uLyTayQOwrgid-UoD3xkmkvO1-i-8BGWn7iXTtWMFTgsLt7HnvQe1MH8SvnwcQZS3Wef1itRbHxYI7VRB6lcDqh_PfYjJFVE81pIpe39PlxcIZUVNPZRdH5qkkKhelMYcePHUjutbg94C_BEAilB8jnTg5BwkhVy7Yhs7TSSj9OqYZPi1EPtHyZh_OZ8D26dOKpuYZfo9rUPU-QctFDpCwb_yaHk_XXl6gPWBu0yEOt5Knm4ySyyJzgS3G-8ej0QPfow6lcWkGN9aiZIZAJCc1_Z94biGoOZ-R7w3_6ApBg1gk-mgHwkKJmhmJhsMd4VZfcSa-Rr1IyZLDI13_v6ZB2lJB9xVPNWT-c5HQi9&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_205",
    "name": "Kavanaghs The Temple",
    "address": "71 Dorset Street Upper, Dublin 1",
    "latitude": 53.35734059999999,
    "longitude": -6.263745200000001,
    "rating": 4.3,
    "reviewCount": 1026,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4eLM52QZK5eu9pfdxohp06lyA5hMGZxwdpFJvmqE9eP_pr6rNcFVmtEqi3TzVQTEFBXe-EqSJOErKZMqfh3eqjZQJg-2iLo1-9SWhJ7_FHp2iBg97b66MG_4x02nwFbfCMZkgI5kHscXKRH9ThyIED66FG8ZoGyIVHIsVToknoLccjftVdHVUg7X15I0yIVw3xCUvBap22Mhjt3tcUKspYLzxe_Zeqo4BbtWPNPZ8L_8DvuMQ9QnL-Gkn2WZA0R7l_sg_FIA83Tie10fAv4-b5NyEKDgkvp5cvpoXlwWoGOIsIC6u2kSHCBVEkV6eG9F9UIHHbvMI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_233",
    "name": "The Bleeding Horse",
    "address": "24-25 Camden Street Upper, Dublin 2",
    "latitude": 53.3335429,
    "longitude": -6.2649066,
    "rating": 4.3,
    "reviewCount": 4327,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU45acXtRTjYLZsLBOaI7cjxu97IJkQjg_eTLY_krNqOXZ08QKkVmUQbyCilThzPPN2u17if0PRNTtwYo9xMnVWddTRulrgEI_aEvuTQtCG_lijFmAmZqH8YRIJZysN3WHTtrSAaPFQ1hsH-0f-Doxe7w7NXqUmbJp3XBrf0tp9gDZdkoEJ74t3_dCRHNmJ256l_YdmUfb72uiz_Xalb5IHTnZR99qwny3_-koNHzWve-ZHyrbiA02_EjBeBgLAsjxNITl2rvLznOf1SC002vhtV8Z9t9TdV_SwFy34_k39uZQMrLnttP8Z3W0vKg6e9umj_5P_eDC8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_253",
    "name": "Sophie’s Rooftop Restaurant, Terrace & Bar",
    "address": "33 Harcourt Street, Dublin 2",
    "latitude": 53.3351812,
    "longitude": -6.2635434,
    "rating": 4.3,
    "reviewCount": 4120,
    "priceLevel": 3,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6nflTTEjv3zoaMw2So7hKTWE-XaVlttAtbRcW6_mbJRBrbPWzGB0WlrwG4J5USdBvIDmfFiyYIOMrHG2Ndab-yDHALgyjlsKyKrybpw0DDGJTOaNvN-AcSkmgPHPhP6l5uzN8Z9-1TuAOb-AuA9pSqPxG1f1EjzefUvcogCcckqzZYLrL-KKHeoiKgVM0D8FOgawWw-XQSl90iD9gBE6f6akIUuB7LWz5BJTjuXf6DlZn7pHBOby75IHIwgrqwuhEos_6AzSc6a6wn1w3Ki686QCxzFUy-5wm5Kf0gxCHAyIsHfPFj8xhZhG0w4XBEHT-orjOiFDE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_26",
    "name": "The Clarence Hotel",
    "address": "6-8 Wellington Quay, Dublin 2",
    "latitude": 53.34540490000001,
    "longitude": -6.266725,
    "rating": 4.2,
    "reviewCount": 1004,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU672p0Fdz3QcM37zzHL4Ypo9g4eq8dkDNhP6-hDafrXcGZxw--7vExzgiFgWkKg2wQS3azLCt2bZ3trtoEIl3yB41CzVRXb_Ump0bPTa9V7jLp0AbA9juf23K6vcrCTV6R9wkGGCcLOSrDm1mMoM8HYkVxac1rO1imjJ8WlTa04_oNfxKklAhqZE13RHuWSKo-PAse3BK5uvWheXfXtgVsTNkptquIHK0u4COvnLFLjZ7DGakZBc95mW8whierToATxrmI5b6LaoGzz6M17ISBLOPMeAiSsDGKKzFzXJUk1-kWzIexV2tJWGX0FiMH5tCiyU1g8aAc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_33",
    "name": "Belvedere Hotel Dublin",
    "address": "1 Denmark Street Great, Rotunda, Dublin",
    "latitude": 53.35502059999999,
    "longitude": -6.262414399999999,
    "rating": 4.2,
    "reviewCount": 1891,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7uUhnBnUBESq6d4QaMjUhtDXtYE3ngS4saU8OaYQUJm-lXGZLOR6c0raKbumHkHwVHbV-8Keu1WNYWIsEKLG5WEd45i-bJ7T2ZektapzLJb1wg6lyqIuzi1XkWV-IGxOQi9uKyr-xiJ1pks_GJXKhmBqq5bddxXXdUPh61KcVNbL4h0o583ob2aSYTtlki1yQ83CzH7I2y6RixbIsrtPW0lZzuZgtB_ZqpY1U6f434MLoYo9X3vhKtPcBaluDxNfkftFsb2WwE6BcnRf7OXt0sYkm0ZnEqubhn30pgmeBdh6J2QspauRHLTPwkHnMj3UICvdP5YJ4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_37",
    "name": "Wigwam",
    "address": "54 Middle Abbey Street, North City, Dublin",
    "latitude": 53.34788890000001,
    "longitude": -6.262308300000001,
    "rating": 4.2,
    "reviewCount": 2250,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU48fVoEccQ37pqK7ur4LMG6nzH0gv2lDyp7SWl318rH1rNwjMdeQwmHVnj00bh6gePPU0Nbpsqm1d2RvMTsCZCMqj0D-OhCHjTRFBy7yW9zY5zwe8EPz-hmO51xHLE4ilNDdmMWaKW2AAcXZFPPo8LjomHqHfqFHZr8yvAUF-23SlckCeMJQV0ZjJNnPtJVKMn8kA0Wbl9CyEVLmdeZ8ofT9aKuVUQyqcKAJX9bQfFjSQeaVzRKquWoGT26FNMjXtA52EZG-wH5D6pFurtfmWufVzEMawer7nJHJOXbnPQ8vh-o7-W1ZuFuwe--jZz4enUNSHkX&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_41",
    "name": "O'Sheas of Talbot Street",
    "address": "19 Talbot Street, North City, Dublin 1",
    "latitude": 53.3509013,
    "longitude": -6.2542719,
    "rating": 4.2,
    "reviewCount": 1087,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7dbXWvlnuCKWiMs-hb2fkATu2_qAK6vn8Yg-Ev_-IIpOF6H9VMHtybD_JrnUCuo915VPa7HShogFkChqD8d-FoCW83LD63tj2LOcAiXh28yG4359xJHkU9sspoDmuMvilyaqZhzEF7qp9_P8AOpTzArdS8GzTwLiFth-ukS8boDyBUfyW7aoLAkC1UNC56K3btgqRRCvOkvlj4kn4g5TBt5OoaI3ylDDPpdW9G4RbI3bK7BwhTviV5kVv3HodU6k6I98PcDW3AhTGAjWwHOfTa9MYeSI6_El5j8V4H56kAqut2pj3u-T4gkqdv4oSxPPaMqfQpSI0SH6kWblxOx8trS8-B4rMa0AZd0kkuSANTOeTkdJmINRo1Uc3icYjHmFBfJhSL5nrwjbl1mK72vkJBB4BTzI3yRZugTWo73LA1EndXsm19-xbtKZSYEHnjdLbMKA2TOlLac92yNVsN0V2VH3H2vNoSOx9hR52vDbpZZ4cPrvYSFPPDuIIvTFZHIiyaUgc7Qaedm76fLlsIRY9N_5brqQosHKkrn6vVmyVbgZW6AMqja3T8BC6G5LoG2SYuOUvP27kEOXWynoT5Hh_paAbbRhASxHuTe1Qev20S7WkU-cpdYhatVNP7DoYldHon2A&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_52",
    "name": "Gurmans Tea and Coffee world",
    "address": "Unit 25, Faiche Stiabhna, Dublin 2",
    "latitude": 53.3400401,
    "longitude": -6.261518100000001,
    "rating": 4.2,
    "reviewCount": 174,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7vx6U2_kBzLoGHmCtlHjhkHfFdbNMNNiYXmdNzBF8tfp-7ulTnhAMKXNlUsh-JxiDD1q4I20-KRCY2zTOa_eKlArPaRWH8t_WL3Vw0J25QIbRLFC2d2jqElFKr3lkT-0PzFx3k_OKKbv8Y_al3ZA9E__OxOD9ii5_AdwJd7aXdgSQv95zg3lEQFs1o_VqsuUbMX3YWyKcvTgvIumpmgP-G1G3WT1_n2crIW1H5PgjZ_BSB-6TFMqlH-oGi278rl9pWwGfsYHDsq-NOC9P5jE_9gnnk8ftjhiZ9wjCVcnqqVjYnkwWJbVDhGh9kLWK9bpQ9EKUp0yU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_64",
    "name": "Bow Lane Social Club",
    "address": "17 Aungier Street, Dublin 2",
    "latitude": 53.3402743,
    "longitude": -6.265504900000001,
    "rating": 4.2,
    "reviewCount": 1702,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7XSFPZjTvIWc2EJQ25RahDKs7xpJBNXM1OH27uxEO0UoktxRM1PqsoTmSLBOPsGuu9_EdgVQynFr24Fkc3tyalGbXtGtlZb_kZjuxBy4aYL7NzKVx6CF0vF_A5OWonriEXjwnHm9XMliDCeo95AcO0xPDjPfqjferWO_uigfA26v5_JxkdOW2NHNde5Q2r2Jna5ERy5ikhzZyOhoQp4aeK4S3vIaGG-S3rp-jB9ncCq-GgKUzJgQpw5wShUxnlI0ugqmi56rbLf6Pq66pYWMuPaHXzCFPcAi8PDFHQIBbccCRb3ZxmWW1hNb9P8RgyWX9hJhoTKE0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_69",
    "name": "The Odeon",
    "address": "57 Harcourt Street, Dublin 2",
    "latitude": 53.33343289999999,
    "longitude": -6.262488599999998,
    "rating": 4.2,
    "reviewCount": 1566,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7mNf7oJ7y4vQSjZ-u4GItyRM1N6_q8HtfXr6Ypwb139xMZlNZC-uUuQ1EThxV7ckSsda04f2HAgG5xTzqcQlWIJXtwAeU7Qe8VM8vSeiJVqGqmWF9AgylFElpARq8hPBF9lkggHpqHnBnguKFxpjeSgu72C6cj_KhqXRTkLEkfnZ-Akj1rHL5hNazteSOCUYnQXPGjS_VyhUHrtQ5vB10ABEIV-ub9uS_L7u1NelB8hm4BKHkZt0Bx2RqVXYcUeM5N_sFKp2hswAnc1jT6G1SY_ZxTAN6e60MthbdXNDegjIj0n52phGjNh_wnSU3DAINLbR4GdNU&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_71",
    "name": "Donnybrook Fair",
    "address": "89 Morehampton Road, Dublin 4",
    "latitude": 53.3243272,
    "longitude": -6.2403219,
    "rating": 4.2,
    "reviewCount": 863,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7Bpud0F_sucQCToVhFFk4Dxi0SEybhtwB34VZ51rwcdNXsj_e52UXZ5fGOmG3HjdOPgUZ8BDpD4A1MUVS9fUMS2QKOCC8ly1zQPTfnACb2yihuOv7O2eQ8FYtq_n2AFh6jGwU_FrkibfHGal4-7dteeg8omCdRjg_qptANWW9CWDBRzSvfTwQ7TDBApu5gPoOs5spE8Wwnm4tcoUHK1n_0dJpr0jCwAxxQW2OhbBctUiCFf_Toe4WveIsVFbid9t70ySc2WNyLVgjfLZ7lxAdeqGIlMSygSZVqOh90_6K6KFmgcDUk8RQFxxdHqF-WJts3rRGwDuE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_75",
    "name": "Caffè Nero",
    "address": "88 Donnybrook Road, Dublin",
    "latitude": 53.3210478,
    "longitude": -6.2349199,
    "rating": 4.2,
    "reviewCount": 308,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6KfR5ZfRCTAdpHNYV6VtTqLPdCZaYg8ew5xD--Z1ZEk6imVq7Yi272bMUpRwojO4ikvWyBYGXUBf3juPJnpDBZxbYiiX-QRwYgxfUB6txTU1hJCxlhEhqVnQBUPhRtDKA31iru4fCmLZsEmX4qvIHDDP41zEbseAhmBiKwIDp0Jg-mZwZ5yZPY6adiQKKW0OV2V7vNeXcu760XVSQ7_Y_X_h7WV4kGFpKwWnnFPCwt0fK4fFWQoKqo8GCbn6EJbYvNbBeghKZ_27EnkAnrqdFIaqp-aDRxrRhbR5M_FtYTSj1Me9OvJAi21hEYonR9mr5AzzLkh0yKJGzWVO3LG7pPNMV87Uuf9_0C77EvAn_mYkN-fbCS712uhR659YhlpkZISGJSuHxUy7iwleotCpkvWQySgJowajInAfQM6QVsRFgNEn-mYlXBfakGH5DG10WMED5DkK6KKw9Nw2eh_ek_aciCvOnu0Ge7R_q6lfDWAl99Opq9sIynzBUtGMzVeFjtD16yHWenMJkqYDT36nq3jut3lSNKtqSWB2EtTC2DjWiL_UrdViLl-HNdtpXDSHDr6PfKM34lsTR73w1hnR4PZiXFpOj80ANgUIbGZK16F-wmylBQOH9lQcijr-gUFyWDyG4_ETR1iWPI6zgmXX2P0XA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_77",
    "name": "The Lobby Lounge",
    "address": "Simmonscourt Road, Dublin",
    "latitude": 53.32662560000001,
    "longitude": -6.2261102,
    "rating": 4.2,
    "reviewCount": 59,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7-IoPHBH5P8E14js5cImLrW2U8GbbYXKHyRUhmznfAtZlUEnnBOTGLW0_nGNEahwcyvqLzXG3zPRfPopmxNN5DIWssXdogLRvReMVTCOjamiYv_ptaEWQK0EwEjnO2D9Eq0okcgud2c0DKKk9wrZiPuqSPjmP8dhKSpnY7iEZrKAK6m47mNOG5SqLvDqVlniz5V-iPQqVYZ58SU02xZM6-c5yjC2wGZMonAnByr6JNfTpQSlTWPcxv_ciKJnEuyY0P06DaMvXazg6bpAWbVbs2hzNfPkJPOHObRhRSQT_YJ0krQ1sAD9Ovbht8ClUBoMt5-rje5MX77zhT7JSEwgvfoEuccVPR2sR3WQFkoK2SGQMjQKQnHaww1pDwew7OCOwr-KKzjCQSf9TFEvWue3rcV6Ct9CTaptHZaUz6GJPooClHPg6Yq3lFuCeb9iVCT-LzFp5YfAit09_OFXZG_j3yRh7Ry5xtjb8uWlODMGdcscRN7zTi_94bTfu-oAAjgUCfMGAKfoqM6b0ohmDogRFVzhWZjSk4Y05koKVARR_at9KE6uKT5r_RA84Ar69Ak6T1hbGnqeyiO_9wwWXc9HodZnucpLZXvT50T3bX__k7L6qy_PwDFJXxAWqeCzSWPUe2Zw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_78",
    "name": "Insomnia Coffee Company - Ballsbridge",
    "address": "8 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3291234,
    "longitude": -6.2306171,
    "rating": 4.2,
    "reviewCount": 395,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU40Qp8vAGFNk1hvN-9xTMLDi_yn1aJTRSJc9K4fSd3aTtg_WYGrYBaiy7B5d0gLX_dEVJKnnTeLSOTCXxzZcDyn2dD--1tyceQFaiTk6V-ccRVv2OtYB_cIrGqYLlAtf8_eSbPZZZRY4mA_K_bnm0_T2Znd5TMCWLoNMQrNqB1WrWrsnWQTHgCEc9V1yDjeZ29b3w3R3_yiyIEO_7eSFLB8zOcthODIy6te_0p_QI5PsZhDJxjWse5G0qtcbv5qc4949QVdENQeUwYUCP5m0Du5Nt06bSHoOtLkAcfeLo3auB_SwqNuXDP0BjC9Rq6UhWbZgnGrvvfkmSNjEjwID41TM38CfPq5EFUA5dzf5yzwJlajTO7VePX_wPWTv-74xa9oO0EDu72lbpNO-6oRqvdsJzHV-X0gQGjsoO-a2RKA9e52VBJq5Ip7iff_ltJbbyeBifQFqAQ69NELvfZ3InfNPipF-Y5MGujWez712PQsOW2EORQxzeaaY5RYd65bx7MTfClqlrhvSwuBzaiiljoiXiBHWsP2X4A87bLc4ZCRJyXM1Rj1LM95liEbrJdbhemPJp6Xy1VS177VuWOEaVM4Z0gHszrqMk1U2OKvrFZDJYxy4808yTv3tAMJ680lM-0BOQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_91",
    "name": "Clayton Hotel Ballsbridge",
    "address": "Clayton Hotel, Merrion Road, Ballsbridge, Dublin",
    "latitude": 53.3259994,
    "longitude": -6.2253722,
    "rating": 4.2,
    "reviewCount": 4484,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6SyJxSZ0HVnqVj2mFDSA9oIvPOr2ryO4WYOKiX6ox5rel5g-bpgMWZOLVNHj5MwHIOzLK0vcOKyFcuzKkGBD5FSoUqKTkmw9_h31kzO3B5gz8PNQvZ-iMLcnekNI723-V3cK3Snxdp7w8dc9LkoiOipAn7CghrQXG21wUMcv6CcYOiJ3kJckGeO5rxV-u9HHCvXP2Xyse6UpzMp5gCb-58YcqJDAh7BhHuHUSd2B8gWnhNID0QyBFhG6m7y4jgFhZVvW-VI1AY4gBs73W6jov1NYSrLitfpdfeyvn9qaOtVoswxZuv5ZNbnOXuWgP26JjlYs52xHM&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_94",
    "name": "The Lobster Pot",
    "address": "9 Ballsbridge Terrace, Dublin 4",
    "latitude": 53.32935359999999,
    "longitude": -6.232156799999999,
    "rating": 4.2,
    "reviewCount": 191,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7zkl8mQ07HnaQGBEoI_jKEISRKH4Jlc36THueUVyu35iST3mT8xJOvfsrwazPOAdKh7sZ3ME3cU5S8EsN_oBKVTLzxgj8CFRXUmRrtOQvJoy1PkVsXW0q8PBaZvVszEhqN40p4PjXjUMk8vZI4IXGcG0ad2WgkLkWL-9gBtk1XnfurD_HRbshA7Lt5DoWq1C-tl51XMeDaIhnRIwzd-lp6LGvD0n-4xvQv4GVOiIyJ1l6QOkPBxyVT6kUinmWYgRgsY8kykRN94FdRjzkBNa20BXqF4TSsS8LT2YtCR1WxErfarVqcinKwwcl1QmdhEvYMKeTRwYs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_99",
    "name": "Horse Show House",
    "address": "34-36 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.32857869999999,
    "longitude": -6.228880300000001,
    "rating": 4.2,
    "reviewCount": 1637,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6Tb3DIPbAhX1dWM5dv4gyh1MAt91xZ3N7-C2abpcpU0cAzFjg_HJI5BrKPqTq4UeBuAD9ZdBfccpFzcnEFTbw6vkwngiNTTHX4MifIxRfluJrb2Xf89UB6H03Wi5fIe__hEEuzmkX0QzLWrjBAAjvKWicjpVbioDmXgOaOS4-jb-YH0zRlDo666fw41hf-5blabxk7x6Nffq6PI8tbTuNYT_UZh_HKkMj56852JffTGctNgnlI1U_Tbdsbbaj4gU_-vG-B6LzacDSKPuY5IKR1EiyPInFEIfjgqVYKrFpbSN-g7z9Rv1_2epbznsSfFLrNKUEbhlw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_114",
    "name": "Crowes Pub",
    "address": "10 Merrion Road, Ballsbridge, Dublin 4",
    "latitude": 53.3291693,
    "longitude": -6.2305423,
    "rating": 4.2,
    "reviewCount": 571,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6vE-q4KQjGOgotrVTc_7Mq7_BUgO8NpECAz1y63YkWWU-i3NtS7_OdIOW_ik5NTbysVzo6dpZOec8nfsVj1X_ojaKq0Cw56QReaGriuk1jgTWYDjlqij4cBto9TxsJ6uhtQRFgijMy_dHXU3wG8l6amBDCev33vxkTT-XAyCNNIKnR49eORoNkcpBYk8CNzVapJrzxvTGC9IX2uyQz8-5pjXcQwCdbDISknkC6zR8P47tF40KdUMG2oy7-93xAryHDroY2UI0mcJF4g11bGlOdf-zCAr6GSkXck5tE-JJgp7T7ORv6mKjASxrQPX-h9DF02qFCMdA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_173",
    "name": "Lyster's Bar",
    "address": "236, 238 Harold's Cross Road, Harold's Cross, Dublin 6W",
    "latitude": 53.3216557,
    "longitude": -6.279514099999999,
    "rating": 4.2,
    "reviewCount": 147,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU47XTCo_rYgBTW0Bnn36jACRagbBHUvzRMbtW6ViXzeJqTK8Gxw7lcaEDxlyjEERJc8VQDIIWjU3r3tA5ZOxWijPOJHjV3JZp-j35BWMjrfxW2ywV8SNoYf6MiVdXqxOqWKe3eTR-HSPcfU-Z3eBWjne1HcGkWSW1vWTTL506SD-yErsyVyMPRPx6mhQG1XNSKByPZyMj-2rxLR4OWCC7iZmvHXv56KNsI1KaQ9jk1IpgobkakDngBxKO3paX2RJxMG8WvuvBDK9PexVs7W7kig0WmA6qr-xFIW1otUf4QibP4oL2A4QeaSprz_36g6-828u-vtEVZDV8KlLepJnkJyp7Z9KbrpHXJIuyVYlNvyvlen8GHJOAjNCZSSSEesOhA68PCIYqWOQfc2G0v6Rooi9N65zKpwUlPKDcxIEFag3N3WBs38n641ltqmv6oDVaOAnq2cqEOUo6HtKfttxxY_wPfXFvM4F8l6pJ7892UBqw9duCMdYlHqCf8F5J3dIAP6FOsC4UqQKrqxQrY7kZsvRR5Mk6Uh5pLsd1NMeLGovGTBkZgIKDGMy-5dpro2hQWNj-7nzr8xxY0jpFy-sxoG8ba4OKP6MDEu1laRPXFGh-xQVPSdwTMuz8734Wj90COHRA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_185",
    "name": "3fe Phibsborough",
    "address": "363 North Circular Road, Cabra East, Dublin 7",
    "latitude": 53.36089319999999,
    "longitude": -6.272239099999999,
    "rating": 4.2,
    "reviewCount": 110,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6fel_mabU9aMBeFPNq_-Qcb9tB3kI2QZas97zsAiGITj92NIMGfm9SjWJ_1IgGQKZ4ZuykxFTK_DlmM4wM37dg697YEmws_e7FDFwH4YXBGWNmFIvv50wBE1JE_MvGQvaNZBfJakjaUsNwzz5y9fZJyYNqSShtsnOwQFciTTLKICbEIq9AHZrnTu8QxlvF-pjD951rH6T66Yq8yVdUHDlpv9dMTq3-oUiaZIxWj1jH5qMOQXx2HdVaBtRRGm0JgrExcmeOC8hvEltCGEFvJoNt20FK7PtcqGywLZUdIu5nL3EJ-e9y11ELm0Pvmft3yoxI-kr7Veg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_199",
    "name": "Hedigans \"The Brian Boru\"",
    "address": "5 Prospect Road, Glasnevin, Dublin",
    "latitude": 53.3652256,
    "longitude": -6.272018399999999,
    "rating": 4.2,
    "reviewCount": 1739,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU440eEeeX1r152Lch2m3HHzgKjrb-OctZhcBnVejG7up5pOX99ctW2goKteucxwI13S14Te5KIA5LEIpm_PXePWt1RtPvEY0-pnwwT589Kdp8Sa6417Jucw4OjNnRxTBCfZcTbe-O6CvpiT1w4Dzxi1xvHrbKJ3csdmFyAJ6O7SPucURGIVdLXAzh0xGJJYwom4OZnzzpzMg4yVaNJwXBHpOPfIygyK0A1yua0uo_OzGFDRD8JamkehCe_cAA_tNUj7YWqcBHnjJShvpy99TbOq34LQ7q66zZUtHTCf49MFeGYGdQwFI0MrRT3hu7E5YN5B4_twYJE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_200",
    "name": "Teo's Take Away Cabra",
    "address": "105 Cabra Road, Cabra, Dublin 7",
    "latitude": 53.3612887,
    "longitude": -6.2847852,
    "rating": 4.2,
    "reviewCount": 507,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5jN-ZOiE5sj82U1C9ZWuJVz2bcbtWoFCgRJO28xjr7yyBe7P0wM2_EmtinbCrbemzqds1dLMfefy6XTgSyYrqfzQnDK8qyUqXdFMwgLnOqaaYFdEiTFJXiNIQsg-Thd5jbmVJ5y4t4yKCAgiuVUS8szdM5ySIbdWDhd8Y9GpAKqInhI1Elg2ucNQoGrjBgJ1ZzQKYrG4FSfBy8OYeuMjZDX57uV-KU7dA01MQlZutCnxvcPtii2EohtQLF2KJ2gxXmAgO8AtYsnFRwvoUF7GF03ORDf5kjVDxut9U4MUiGnrGikWHGu8ICLgMdtzT0QIVcvTrpS2o&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_213",
    "name": "Grainger's Hanlons Corner",
    "address": "189 North Circular Road, Dublin",
    "latitude": 53.3573985,
    "longitude": -6.2887529,
    "rating": 4.2,
    "reviewCount": 563,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5xadclheFOn-r8DcjZmZPcIgYseVv6r4lazSMx9z9rQ3XVKlgIVn2dCkf9dbInObDMY5dKW2VAnZmZsYzDM2s3jv0vzvcy6qVNQA65yjR1HmnqhSa3Geli9YNHAyt4vcEtOtVM3ZBklEPMNClARG0fEA1OmrCA4RBzABYwz0f7tfyhJJiv1NI_Rn8MjzXZnaEXQtz8mOOvFT_yT3t_-HGf8mN5uKrSj-QNauvbh2N4TCBCY0bWaaTGiUcI3WIp0jMG_uY8WfBW80ljr6if_pwebBNJ27RgwEtwkRMNL7X8nafP4T-x1QkYGubX4kc1tn8pAaoJ2fY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_218",
    "name": "McGowans of Phibsboro",
    "address": "18 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.356588,
    "longitude": -6.273832,
    "rating": 4.2,
    "reviewCount": 2300,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU49SNlCqz2p14YfxojWNHUMtJeY9YAImA2SQuVLfSjLIgfVCihlsa6bVv55Qnd7A8Du_V1sBrf7jXz3o6uBiSei8_prbPwuf7uNhpc63m5PXxDwOiXH5s8SC0dfBpWzkBOF8xbo5tzOnToukd55aZbgh2KEJzeNICYE78Rs-uucaOQAQrv_KtA-JhMHqHkzVVGGjlMyAE7LS4bvHmLnlJf2FGloNwgK_Dc-KlkcthrIdzzI4_GMjfKc79CKrcYUxsKR_edvXexbG0NHo1IR-6Fkmjh7QysI4hqJEHSszBqgCjzz4e2mgTdpgKlHZMQjfyLF9LwR2Hs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_239",
    "name": "Favourite Fried Chicken",
    "address": "Upper, Clanbrassil Street Upper, Dublin",
    "latitude": 53.3319929,
    "longitude": -6.2754534,
    "rating": 4.2,
    "reviewCount": 178,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5JXYf-U6qsjD4mHRI6sVPpxwW3PxTkfufP-lMMoFeSGXSJCGOvOczOyU8WnRqU_3s2gx6h0EoH7m9aqL4qkzUonMhrvjSdBkjYAltHjeMsjpv6TgTn_w_Jp3bGluUtkbCvYUn9Uvdk81Y7YXQLWrzrX0GVmx-Wp_oWn5oeTpkPNI9bJ-wM39-vsALyAhzCUWLWnl520u047d9WPmU7Mrxo9FgoGy0pA8xWIpCczWOwru3uE6h8q1t5I7-XMoelvi2Q7fk6dvszLu33H7OBpekp9lbJt0LIUhdnvuXv4Oo8v_FRohw3Yn271vA-P2zrrUvURAwy7h9XmeXpiVnHBm5KZylrO7BcUcEKQuH0t4xhXHxCfiUeDJzeM7s69H4qet7DFkDNIwTYeMcNzmXxsycXcnwwgpeXblpVKVXyAD5-RvGVJk3knFH4VZjSu722cMmU-UlG4rThvjLVJrR8w_3utxui2iPQJZ3jt48-25t2vZAUfE1QXPiRBYFK7Fekeo5_texV5MSJPXG6Q17mskeYkKKUHoYqZjnieYXNKwf6pvRd1rO-blRntODJoJBJ1Zd7XQdrM2jfwVnsC40jmSJzQr2jQm2znqXw-yPbRJ0qtpH5U0K02ohBgyrIlrLOtQN48cwKhhgK_r9t-NJfurSd01E&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_242",
    "name": "BBQ Tonight",
    "address": "34 35 Clanbrassil Street Lower, Dublin 8",
    "latitude": 53.3338385,
    "longitude": -6.274759100000001,
    "rating": 4.2,
    "reviewCount": 1087,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU71RZTniQm9g22b1R34aa1g6O8vEfOYfS7SKJT9lsx63X8AGXh-4PfoxliV0JViPR5VMWVot1B6igdAIY-DAfmDaZctvp9rjnkkAJvw_rKVzxs9zyqUAUkqKTtlW37Ci0bpb_6CMLfOC8TKrjeiSiEi85WZjGGdPgmqBlNx3kwPxayd_O2I3SaqPr9iLvO6jakH5TjYvVeKX0KMrY1IUgGl3MAhK6WvxNKUan58VN0_n4LYS6Lb2icrq9Pu5XF4B2RbAlkN7jTQCueXAMlRUEu9uDBqExJnVnEO_j5GhsIB3CM5kZd_GT2Ep_C7LdmaagfTjhPXpusujC5b_oi7AkBjvjac3Z4YbnR0m1g4RXoBM8VV3UK0zpPGjmkWatK4V7zIUDyYOhTbjCUa3o6nW_eQIPj8Ld6BHuE9Jxw-9W58cUhdeh9AxAUi3nlNBk_9-KKtyPAuloTMAC00emBJWykvYX5eiibXShS-uaVeWgcad5hudK36ve6emEYsfeQOpaK9r8IL9JLCn6qOPKJDkPYm6S3WFZSjDUzdGI21l6ytcB3Y-98S_YflwvSwnGcCPEIyoi-gYBNLI91TxIoGB_KrdB2q8YKI666iosvLVEPQggaEd21EaoGlhdIKdg6I&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_254",
    "name": "The Jar",
    "address": "31 Wexford Street, Dublin 2",
    "latitude": 53.33693100000001,
    "longitude": -6.265785000000001,
    "rating": 4.2,
    "reviewCount": 1128,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4H92TqHEGBfc4UQuoito2ReRoW1EHLEk4wY1n_UVcsZKGT3rgHG6CFvveQ7hqcHIdajxMntPWIjS2jgb7N6uPzJouLIV07W5UcOFPMiza0GY4kq9Ym9BDYV47cHzy9jIQdaGQfLgby59kOd6KajDTekS0jyZNdsamNeNuxsNAZx39BS6dY79k5W1aSbA3PKcRbZF6Sazou05UPxeZi8BSW79pBmNoB6nXgSZVnYKE8EizJdH5kHIz2mU0RnUmdOft576Mu_--BavgYtAM4meQSJYkte_0mqpdQYuXZeqScts4UTxzl3dQSfsfSvXlrsrs2eQt8rg8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_6",
    "name": "Harbourmaster Bar & Restaurant",
    "address": "Customs House Dock, International Financial Services Centre, Dublin 1",
    "latitude": 53.34976589999999,
    "longitude": -6.249061799999999,
    "rating": 4.1,
    "reviewCount": 3251,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7nmzTDYt-cyUmv6gQFoD_A0eH1INK4kmK7gNel6HP8ri2qV2aRCGIL0fi-DvnkBegRlGokfURecXyNuBI5xHc9yzsRsehrfyPuCq1OvN-wqZ9NZn6bbf928-4yijXYkMOFvGvxTlaBHhVjDdfW_vmH9LRgp0wOHi8KXoudpA7gBL7e5XXz4eLBId5PykbCOYjPSDgVqExd4Ao9TKOkaa7I14rSCfkUxZY9AtGIBDHbtPhfd2e1yrh7pg4lKo7MwumIt3_nni1oLTbvVG_tu9vdVdRZpl_W1F4R3ACSgYRB96iT2_N1prkEfosiwCwqqG_h-864hMI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_14",
    "name": "Eccles Townhouse",
    "address": "72 73 Dorset Street Upper, Phibsborough, Dublin",
    "latitude": 53.35741849999999,
    "longitude": -6.2641635,
    "rating": 4.1,
    "reviewCount": 436,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7RtBr8TU2lTlH0vByNefqP_qEStlvmDPtvG1ROfk7U4dVkHoKyfNlHfWoZNF6s_CMuBWH1jD_id59XMjbyY9XuJtZkQ42X08HHHkE95mlQXCWtnaTtcQrORAwFDI7QR2_8mrfNYZeOXPG9K2MkeaDYX1JmF8GWWouMs7J1Hn-rAEHEwa5JanynSjh39ZsYCL2VsLm-EeojPP7oUWtm-xm95YPJP9GDWZvL7LbILDSzH4Ix8y_7LRNS5rWFpQ4BxgcYPzZpxefsdbiIjej3p24akGQDcPBFmeGjpDD5pVQZAPVaitVDDTlVu-xZE8BUu_WMBeVymrz1E63XSeAUks2tq9bIZSikrBpoJlSdIVuJR0RK033gAMaw9zmQBJeo6zXoD4371z9X7YXcYQfEen21eGGj9jzIcCX771HqXNHBDRqhHp5Rc_-GwSmh0WE62v1TLUru7wm1_WP0gtU5pGaFR_XEyF6Lq_05ST_PMdNSxHFZ38FU1OEY35SMBw8uuop2D28YADdOfrKe_GwI1BpzbS98d22vqJXErMB6HuifbERfcGR1eVzCv3_zcNxCNXuPrnPocEkQeO_0H5rE64rR2QMbpsJuGdyX9QOyrJac_bPl9Y3Eky_YOIONGnhUvqOqtg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_23",
    "name": "Academy Plaza Hotel",
    "address": "10-14, Findlater Place, Rotunda, Dublin 1",
    "latitude": 53.3525091,
    "longitude": -6.2599113,
    "rating": 4.1,
    "reviewCount": 3759,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU70FhTvwtOfxydvt_4RduKBu9HP4XtEux9LAiyRBs2o0m0HSDMmoaPC7ThHL7EpbKdsXYkiZ9X3VMZXKkI5KIQYHnu530UE0h0pPW1Dkp__jwEmNXTn1kBndbydW4F3J64884dQGwlvhRlRW9vuNfTRrIYIBXuVIPKq9uZoqevoSlmYWE27u-EplVB2VfAHFjSDVI4h3eCaxq2_g2t2H8MIJTafz7mHoubqAEkgUz2noO7L8CR3sLJQKlAXHwsDZ7nnL2y3RaA8YmXLxbooXBimori9ALyWvpPyjS8FGq6SEseaE4StFFXAqqsWuc9JzZE-89jSpH4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_31",
    "name": "Fitzsimons Temple Bar",
    "address": "21/22, Wellington Quay, Temple Bar, Dublin",
    "latitude": 53.34547209999999,
    "longitude": -6.265026,
    "rating": 4.1,
    "reviewCount": 4823,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU48xE_kFTx74-LeCOiqsm3SMSHliEk3Ol29-Wx0ZGt7M_leoAXOmGphX2HD1ERQVl6naEaJCmH26zWkZG2MGEI4oqD-0KNOZhbFHvNf3bstJ1huvK218l210xW5aRd7J_WochofWh3o30xa5rpB_DKLr58m1zKTaoMKnAQYI6HKOxePTki-aG1lAIoLLXUh9V8-UVI9hnC_52CZzy4wrI9pyEAE3DNtDd-LuOEerWQVlfJgTDBkte-3fRLmCvLpvP4-QpRUPDPFm4Tid5iJfdjJpf0K3Tqe5fiTaFpBtFG8ctxlZgrKVkziFoKJXCMi9ewhojLu73jLK-OTMI9O9mptsppskdUsZu5AndIL_OGbQetKSaW3PUOVQUdcMMEI7zhw8PkwHKp52TudcRTSSKBh2X0H9PeG088a-1_9-zPFUP-Nhc7xCjpSselBa1nWS3DxQzTXX6RiGMDRG9yv55zbAfS67DuN22f6BauW6p4qI1bwgMHABUV7HT3A-pgC0FxRQOPcp85xb7h3Ms6RT8P8NK5MFsn2QYjKgxZWT4tfJriTyclJ7OldpCytEGZ7tMsBy3owOpKDxD18yVirRVgRuOZ6MPpohqngpiCQPOpXD4L7yDU5pKxa5NFumYkcFh9rYdyg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_43",
    "name": "The Grand Social",
    "address": "35 Liffey Street Lower, Dublin 1",
    "latitude": 53.3469006,
    "longitude": -6.263458799999999,
    "rating": 4.1,
    "reviewCount": 2793,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6fLhf-i4dQplZlGfPPbP7w2smqRFKg-0JDKT-GaUMr7eRKKH841T7c5AMclrV9WjSQjOp7zF6UslGFYckdlnxpOEW3rTZ_yi1VIGCg7C1rhdwoIVJUn_L-40nJRveRZUnGKakMkZ-3Flb3rbd9B8SwJ7whMRyzB0dZ5tySaJvqe73OR_JF3YK1qyisPkd3O51QEd6Dn6ExXNZvFW-LgEPFDa7cKUr9tlXWmZE2G0Ej-ncwMTz9zH2t_jZssve73ZxRidLTD-p8nd3CdNU4-ypwL88l523vVTyxs8kYXdh2nDxIp3Fl7ZsGiq8bFEeCQbf9UXGgvDI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_53",
    "name": "KC Peaches",
    "address": "North 35, 37 Saint Stephen's Green, Dublin 2",
    "latitude": 53.3386738,
    "longitude": -6.255293,
    "rating": 4.1,
    "reviewCount": 1204,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU74UuAnZ7dcwL7sGIQGw7t7EJ6T_nIZIqadJn5CHxL6JzuUVnAmwNxTvbEEhVReYXT8P0EMw27pqu6o5u09UYeaRRVSF4BcynnkscZlfjTO0S80tQZ7XwYdjxfp7c0lS-lS_TiZchDYIQugZSrjLpghCVfjhHn-yGPs7Nu7YoLTZq6ce0wx3f0xH4498aJLH4GHOiZFQT6tr66eLSFuzltsrYkmsWhBJYUUY78147BE0PxMBQ5Wqky3ZnzJlb59ZPqBS0A05xZFmQaEH-sCZNu6HT0yTADh3pOBqF3ApKvvw22bvVMTkz4T1A3jerI8sjU79xb9SigMru6rrqBsNIJu8Lm1ox81upCfxldPTtLrqe5ysfoH8E29tvCfZzUVRROf8u6lASNjoEh4dHs97QeShgAkGrTvYOvFYTR4zMEIGfSIU_1nwSRhdfTH8SwyCJYXBwACH4dAkNGHDo6o_Ml5Q4ArzuolX4weH9Ij7jW47N7VStfnL1chBK46VJO4SsmvgnAh5kP1lrJlvToMXTWjS4wOcyDI2FbOgGQS2wcdEUzNWqPKa38Hx4aybmBdmLtf56PDwvZCIuTrPU4kD2Rym2Tu3t2-WUIawZKuF3O1C_g01IJZ_RfesHTQpPYMAME_4xTWYl21MoZqHfG_r8nWOYI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_66",
    "name": "Portobello Bar",
    "address": "33 Richmond Street South, Dublin 2",
    "latitude": 53.3303883,
    "longitude": -6.2639316,
    "rating": 4.1,
    "reviewCount": 1098,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU69aRfFvYhy_wwut_8XSFHUFSqQy3Q1tc5GjYd7kMSxpszp9FtShJHgZcn9ZUKWnyGMKHOC2p5ZTf-f_S3EEOoAutz2kMjHubDAcR98eaY3Ksv81jljEYYljKU6nvZbKmq5r055K7bmHih81D96445ZvBgCpBelWqehRFzFl06QO5Sc1l7SLB-4_-6WW4KsB6E32BsTjVLBGObrcvNxPAV2Z2tRWLq3f0ISNf6ToErjGZw7mREMG_XJIAanApOYMI5s7mgf9tj-l66zrClozTHLv_M1kQee-Byct6b58pRwT3fZ0HH4YutwO_P7CXDcbzd7c9n4wds&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_72",
    "name": "Lolly and Cooks",
    "address": "Herbert Park, Dublin 4",
    "latitude": 53.32836789999999,
    "longitude": -6.231732899999999,
    "rating": 4.1,
    "reviewCount": 380,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4j-CvTKfPuwDubgOipmhwfcuByyehv3YNPe_AtyObmdD2QG2yBz_PV0wgPmdliJFpeOfSI8x-Zb6672GwY81u0mwn2kzPT6XxqGaM2PUWqshp29B0HEFaT6J-fFRt2HFnd0Z-fs1enaJ_4gp4Dw0Fu_gBbw0YkglqqtT3rhF5F3fJuY1F2ypFqMSnVcOOwlj5j2ISwOI36Obxi_0jlu4x5SGFjpZ3u-DTEYhbYY0qIlaXumYyEWAZ8f1Scz194FtKNZKIxvy9wxDTWrE_xdyad1LAqWBmKNWWpeHEzwyvpBYC7FNt89vNIWwz8aFtHHcj6e3dxpl5a8V-v3u12xVCR8m7TY9jFVnh77fwUoZob-yiqyQLV12RlKDfiM_VAM-TIFJP8Mupjz4XayJSf8gQebfjzw5p8WGdejyafelHHwPCBEp8AiNKjbBNeLPhfuwv9AiXrBTCgMBaWfd_zo0A0qy3_tgr-gMOhbjXopNZWKvBofU4WXKPX8S7a0eCMZrVnZSPWPk7dun4rdTb__TCWoC0XklLLlYMIRITmf1ZdrLIIghS_E_j6yoJ7JFp1aNEVcWhFruyEW6rpAWvn7gmYNXJVJDS4C9gBIKqPvz2hnM85JrBiGiS8ufWHuc0o&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_74",
    "name": "Starbucks The Oval",
    "address": "Dublin - Ballsbridge THE Oval The Oval Unit 2, Dublin",
    "latitude": 53.3311857,
    "longitude": -6.231657299999998,
    "rating": 4.1,
    "reviewCount": 365,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6hwvXbSD-ex-etQrkdJ87Z26oIfO3GKPdk5FqRE8QC6INrUssWSq8UseWMNaL03QloNMa0DEpAZiDkxQBu4eWrg43fZKfD5Bg1FaAXZXrAyINfNg-fIVNWzBH9yYnY2StY-aqtJPrrpOhIwYtF4I2ee_zxhh-q-WyGdcCq7dHqqncqXvriFPBMp-n1njm_tmIKuxDg676az8LEFdXhosFYatSf4bbVuBY4uRG_xctZ4KbtMrBsKu0XD2yWSIAx7quLAphDKk7r3dXluJJP_C3V4VjgeyHwt-B76eYEJRzIfx1QokVWElJqE2JAkbOmb09Z9MadM9vNG-3EJ_cRoTRVj-bhQACtGmAgLjkK0OFz30X3qqtI2AVnEsO9M65k85CcXzCI2cmMFbL2X_uXZQewgaTvQiUo973Wj0m6LLVrnXwqwenwadqcBcKGLrGGMwHcwruOYF3AZXXSPLWu_dW6WNnnfwI10Zb9l9SZuIIoUnhItK1joxpefAJMLxxoXKHbc3DulZYfO5pV0E0A6kZh-wI9qyEScspX3xVM96k8WQ0sw-r0QQl1-DpyKNqOLgaU2LsOz5s4C_7TeiCpvIzN02fQCxt9WwGRg1QW5q59EXoKI_o25KKXA5Nt-2pI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_101",
    "name": "Four Star Pizza Ballsbridge",
    "address": "51 Shelbourne Road, Dublin 4",
    "latitude": 53.3302276,
    "longitude": -6.2320329,
    "rating": 4.1,
    "reviewCount": 291,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU42bKhyOOuAcYj-j6MSs3nX3xSG7JkQyg2LeFEi2G8dCP1Fknj33Yjcg9ZxOn1v7rRmsOCIZuuWqif2oZGasro07u-HG1SJTx6ya5KjdnvC_g2JGWE-njLVWNlUtDPv3p1oqBt5oCVwo3aQjddKCjPkI8Zkya_BtnzxRxfCq4Jqzff0_wHemQkafZh5WA7SYvFgA4GdkBV-z8MKy_DG9lfbBmFJldubqBF_-EvUIe6AKj5e7IhL66Pxh7SYKVN6vGHPjFTOTjt5DHxEJj-jZbCqVDVbEdQ3kGlQuB3k7NxL9be-4Z7rbC19J-U5F3opKOjwrJmnx-o&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_119",
    "name": "Avoca Fodder Restaurant",
    "address": "Shelbourne Road, Ballsbridge, Dublin",
    "latitude": 53.3319492,
    "longitude": -6.232424100000001,
    "rating": 4.1,
    "reviewCount": 183,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5c89cCTZ48jtldS7izZUcwMtrqsnTe1GguXiguJLhMl7hMlsdr93h8bRImHPoMqeVnuW3NlhisJrkY5UNN74_8Z0xZXJQIWTftK_ynkpzfA0EzxMeFP_stnMqcv0l-0vGn3ALj37WfMZHHiLTFgwf44nnCw0l8BuAOid6FJkE7qox_zaa512ygJyZx_IqgZGZaOdgRrKGArvyK938bprICD589FAEy35-M3Wjn6S9A5bKk5UVMab39vhs1WV8d3zz6mapxe4MPlQEnoLRoibmm6anabLsGEJ7zXx-4LVQkjEc87vZmdwzPDYHbcBa9QjOyTA7xy-4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_120",
    "name": "The Morehampton",
    "address": "135 Morehampton Road, Donnybrook",
    "latitude": 53.3228389,
    "longitude": -6.238499099999999,
    "rating": 4.1,
    "reviewCount": 430,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5r6H9HVjweZZRwnicMbZyAxAgMEHnY-VSt1CIrlSg1kIv-AWoYC2k8QkkdKWP2In2JITMB8evYZmQ7WikCA_mg4C1NwGKuBiGryQI4lYtCc7a7ftP1nMO3wDpONgA7PvNb7YjxGjNAkP1hbUXJUwtW9s6tq78PhHq_XQ0HB6vUWEiWAhIsO_8ssUuXnP4Tj59KrX3CLc7i5rFppDFg64TnKs0hZQqDcpX5w6ICA5M9wJ_4-I9dgqBoPK9W_sqDb6UlWKWpZa-L5tJMDwgcDL6SGlKlxSvQ65Y0GRMbXDRhw3VtSy11sJ9FU7MvwR-jO38UgUIRd7E&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_152",
    "name": "Tadka House Indian Takeaway",
    "address": "146 Rathmines Road Lower, Rathmines, Dublin",
    "latitude": 53.3252028,
    "longitude": -6.2648281,
    "rating": 4.1,
    "reviewCount": 284,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7v76PctSaH6w-TZP-KAy3aGI1D7ZFfipaUP3tztFcMdl2WiGB2-mbg9P4Lq4xtnClCqIbnUzACr0kqDHBVoO98QO2l0E_SiQ0biclhGKtw9ymX1iKMCwIrBDJPm6h2gadkt6GHRUpsXIUCczXRoPqC-irD4upzMP1Y76ga1ZJezIwXxgf6_w_OyIJOXX177POHQjDrw_OgyZCnI4Il40dYIPMN1XQH_ike9iAMs2ShMdjO4C4LE05-UWoLWD34CWSxxq1bXcc_2RvaHAVktBlWKUHyTvw3rG-8v1pWyO_cpk23kwy89wKHbZoT0jCUhvN9EZNEWqYGOTeCdWDf07rsNRtsKewvePnuanKgoduWOqxdBlQlKGYJrBSo_GvWpkMbrzv7xDbAXY-zgMPT5rR5mmZXefLvfpjqMfEv9GyTAuQdqMHzqH207bQQpFVrpTVGzFmS2y8blqbCI0mtJoHytJH_Mx262mSYsJZJRz-4_Odr7O2eWu3jbVyduNCd1jFKvPI_j2VMOTh53pqdlV2LJRxvNigDl3QRmGPtWsAZN79Y7_-Hyy3cy9JKoee8VO6J9nznDHEKX8iAkkaceP3-HxlUuf-EvnPN7HU-64sg3vfkGjMIjBzFD7QvCeuhtYNNV5_g3u3XKTEoiOTlaA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_153",
    "name": "Camile Thai Rathmines",
    "address": "133 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.3255748,
    "longitude": -6.265241800000001,
    "rating": 4.1,
    "reviewCount": 436,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7F2RV_xW1ESGQyrgUAt3IZyn4LykfU3dmcTPCp-3tYLmSTyBN-Z5ZioZ9qW1pu6UGkv49y7vGc-dgp0DuDtin7uV5DQn8_tzjrE6ZfdLqHYiNxo8nTwCS7eAhfBFolbhbTLfOcdA62KNTTn4n9WXDTn512Ep7Z83Fy1pYz6klxVNwupskSxKk9PVSlFYHER424GhdaqYF0pMbCCj8LbCb8w8T4mLyMXriXixjTk5Qom9u9V6Gjb6WNSUQ0xsvPqqmrxdrVeUsmD7C26KbQSNj1PQc3sF7gCRF_C11_Rb85hKxOrkKPS5wAbFwFTMdbRNcgHh9Xx4s&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_196",
    "name": "Hidden Dojo Asian Street Food",
    "address": "47 Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.3594613,
    "longitude": -6.272941899999998,
    "rating": 4.1,
    "reviewCount": 209,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6iRXOe4oB0PslpPRyC0YhijehVGO8ZcOUoUzsNSFBRunFp-mtasN9caoJKwR1GxTl3IiKA8Q8HVXXbI3jQsQ2CbCWRcuLz509bJVnqd1OXh6jbjFECrLvHmq7-KNK1VbFQNVt6gOqUT1i6g9iPg9wLnLCIZA3RqXxg1XxjzVxtbZ-foT3aE3WZOMWGVnSyNMUZNQhq5PVQt1WAwnkuBALHnKacuDM2XTYZ0opgt2g2cZGT7vUZ3Mv6rCFBSE9qdiqydkZNl9rizG1H5gj13M-ewnPwLNvlA-8_n-YSXjS4zsBTau_i61kZ58h0o5FFDl4C0wK-Xdd4AiOBqEBbRoUE-n7QgKEOdpYIqHsuzD9K0OKdv120HvqtPceCYRvAOAhoOBZ2KqeSlKcZJy7V6wzw02vecurRL7wwQS4aRGn2L4wj8d8K5Q9pJpuq44jRol_PAdVGxhvbw4117pdjiOqxgbaTeW4FUloqIRoTvLcs5JxWdvH74C5ekcmRinoY_ZE1QMVoT7sMcy8dmKjQXSOn27VZHk8OJgpbuVifCsn25B3Nc2GkmhJQhpsqtE5y8hBjEkgJZnbOQAdAK_x02vbpM7cXKhq6N9AmuUXjdcEkTaS5MsN09STBd9jTJzZcQDKa0Q&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_225",
    "name": "Caffè Nero",
    "address": "14/15, Camden Street Lower, Dublin",
    "latitude": 53.3355434,
    "longitude": -6.265012299999999,
    "rating": 4.1,
    "reviewCount": 605,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4H5iDUMjBYK0eSgCJnawjbsdPBPr_6yrQUINKBMOhqJylFfjPcuwjXq2n3PSeiuP_0Gl7Tbdjyjvyin2i8qFKCjlcxI6_ii0kQ5ihi26kYL7FiwxZEn_c1-Gvdjiv-SPZ6Un9Ukh6L9UfjynLNkzzai2R9T6BOzdeZt3dp-afyLruVg1mkqz3PgmSc1cNhO-G1pEWV-R27dObdeBYyDBBsn8VOU2ECkXfwElSGjwXq4oHxFwRlVFdH9Ot3fO4OSiAXqvjoB7LMOJUI2GMSbSQ_oWohxaGzIJQ0qFOiV36rEZm5NryNwtalTer9kN7fLU9gatLy5tGWDWNSdDS63Zm4iL1fhZCzPsVNu1v-a73xZMQuo4ofee0zkqBnsbcCc321YthCE4prSN3Tx2FuS13xOB8g5WaLZ9q58FIFXPUHe4Dj5YmGH9vqLnOWtCx1seYHNTbHXklIVWvsy7NvnN3o7xQIFl1_mHauNXL09fWORVDNEB3Jp0aev43u_oCx7F6mBGZqRsT2FSlExWD-Binpz8SpevqtxbcgsQAwIeHZks90Qgi2Txv3g4R2ekmDZWpfB6cljfvNfN03-E1QPIFuDyc_OGzYq7tkdtIJumO_-l5nwV3bXcJaUz4Hag4hNJJ9Ew&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_243",
    "name": "The Bistro",
    "address": "30 Clanbrassil Street Lower, Dublin",
    "latitude": 53.3342114,
    "longitude": -6.2745286,
    "rating": 4.1,
    "reviewCount": 129,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7UCjHz4FrGYuRH9SK12x4nPWXXNquMVMGhpApcJZECxP6HS0wEdFhSTOAFcyOhyVs4eQ6cKzJURsJkMbDjIScOFuL0sOuNI6xAtSBA6chyz5-n3JZuNHVXnNELCy2C6W9Fan65p8Ww-fcosbbiEpVpY73OmCVtn5E4WNIuFetZ-GO4Gxga3v9cMpgda_KiFs-I7RqDK937aMhboWkzaAQ-8_W4rNIPIqknLkdYkVNDZC5W6YmfBUoiSr5YGixk-UP6dZiVSLVwbKrNducb2rhLaaDaVHYLxy4cKpdwdQZgxo7kbhOCOKTjL2-b88aPV_rV7_F99zaYcTkbiOI3lEIcqX__ZNEQ_VzEfDZKTe0YmFKuuZrbq6iNS9RGhdKTrXy0jyhDksz77gOA7gua9kZh-qmmGBsRel3hP9XLc7kQ4C-8h20Z4V7_-QoYPJCc2s4FqseoPTomPG_QqbYkET0Eg53QVpxMS2-jXPwIp2llRUUMCpwEXjsz2zTy4AGQtdlaA4KghFZnj-ZYBEdJvMSVMqpfMZX6-x-dyl2kSahbl7mg7QTajDRITdlAR9hY_JOF4VpAswFrp0AosLHsE_BMO84lCFJVmv7kSUzZ2zxvy52Z-7Y9YPQXrX7DOvtKtggqqw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_252",
    "name": "The Dean Dublin",
    "address": "33 Harcourt Street, Saint Kevin's",
    "latitude": 53.3352055,
    "longitude": -6.2637468,
    "rating": 4.1,
    "reviewCount": 1349,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4SSMp9nNjyLcR0PckZQfm4WuzbTxVMczH4SXsrvnTq6GoUy8-Q_mr3-97pkFysKt5CCZz4ipH76NW8PPZ0tfFcQqliUliqBU5-7PRIYHkoM6qao_4N26X_Ta6Fi424dd4OG6nguq7zLCdYXASKv0GrPrWB7EshwbqnlljBfZ9s23BdeM_32oJMLIPFyoyGgLkRB2D7_B238UGfAVCAvPgxmbkEBjFRYKRa6CqFCAkomQ1zAM5p3FQkRqUh02itLLYUBPibMJHbj-CoJ_g1ACGH4NpPWTGWaGOikRFs5CecfSdJPcfsgYpNkwH3djT_xmim4scPbOI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_9",
    "name": "KC Peaches Cafe Nassau Street",
    "address": "27-29 Nassau Street, Dublin 2",
    "latitude": 53.34273659999999,
    "longitude": -6.2572952,
    "rating": 4,
    "reviewCount": 1376,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4tdScyyiBfY8s2LUE9qDujOFWBiNHftpzGXYm1qX--qNXMSIObe44VfOvg3rMb8VbjeGQufTfquqmvzLamin4dtyxD0eenfvY_AdlSCNwupfA9z27dtR0uYgjHxN2Q0B08akst_tIY3Di3BaSDhOMEWvpoOvXtKe6d2_tmJtnlv-L4rKWz9_9J3JUiVL5x4jUHMCjpaGXg63re6x3vvLHrXIpBdfNKK9qW_aGLcBe_m4O4tXCw1NQfqT08cSj3XQnn4wyNBcaPVeHKR8QRhi81Biyuv2CnhNz5yJyYgqYsMeFTZo4JQ1zv_Z0mKGp46Ik_hCTKcU0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_10",
    "name": "Starbucks College Green",
    "address": "1 College Green, Temple Bar",
    "latitude": 53.3444752,
    "longitude": -6.2612559,
    "rating": 4,
    "reviewCount": 2044,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4wPZWnpEiMuASXq4eQjWdOl54wVLUrQyjztDV4v33pVeMs5tlY2QVNWTZSo1Tb3zyMHSOn_Kc2t5npGGqVA8j1hNIPwUTRKUsEmcZF7i1Ym42ISBRw-8LhOerE-UYKbE7F1iff8nKOSW55Xkbz3gXASlr0knpLybpiH04Wi0T5nJg3S27zYX93eEx6ZK7Uq1hzw1qPiP7OLubAQqjMjgHKrA1GmVhB3t4VI-fh2VDSzXnsS3oiLywfTMsNYh7jz9drn62bhxlFnS31ChCPfjQT-P5BWgVqvLDyyohLFhlSAqCLgQ_jMCH6skyaOGXI6_ZEKH_P3Dq0gCKGtIptHUAJam5-839ABAOEvWxNLUOPuu9hVdPtmtNGvsum_V_qjiniiIBZm_GqH1WghcF1FFg4fxDQkIz_Pp8294s0Dak9TWtXhQI1TcK7R1UkMQlszp4r09MD9D7kFjTmPUvD1rysg3fUg_J8_Zr2Ybj-_EUDyHY-XwS9cn-oplUxWoBCYZzmZZlSqDPqD1sthWWSJM5YaSwBhSRFyoFzh-_Q8lvH3CdfqykGeRbYDO9bChC9vyk1ghzYRWkmbBfp80tk3fGv69viaiQZDgBy0_qDCqIumBREFLuu19W9RvDqwXB4c1CaU6DW&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_24",
    "name": "The Address Hotel Connolly",
    "address": "Amiens Street, Dublin 1",
    "latitude": 53.3517696,
    "longitude": -6.250014600000001,
    "rating": 4,
    "reviewCount": 1950,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5MJdpHWbom0_d-9v_fiG-Ql0vHcc_seVadoSpZutpnCjZN7In3KEHYYjVruDeKUY8W12nFxAaxUqz3qmuTeOPUiA3JXnJ7VclvqBqlm7HVkdYR0rTdH0Q9sXt8jbTa9CZloth8OJ37AHHVxnKnYZ4LACA7icWeXvDT8xwwn29BpzFKdki81Vvy5kSJpzQgpzILZqesvisfhox584nDbULT18OexHwur_0_OMi1N7UsbMvRlcqwSdeagPE5qC9ZxoZ9lSfsW1r46kr08BdspBRDpdtJp70LsqIuWoD7AfhujWJQjXep_si_F9t8t_k9UmI8XPc1jUMgdD08Iz644euAThmw57G8Pjtx3_1tj3T8OvuEhBI7TLgyI1hkVsYQUlmFe7TdmjcHWhl1YGpQn20A8wlyCPlVEanUz4CX7YR_inEPKw-8MB__MKG9DV-ODQKAlK55njR77DTeEueMHvkchsSM5_Czeu8Ds7K3mejWtYZRx53LvorDhzyXCMfG41psetyd0YXN8f97MfSfRJee7kOl_tcfNO2aU2qdz-q-MZ1HSd4XCXHosp0Hz7t7s1wCk27iTsznSUtmQl6AtYHSraRqhXE2YyiVkI-iQrLxhFc_2esP1EvcqcrJJGYCWEBqhQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_68",
    "name": "Dakota",
    "address": "8/9 William Street South, Dublin 2",
    "latitude": 53.34265860000001,
    "longitude": -6.262323100000001,
    "rating": 4,
    "reviewCount": 1561,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6e5d647_iK2GlvG4ns3oT0NEIYEqr2Zc2iCkIU33M8Yr8TUZDBszlJXA564e3sXOq3GC3nNGWHN8No5Y8BFv5gXDYUYSUbHOXMX2TZ5a65oEmeroZputfM-87vRToIwV7wAe86AEXNBO8ym-s0f7TpTzCh4fj2rzrm7VS6ZZRFsmNb3SZb0FSCsp1kO_Hbgv4PgSjuFtW7tCILYqTuONNpCYLC8Jn9KBs1alq-k3sOhjbY03dIXM3VZw4jvAu7oeYQRsBBamRNUr-asceq550x9ellSlcEQua2pEPdf3Loizuqzmlw-1FL0JhYjgVfS_aJgDto8OY&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_81",
    "name": "Waterloo lodge",
    "address": "18 Ballsbridge Avenue, Ballsbridge, Dublin 4",
    "latitude": 53.3304138,
    "longitude": -6.229196399999999,
    "rating": 4,
    "reviewCount": 0,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_83",
    "name": "Gokul Tea Shop",
    "address": "RDS Simmonscourt, Simmonscourt Road, Ballsbridge, Dublin",
    "latitude": 53.32302559999999,
    "longitude": -6.2255524,
    "rating": 4,
    "reviewCount": 0,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_84",
    "name": "Coffeeangel",
    "address": "41/43 Shelbourne Road, Dublin 4",
    "latitude": 53.3305039,
    "longitude": -6.232098200000001,
    "rating": 4,
    "reviewCount": 0,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_107",
    "name": "Grandstand Restaurant",
    "address": "4 Merrion Road, Ballsbridge, Dublin",
    "latitude": 53.3254979,
    "longitude": -6.2251576,
    "rating": 4,
    "reviewCount": 107,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6uYjhrzbYt4eCe0jXO6vox2PYto7K9sFtFNzt9gAbl0r369IoaYjoybWkyBjpkX8rF7IVh2KMTB2iP9M-l3C80KScFR2U-91D6-GuCb5nEHlH7isqR0xd73F5AWr0jsUhfcpLDrm4kZO1b7_jSDHcC-_wz3k-YDDOTIyD0FHYaWnJoHPBiHwe29E3QV6cVl4PW0Br-aZ9RtN4Y8nGVCj8Zh8v_giCobixpO_tvi_6Ojso0TGrVqu9xbq7XobhaH2-3mOaDtpWJ5hibrzqwljnM0aeXem1XSff1MWqR3JBc7Ibr9sQQzB03SBv4qJNegpe81epISg8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_118",
    "name": "ServeYou The Art of Mixology by Andi Zambrucki",
    "address": "Ollie Campbell Park, 28a Anglesea Road, Ballsbridge, Dublin 4",
    "latitude": 53.32233029999999,
    "longitude": -6.230133899999999,
    "rating": 4,
    "reviewCount": 0,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://via.placeholder.com/400x300?text=No+Photo"
    ]
  },
  {
    "id": "venue_164",
    "name": "Candlelight Bar Rathmines",
    "address": "2 Castlewood Avenue, Rathmines, Dublin",
    "latitude": 53.32280619999999,
    "longitude": -6.264699999999999,
    "rating": 4,
    "reviewCount": 0,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6Ox5aTdEKSmCJ60fkP1g5NuJiHsYzOJKLlsgViSZ-MhuOdWwvjoQtj2Pm4sOyPSeQt57-3akpjB5vmg9pUPoSSucsbgnV_gH_zPGsjyrLmAngnceIGyPW-re6lv9A91Roh4WfJVtKMqs-d3FkGRFz1G1hlQHtc_CDSrogH8ChWyqMJz7ReHzWRUpFdBd5ShybG9eL2ORMluKzS0qDYjGAQNnEi08FgCd7wRVmepjfstSp7TyIG_dUnWmwu6zqMVCeX57hgc6eFSKPFhP7mwbORjiT8KRKnqDZE2kS3ggjk1D8ZFXNtroEnedoAhoscr486D18jpyQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_228",
    "name": "Starbucks Bishop's Square",
    "address": "40 Kevin Street Lower, Dublin 8",
    "latitude": 53.33771609999999,
    "longitude": -6.2671319,
    "rating": 4,
    "reviewCount": 355,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6kMSu-h_aid81MtTDfK9ptUckEV3lzW3Vh3hyg4L-xY5DnZPFgRzKWUiOOC4oxZF2iKXWF0ML-eFl5aAepjgZbJSfZcnLPqlP9UG2weFCCTBuSIC0pJMLZT_z1tbKRHp28Jm0SyTGKtUHPcgGP2hJWhYNgHnaw0jvNn7Oo2SL0WxJGLzqsG_-iswVR959hZ_60-WcYNe5IO2KNOD4s0kBU3Y_XbqXpttQRls-maikAp-E_-AXtgxdpWMbNEwkgEZsZf3M9sb62xaigT-nh36dkCsFdGWZi-guNFu9mBC2DXpABPcVib__udaB2kMzhi_4T7iuPFyA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_234",
    "name": "Flannery's Bar",
    "address": "6 Camden Street Lower, Dublin 2",
    "latitude": 53.3360729,
    "longitude": -6.2651044,
    "rating": 4,
    "reviewCount": 1600,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5HIQJyXSt7x3PPpDEIMYNlfJBepdS4F_8n1vJu7Wg3djLwZaBais02v4QuBn-ozSMO6zE2XWJ-pTx0qGHpsCJ7ZWgfhBMlUroDMH2ZUGS4O08IzDB59VALl4ikry7yv7oWupPV028uz-sWD4LrgXQaaeN1k0hq1Sv-oWiGO27ep7C6O2lUjcb44QjwAo56FQ9IVezBHoWGH7xU-sgqXlVZV-fml50eMKomGUYCpPbnvnfb4V84KfycoK7GKjOZ56LPt5ZVpRbOKpkYbaT_bxAbQYzsuLMkwee9QUD4Nn89k8k7it_9VvYG3JO-7GYRQbsnkHOV1_c&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_246",
    "name": "D Two",
    "address": "60 Harcourt Street, Dublin 2",
    "latitude": 53.3343886,
    "longitude": -6.262885,
    "rating": 4,
    "reviewCount": 1561,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7KWbZ6prUTO8O4SzMe6YTqF33QfPG4vOa3ZacUjGD7DjBcE8jWEGxGtlEbbV_OYIwKMbBIfPWK2zHpHVpJ1QPSQmpeo0RjBBPb_JkuOzhPbT8BRplUdeCS16kBCwGFdgwtpFFxn1QEHr6q_pW9MCjT8fjLh9H4pMdFoM3cRxI73BMx49AXOOAQA5IFv-yax0G4y6d7kADI4SMLhl0syecaeTwzBbi9rrezyolrJo5DT0ep-LFv1OhZIS2y9gzSTI5zN_jNGaQMpn7GvimamTBYfLv3kKNE4gtNXZ8OR2jOTeF5aZ9tauLhdso5679OZLOIA3Puo79EBlCBUr0VkD0xLbYR2fAERNg9YLaCuzi6yKmuR4WEFmR0Xpf6whaib-AyoXsVm3ZohqPUBVG_hCY_jEV_MnvCtw9cTgvJZPImCA3lL1VSmL29kcJhd0ZwPeQRpM5vYNV4AOGwGkXS-3onwGKpeOfxIAzk6bQgTMtNz5GyT_2P6MUuyKrOtwZAoPOXcIUt0nJLzMrJsb68QfZxITFHBEjr36bKcKeVbNQC_WL2eGI_Z-TZTuUg_GzhsrZvIQQ_blb2sZr_qhPsCoZoIVBevkDfAukAx1h41e_z8TiXrd1tiztVHvAAKaDPrMPiGq2Y&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_251",
    "name": "The Black Door",
    "address": "58 Harcourt Street, Dublin",
    "latitude": 53.3342603,
    "longitude": -6.2627717,
    "rating": 4,
    "reviewCount": 795,
    "priceLevel": 3,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7CXxOApwVtHj4iAcMCvSDYHA_VS587DEO788FAaw7oMhtXsz2_04Ah5Qf1jGFS-QyeEtVD02a1SCDGxAD19TbtFNZumtUN_JXb1r5n1qK-G9R2mqjkWqYcg0kyynHS7pVVC5oRHHb9Fi0BwKFQMNW-0e-99ForcMeBSeKZuIeHRwLqd6HKa0c_vw1gFn3CdoDI6NwWmkiCjsc4GEZtaniaAzj-fYetur8LNzcAaTbPP9Eoqfw7L5neY052vKQeHJzhnESHVbsmxotKoV9nMfjDkOD67wEQfq-4_yWbrBrfCWc1JRSS1vxczKgxPmfEGE26-VakCLE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_12",
    "name": "Costa Dawson Street",
    "address": "1 Dawson Street, Dublin 2",
    "latitude": 53.3427794,
    "longitude": -6.2575938,
    "rating": 3.9,
    "reviewCount": 1192,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6BQEn2Nwmao6HJ6OvOFR5e79tPF6vMyGWB3MCDGU5nztSvHJGZVaAjf7kRiz-0Zc0W3u-hl5g8XTX2JOsu00x0w8l49Ol0M0jfLo-Q1W91MPk7KPMYemy7Gl2EJ-bC64XLEKMwVfOvQwM_dZkEXxO6uXNNwYd1do31cUnBJTPn6Z6l6exfrXZ3jbwfMHfKt-faj3ZPdtFCC6opCXh5KggCLyx_-WGUp4BdAwYEBBmWT9Oqz8VgdHgDd-niTmPcrEZZhqj9-AYwlAdPIBZ4ylD21g8-fZ0Z0kbtel6_QW22qz6wpfX65lSZlV-tFtY2R83j14kP8ny30iyju3KZ1WznydszUa9C8QbvpmaU5FSJTIbwApIsrbha66RKbVRsxJtD6Cm35otGDt4jE6Q9Vfh3XwWPqU55G9pZtmPshVXwkTNifeZoMyn2K_STS6TF4JR8itJxWfngPoQ5wTLOzw7hvWG237ru0xeG9ReyP6ftdnjMQvjw9kxfZZTRg0S78JRButGgxTpzV9SM5DwbKfKXbbXlLRHQjVDL74QaTt8ubsxziFS9sHM3p7ttznbCiYbqdplzZxpdF6gp0tjhlHfB02_FjUrqkNjtOQJz9q4fBgCptwACQ7mq9VG9w6zmKDO-BQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_19",
    "name": "Starbucks",
    "address": "8 North Earl Street, Dublin 1",
    "latitude": 53.34992729999999,
    "longitude": -6.258928699999999,
    "rating": 3.9,
    "reviewCount": 708,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7bXHosmz8F4iXknhxYLRKqiaQSwhhD5osYBuRfOySp8laH4C93yrq4rtFwtCHQ-1jLnHJ69tUpsdBJx4HRni2F08_RpvKFd8lKRq5skF6Axk8p4iabtMzjW_R3CIon1RngScOAZQN1lrRINsG7XXw0SYv7VzDlG5tcbeKGXCiEfvrMAc_WGgBCqKZy-CIBpuAJoVTdhh5R-3yIOmDCiSPr6ETeEWCCRqy1t9Dc5edVHWhr-Mqd1DItwaGZUQW1RxAPoceY0kOsjl4OulzWQJdV5bwsR3YJab2ARicZYb_E35AzaMgeXHZeovmn2fZ-UiUlGQLtxFs&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_42",
    "name": "Kellys Hotel",
    "address": "36 South Great George's Street, Dublin 2",
    "latitude": 53.3419913,
    "longitude": -6.264658599999999,
    "rating": 3.9,
    "reviewCount": 177,
    "priceLevel": 2,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5pSlnTR0ElE1iSsLUYYBMVR21b_CJcX-GjY_rv_Wq89gUuoQVFus4NHb9rPk9rS2paKkIp8B1Q0faQf3_ISTQthyYTf0S06A7o5zhPsMmIaIsk106WCYe80x2ch5QHbn4r66CbQqTNBp3IZWc5PrI3yxa3XrCuMw5Hyet2rgyBdJefIOnR6Bibhz2Wf9LaN4l3IzrkrdPHgMQZRSB7rzrOBi2L6uRcAPoYeSG7YxMase2m4Sfxvs8OqrNaQ7jYtD0xh7Y0MA8i-RJhp0w836hQCvTG6Z-jnQVIE2nqAu2iUwjwtK52eCfuKq1ckKLUCoWJsvIQ4to&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_108",
    "name": "The Whiskey Bar",
    "address": "Simmonscourt Road, Dublin",
    "latitude": 53.3267395,
    "longitude": -6.225877400000001,
    "rating": 3.9,
    "reviewCount": 7,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5lFWgFCcCk4OoznwosHboHLU3nVrhURUcOMFFiAJ7Ts6s4kZE7cqPc5b6E5oN2Bo4hbFQo353rLnJOR0_2ovpIOFg30bElnoXUJl3KeIuoQ_6mAQpIHHGLt4MqCWBs2BU6H3zEa-VnPTSnDbeXxYSPnu0KkvXr1ZXaehgExc2fsyZeNWndKGHCYL8T5Y-mB3Kccdj6EAa8tAWN_RmfPr_a8tqLlXiBT971YAit9KU8F-03FJvWlCqMGlo5q8yVR8B7q7fgbblE_KeQBPfx8beAA2djJXcG7VkIRmpjH2Jsx-1WabFhTQhjrMw_I2GGPSP92UQ7U-hJ5lOnk6pvuA-ufHk8o-r9e_bzEb6htqEdvdds58yKDzPnlmnwDjuBCiGUlgVejDdOrRj27TGJb3HzcShnds-Bdb3Y8uQRqFf-D6fJJ-GMNHMxs79VbFSCLVzQaAOJjg8dVAE8qRJr0PIlFdtCbfmpwth05Kgk3aNLmpqaXaXomNgSERP8XB3f2wGBOeYG_d3IFA0A4NoiXCcsCPgDdEVAuoL0IenFlao_-_sl3Wu0v564McO65H7NbVQvOGWcXF6n-Ed0EZLBQRJovThLC2C0VNs3ZFa5TUGE2aSYr16nC_94190z42iFU9hEvw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_197",
    "name": "Eddie Rocket's",
    "address": "Unit 10, Phisborough, Dublin",
    "latitude": 53.3622677,
    "longitude": -6.2732649,
    "rating": 3.9,
    "reviewCount": 963,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6fgBMSekEbiwb9ZAIBFu1xoPc1oZGN2T62sw43xvVvKImwCNGU-TpaFApVq1_xcee_dipwwAwCbBG-D845sB3xcLbmD7TCC6wEXS5G88y31E6d1zgFmyQlIqhziliYDk5dcBSB42oR_VI3iODFzYvZwS9TirVZ6-k8S6_vbs0GPXX9OUw-1-34FJe5vpXFhJPCdcYzXVwzvAg-F02lCe9UzmUMtJbr1bftXthsxTuEBwYvZP4V1pjImMa16V69Po6TtiySkPKYLG5RbZDlOquy41-BUhsegE-EmMWZPuucMBUMi89WESJyg1g2I6qppplPCbUMTn0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_203",
    "name": "Welcome City",
    "address": "66 Dorset Street Upper, Dublin 1",
    "latitude": 53.3570432,
    "longitude": -6.2640347,
    "rating": 3.9,
    "reviewCount": 127,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU56XsCbfwgfLg2aXnVsfKB-bclCGojLjM22M2GyZfFHrRoIFmJ0Zu00_59_cBLRT1dTia8kDjUDC9DEuO33alAK97yIxkCeKHNe64ZkdsknbKgC-MIHWcp7-YwN83iffHJE5d5hcfXv-B3-xv89CYbZwW2GnFk6hbEscIZkcyMN2Teug5rwpmnte3OicXRirTeK8SXQuB0XIHLQuLMxxI182bz91FCQBjWjcFessD8UJ4VUnUSKpx4viiCMKA7BPcf0UB1wrMU4truvYsC0XM4ARssMn9h0_9anQJjfLQy7Vv7OFpk3IQVUPVC3nF1bWeuiIVCyHozEZz-PClAV7Me00cv9CckcJXeii8LfJ8-Grw7S5gVd4GA_0Bxgx55lgrkAWN3F0ZHzsicJBNQHFcq8FgNpJ-cpBwhyWSgHuKDKO7GMfT0hR2nHj6x38FDAZ92NcVe4hWM6WDEd5oD-BKxhpfLVzt4KJfjLf6faFdYFDCtCVtMIzVDyKTGEHgzsW4pzAgX-2rMqQBDr0UQVAC7tUeavWZQE_xyn1tMSVoSYMGwUpeLwlw7bz-PgomlvTyKNHZqzD76aMYxRooydRJSxhtWS0Oy4SGa9k0Pggr7NiVJjp3Zme-gxa3cssmyCe5hPzByW&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_232",
    "name": "Starbucks Coffee",
    "address": "Unit 1, The Harcourt Buildings, Harcourt Street, Saint Kevin's, Dublin",
    "latitude": 53.33294309999999,
    "longitude": -6.262169299999998,
    "rating": 3.9,
    "reviewCount": 375,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU72E2in5lL_5tPbSSeUP4bRdijGvRmxW8rrKr6LVFWNefoBzkRLSYMH6yI_4u7TefNzP4P_8lHp49x2UvO9yR9F9nyvA5TZS820AQcn2TEJ04fwQUidlcNR9kUwY-QGfF7VUcypfq_K8fWLmGYjLgLDOXpa3MfNFuqpLwmlOqnSbvJv3qcmuNNVJtGqbDMhNqR-NH_1WVcibgoxc-P7YDAvenSw9XosLAiGqQWA7ahKFrciiFg20rfqdtkEQ8d3D98REM_847udGnpj8QXSP3zG-zxAHL20eP_uJRntPpeKQPW7tntUsKUwh4Lzp_nhKGxrt4_Lznk&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_18",
    "name": "Starbucks",
    "address": "39 Henry Street, Dublin",
    "latitude": 53.34967109999999,
    "longitude": -6.261582199999999,
    "rating": 3.8,
    "reviewCount": 870,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6qZFu-ugrFPw4LOQez3BQKKgomoqnM1FxqTsLqaifeEsrQwoLlCJVvCoQSXWnfIofMJnsqKwjO6kwqBYw6kZa_DK1YQq6Mw21tuB286QMUVQiHnDd_ML9-X9wRVj5-10oBWFuF72z8el75sUKJDkFTVBaES4j7lf79Depnkxzn-tBMhPoK2ZzlU-X93NTzyGQL0LKwsgH7PF8dGIR7xgvI2OJdhPfO8_uG0iMco6CHmeNDzhUMv32MqqRkMQ3XN3umufaAbUmRhUR-rrg0u1fLMRbFCUnYIZenBlD3ee7nwAhIPvposEaS_XSrVMw8IqO0JaRqoLE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_90",
    "name": "The Natural Bakery Donnybrook",
    "address": "4 Donnybrook Road, Dublin 4",
    "latitude": 53.32253439999999,
    "longitude": -6.237959899999999,
    "rating": 3.8,
    "reviewCount": 158,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU43AnLGqKzxLLd5mnknZlwmWr5Kz_pDlNuAGgg9Ph8PrJu80tB3Ba82xDi1IwVBK2ihNTk1XRVt_oaftFqdHdu-_TRlcWgZ-FWT2UtNMN2WCGiNn4hw5qHjWZ2OguaAnMSP2NlnM64697x0wjSmQ_Ji7sAK759OcuhM5TcwnVUbLQli17TlmRPDMkpd2XO4Cp3WEPAf7NjQLt73ghjtjp1pj65AIMVintSEYxArRusZAFgS-HWHdh5nf4xPtzt2kDj5M3vYYD-cv57qbZwBIENWKLWncShj7WhYE6HhCf3TJXA3R8ySIThysbzd43BFakxxHQru_i4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_103",
    "name": "Romayo's Donnybrook",
    "address": "4 Donnybrook Road, Donnybrook",
    "latitude": 53.3225186,
    "longitude": -6.2371476,
    "rating": 3.8,
    "reviewCount": 469,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7uCaQJr1H0STO30u7NeWo9xs8x4fZsTsmZhQymHcVSohCG40Pp7Ql0zAKz3Ol4wLgbp-gu1B0t9zMhA7PCgBvSNRUw4t7dzBr5Efcqlkzo64y9J1NkrnRRWi6zHl4sO3rjwl6uWzh3PWD51XlI9Dx6yBqkHcMFOV-c3smEHc8RVFFFMnbsz3ZASuJm5y_vZ9ax2rbGC_VUT5QXPLbdQgD_S6--pVTArtGV93cBVMeNe9-5quCXyIewpHWCQI19AltQEtwptyKoCu8sIbNme7barUN30zoYavMTIfJViuGy5XnDKGrlfOcR2unykCesftFbJztGPMBYRX1VCDOc2-p7p5qJDtdByqJQnZz3SrWz_Q2tx5tItdv3jQLg5uuv08HLNcU6-alwyVEgTi_gjMGbSLAD1As5ILOtS3c_cNJlpQFzlUeUtXJxD5SuYBvxISn6wXMzmkq16oSHZS33hjsGLq4VQddDMtso1vUAgZwND_U-6HcuB3x3j8LZ1blPUeQlq2s9NzEafCJHA9UKh39cgaIj1PGtQ6-PQDRbFnOJLdQlYOMT_GYoeKwPvxSZ1BNR-tb23i2P0u9r5nHrS0zgWu91yAbV9Dw2PAdcmDWOzN4lvpJ6GIvQyhTCzI78&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_104",
    "name": "Abrakebabra",
    "address": "3 The Mall, Donnybrook, Dublin",
    "latitude": 53.3224945,
    "longitude": -6.237946999999999,
    "rating": 3.8,
    "reviewCount": 397,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7WQtRDiXtNKlmlFBhuL8xwxHcD4lD1Un_lW8wvZbbKFsQeke_Qu7qsP96xQr905WBQWLoGyKDa6AY04WOFoYzRYPTlBXlf8zEFxMpr_0fGlkmYT5gcblhJ8bdgE6QDByclTHuvPT17wJvmBYG8GfJ5wqShn0BZbRi47t56UCgU7BL3fKgrLx1gQA48sjGoqnq4ksabLn5TcoxBcb2QLaUTls3Pmh_pmIgcW2aV-U4rV8O7o6Ye8HiYWjvzogjIQo84jXuHjcIIljHxZvkLHJs0bpFQHep2EG5GXdsaWrMDUTAdqhBLYTaNswqSP50mkpsqdwpnZa8&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_122",
    "name": "Starbucks",
    "address": "224 Rathmines Road Lower, Rathmines, Dublin 6",
    "latitude": 53.3233727,
    "longitude": -6.2653023,
    "rating": 3.8,
    "reviewCount": 498,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU47yqe9yT4sYGuyIM7_DMIYOZfIJgBmh9y6hpwKSw13Fi6JkIUB9xJOXuUzn4cfL3jkkzFLDy0xVfKlvZnxpcCJ0d2G36B37k7EAD2ORK96bRBB4V99s60C8U8JF_H_LaLPo1qfzWRa7X-yH0DtoPLJAjAPm6wmFWyF4cWrUw-Br3fmiRqSzeyxBcxtghlJocgjTNw_WJ53M8lwME01ylVR9DS5JYwn6nvL0LWImMGn45bNGOvEhbUjNNZWvGbrUbMz97mADlrNa5BY9lxG1lWmL4zZUv_1ZiTFyenNXKg8BJeII7JUAe0McwBZnLXFZ8J-FII-OQQ&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_202",
    "name": "Sweet 'N' Spice | Pakistani Restaurant Dublin",
    "address": "64 Dorset Street Upper, Dublin",
    "latitude": 53.35693109999999,
    "longitude": -6.2641329,
    "rating": 3.8,
    "reviewCount": 575,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU64NX4UOCKq-oFQP5daTTh9D1IFlb8EJgjaoToz1qJvjTzJWspg8DUYKR2Zi_cFFh_2EPOTq_XvUjPyz5QfLGxSVcB9R-QDtoHwUahY_x3sjRY6micdZgZHKjFNXxp17lRfFiwBpZ3rTeYgIt36aBnZUo1oz6JpWEGC3yqVcNOElrxX5tlbPIJF2lojI8OPEh7uy41ZrzXdCCOC-V5M4bYDKci1o7UobX-2pA6J98EVgs9T7kRZJN7HEkW8jefOoH1pc1FtLgox53zFGuz2BXaPtfvtwqD_P4DKA1YMiU13gHc0k1JnaJzHXo5Lt9uHjoURyV_yf620ry2ebBnMCAySpu7-O34By5xM8naHY1x7gqNMLwWEcLnACEYS8LLtnyJ323pLPfntznPeMBmH0LpK4H01n1VFxleon2jsDaYT797m147K8EHe2r2JMEXSSlGtpQ86AfjT3f1WY1N-dBz_HSd1lZAaul-BwZthmTV-tkD318kJzwc81Ik_KV0XntzSMf83_3_fAzo0t25Di1T8bzgDaYxw5a4PGfdSjKJvpRNotfL9-X0ZyKl3gIchB8J3McKkMYcg_Qrll_5ZzaaffjhNFS-kqSroylyMUO8_qojEW5YR7WKp-HW5xRq4TH9vqGdo&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_35",
    "name": "Beresford Hotel",
    "address": "21 Store Street, North Wall, Dublin",
    "latitude": 53.3500925,
    "longitude": -6.2527385,
    "rating": 3.7,
    "reviewCount": 1669,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "bar",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7dtGS53N2RpetB0bFEhb7zgiZZWmmGBvjGuqjjkc1TEm0FHY1LpwLv0ImvXEtzpqzQPKaVtugGMyEYWFI_SUzzQLWyK0UHQzxEvkdznHi9F4iqHRVn5zp3OycOP-ceW2qJoTpAzIi2xhju79BbjaIkJ0PPt1g6BCicWj7cQ3Gnpw-6xRFcGDcFAQHX055z90HL4vv_GG9nmhKuw5fVzkfG2Jsw9lrlYxRZ4RBF97o0jw4AtUgLyxgrmrLQvk1UTMayFqeQbwfg3wmrNaPPNLpkpczeEPT4q6xHTjmq2C8BHLyHEJLnQUlveYD2eaQyAusYaKDkzbg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_237",
    "name": "Eddie Rocket's",
    "address": "19 Wexford Street, Centre, Dublin",
    "latitude": 53.33666419999999,
    "longitude": -6.2653395,
    "rating": 3.7,
    "reviewCount": 1005,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5BMtLMNdc_FA1-eGbuuY8AFxtHx3NxclRh8sm2GMlO1a4-V8dnAve7JKfDMlPZmvJWsc4Hr7vnpKkqXiJNJDKJkpc1dBGH9-UgRXFLmtwRaXlB26lNWthvYGJo7AUVFK0cR6tDSMuIK8u4iLsJtVD5z8mRPVImx21QcMrByAPmOdYuw7ZVtzcO8m7xyD2VYTFx1Kmd1kl1zmN0snjn48EdVd1N0XJl3XBjN4YRHvC-TZrq3lTEuCxZ-8KIe9NPqdQ9vbOtWuBT0Z0500c0FvDLEq8RorfzYHstBI9HhcJ0MmsVjWoTqJaJCndvmI-Zw2sk70vSMEw&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_147",
    "name": "Domino's Pizza - Dublin - Rathmines",
    "address": "88-90 Rathmines Road Lower, Dublin",
    "latitude": 53.32668839999999,
    "longitude": -6.264707599999999,
    "rating": 3.6,
    "reviewCount": 637,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7i7ouE627hDF_kq9JWe216L-u5swIWgHXAJ0arkf_QDiJkUKD_j9HV4hM_uDLAqw2970Ftoz2VfzpsJEwI250PhII6jrnlg4NIv5G2BGYhIS0bL4M7badenZJeXcEiFL2paK-gO7CUI6ZNMnXCwP-fi7SA1tjoP1CgnZLQ6csE-HxK94p6UMWi2PaGvKe-MsIoOWQ9MNnNzFrw5Y5hksNCPlBcSrUKMTCB_KwijAxlSf0tdCbcnocNHTgDIVaF_aEIeHOjOkjUeUdwv4U47TOdJMAQoqGMTZbcS2rlL3yi1qzL6f8h8IHoY3Q1iBtHHbklZUM08e2-DD5ty0HTKfrIFpJTsdH-xFlyWis2WtEZckf4EnJuEzAKMDTlRcCcJusT1pRr0t4l_-ocupXVo5BnQmzHJo0Hc7PvxY9CqtzM6Km09eqVlc5m_J20Cpg_R9OhmG705DGl_qYfrKaW58fCUVSiLPQlBckW3_uPaftMx_iwVVVRFW3xVM3trXFzNv0VcM29t34Gm7mTCSEWvtB1lUEXcnwv_v_tofv3EKnf-Od3gNV2BQqO5c1o_B9vbcH2bK1b8QOU2EQK3plPR7mphWlSHeUPnxRV0poYtbN42b4jnpDpbHYLuYpu_gI0sxpNzzdy&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_157",
    "name": "Mizzoni's Pizza - Harold's Cross",
    "address": "200 Harold's Cross Road, Dublin",
    "latitude": 53.32278609999999,
    "longitude": -6.2794393,
    "rating": 3.6,
    "reviewCount": 159,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6JJiwsPsAaa_ziwu7i7H8pE58n8DlCiU4UjmZ-OvVByZ-iseST3s9m1SDpvOJ66E6p2ibEq8s3LKZ81UEqAaCZI7dv6cYNlxqJ6AQ2-RFG8g5vOa5w0KEmU6TpxGFuzVBp9VS_7dsP6ryFtocCDOdkhvNxssbT4qSbx3o56xT_iSmQAt2nStRUudRD-myru3-A2qgXKcy50Mpm6zd44fEA-IPPlT4-SWBGmB986A9YcJgVJZAFFhooD7lAmphhqNl1w6lC_NlRnzIHJ-v1tDGCikMDBAFxeoFDlC9AYg65XOZAg1EA7ovKV0pzJNnA2p-7azjNN_w&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_198",
    "name": "Four Star Pizza Phibsboro",
    "address": "139B Phibsborough Road, Phibsborough, Dublin 7",
    "latitude": 53.3624398,
    "longitude": -6.272665099999998,
    "rating": 3.6,
    "reviewCount": 204,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6ykb4-auCZYQnYHm1Sdja_ELBsLT8rk2VDWI-RkrbhxToOCU3e1HC4obTRxw77G8VWHyCuR3V5hw2lDC7SDKbm21f6jr2eQY4M5U69oPdQeY94jyQDD78cabpRXQ5Jq8Ia18dlsuq_q3FAfkqCWPc6yqr0RRo1xjeg_AIdkEydMhAjn1RVDBNudhRjYO4CXruMyW7AeVnXJ7iAbW-puOmcdWA1IwoTvfivPazEr6fSNcR-B9zBP59Bl9DcI-_WPp7MXBIYiwxmOWxUecAPnXJpDNd8hiuwHcQXc81IWR_nizJT9x1znLmf7bhXyiaKToPhBIMCEtA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_206",
    "name": "Hong Kee",
    "address": "13 Prospect Road, Dublin",
    "latitude": 53.36556419999999,
    "longitude": -6.2714323,
    "rating": 3.6,
    "reviewCount": 189,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6KqRDyP1Wtu-x6zT0JMoFFEvGVY2mciuxQXuaPeZPYEuhInTXBfdeBS4kRFMSgo17B27pbG5gtgjHd3zNbo6b-0QuHluk-n9u5A7IecyMEEpCsl9dF0zzVQvozizDsVnQfBnf70OwfpLuY4PPXIvhyn7Vf8eQJK-C7ZVpi5wVUAcEKXVRIs0g7Uk9CXtEqZRAvaOkilWKEH24iORPMbMILQ2jWPtaISD833yXKP5a0liSfDz3GZaaHWAsqs9hp85ZFoo4UC_hfMnyCpZwgl7MbkX7pmWawf8Zz4X7ChZoTzQ61zfF2q_z_zfbo-bex5SZL46od4h6241q2eSiZ6w4BlFz2wBeFndp6GXEu-77zPZzm_dLGGWP0e4lduDFiBgT5r-LatBtPeRUcqQnFR_sUxDaQO2hrTNgYHSebLwYbSniWK0bqy1dcruYx9lZ-3npmulXm7WYnSd1ExcvGMVFnfY19OufxX-WrnQCXe2ZL32Qs54EdYhbgodXoqGHxTOhTnlqckQJZ_fm84zC1zXk6o3Rgk6w9bg1ttvfLbSoX9huMkRrSnTaJT817EELJZDuVYlrVI7ekPqRlfCx-10A3P5EVHqX1F05ehPzkAovDsGseDlK1g5tMh92_3VlybuskGjUS&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_247",
    "name": "Copper Face Jacks",
    "address": "29-30, Harcourt Street, Dublin 2",
    "latitude": 53.33537940000001,
    "longitude": -6.2636561,
    "rating": 3.6,
    "reviewCount": 2929,
    "priceLevel": 3,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4hrmrTY12bNzrDNH_-HQrobrnOZvCZsLksNj7Wo_Cpi5q3a6tO83vgoUdX7KcpkLlAXqUXtvCAp29ynYjnJ6rA05PN0CrHEGj3xhCH3ziz00RRBlYFhb8jlR55u1xShrPRoF4r9BblntCfKXMnads5Y2tVg8ZaRbgs-Dxfk9sk_DQlO-_3p2tW8x_E2wt142rXMEdAdZYJwPRu73mgqIqx9cptYSWSjMR-EIWzbZCWdBT6u8Rg8rT7oV7zkT-Cx752vk2Xx7H8PE3qNoznNWRIcmQ8a9XGNKcSgNVMRBugJuostKKgNlfxhU6mWF_KnePWMHKT&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_144",
    "name": "McDonald's",
    "address": "Swan Shopping Centre, Rathmines Road Lower, Dublin 6",
    "latitude": 53.32354309999999,
    "longitude": -6.265295,
    "rating": 3.5,
    "reviewCount": 1626,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU64ZfQuHFVyLwbduykZgvljjcg1lkKXnhCCnvmX2xBeQKlY5GADy9hXYiKvdhfFYBwTA05bM7YPY9_HbN4WLcqTftoYO13KYz9Mk6CgdHerBeDtc7CiK6KzgGlsJuqa9incSRB1aTe_OKpGFhzPY34mWSZhtXfVqJqvrU-Bf4s62Y7iVAtiCPmhkg_yPKGMqEZjaZ6xWT0JIowlyH5ns3aKvVrL7IL9025JS8xakTqo0bfg4hwHKSdbHBMIZ7OMXw4YZuinR_QQZXFZvR8URQzgRMzdaeuNdCfgVtAlUWKKFejCLukNyjPaqVpNHmbjZS8LpGzRXdm8GKwsyyF1Uqv8GNww5_dWsSE5xkqsnuGc0elN-xjxxY3ov_aizbCVV6E_UxQwF8XOWaZfGRXi436CnGkxEYTzxB-kbut5JzRWyBEqjLz8worq0OAt8TMJELSjQu-JquKtlJ0uYAS_35v7kB3NjIpeVA-SjjThbUiA5qYzznoGgroFUl90rEzaaGH5WONPKidud2yO8GNrS0i4DZPQytQUTSs24cc7m91J-XHmoDeZo57fZv8SP53PtwRkwJ9Bmgx2x_kq06_zwqEqyhDVtd-TsY-p6jCT8sONNC-aDGJDUzYZWhycx9DwsuQbwcNA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_154",
    "name": "Subway",
    "address": "Unit 2, 140 Rathmines Road Lower, Dublin",
    "latitude": 53.3255659,
    "longitude": -6.2648499,
    "rating": 3.5,
    "reviewCount": 206,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7g-71uqWxupDH-K7-h0fRJzrj2UtykCjTAi3VvZBxwOrL0WO7zmGRVyKIkyiRtpS-jUMfC64GuoekRARAEjVm3sANTlEQzb0PTHIgM0HJi6FUPSzkSGs7BCSzK-63xIj4cMO7KVCRJwpGPtC_YM_HnUYD6fLeOhTYE6qmJFRzybDCJ9E7L9HlvphGKGnLY5SUrk1HGZ9LDJ7ljIpT_TWhIwGKdVCNZnrJnkruoJGd3Dc48MxUTgLUt4A8jSl4f4GPf9f91s29a1TRie3RMZGaKBMSP0rExMUGHm0lvSeHW5t6b27vz3YVHnnxFKe7Dgl79jvBhEuc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_155",
    "name": "Apache Pizza Rathmines",
    "address": "147 Rathmines Road Upper, Rathmines, Dublin",
    "latitude": 53.31627049999999,
    "longitude": -6.265471299999999,
    "rating": 3.5,
    "reviewCount": 246,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU57fWswJTedc1zgF07dAhNU_eHjfk1z_x67hdkZKLdFEj17TyLNqCMeaJf10Mc0OXs7DO0MOTRdApvAyEU6BEffSAsS8DiIY_ZGfRg3HpFwP4Kt5rR8_rro6a2W2wjZuWv9k7QHx5IqwP4jrUSUMpHkZzdLwYktDkpoiOcP-Yg_6FLdxqFCFKSnVH553pChvibhKCIY6OQCi6uZf-DBkgYpqfco8XrdIzErXrG1nsXzN2AwsVyLD9hS-JtZFdsH_VENOEw9Gn2iXj2zZuoExULD59AMZLSmdmWWwWpLw61KtXbJBcfWUr1DYKjwoJvfOkDUhrfROl4&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_67",
    "name": "Dicey's Garden",
    "address": "21-25 Harcourt Street, Dublin 2",
    "latitude": 53.3358582,
    "longitude": -6.263555999999999,
    "rating": 3.4,
    "reviewCount": 2831,
    "priceLevel": 1,
    "type": [
      "bar"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5qNR9TALrDGP4ZfnMtgSlwcX12Dfn6jU1pj4dKpbOuYmMcyMs4eCoKd4TlNm-wE8R8MIxM3r8VTu_OjTwg_WDiAFB4KN4O7WlDl-7dZP-07q5dyUJ_pPnqM1rRHsepSRFZV0KC3c1DVByN8URKtbpeQBJSf4kHG_lW0FTsI8pzlKczsn5ArYxXQTVPSr11MUO07zi4h2Y_bBtUJvZLjqHWeUIkx7Ii3sMMPQyQQsEGegBae5l6sQO3fMMtPc5TfDKTcBciov82Vm10QMNjeXXWN080a7wcXiJY-RPa4-3WzaeVlA2oFQYL_wnJWAJ8NaifQXcf9qotzX3DAVN2-h6MwyIYAPnk0vuYC1f9AqM4uikfopOm_8a2MTNGtvcMKvVRp5WG7J0PoBZALe74W9ZCl5G5EblofNpxasXsJP5jfh5ieBiFJ3dl6Ut7ucN1Mpti9TlMhqifwyiaUs8mx5ceEjaIx5l2etXU_6qBWkNMP312msQbo5F7mea4iEk6ke5IEDhHv4CkTf1RVNlzESI4i25_pEdZ_pyOLdQ1JXXuAUa53OnUVeLtsLYV-5p47OpIWMxgzlHIB3RVnH5veiG1wKIDJ2EBE6jYbOvJ2ETvBsy04dTW3kFpUuwJzPLU6aQmmOFD&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_100",
    "name": "Subway",
    "address": "Suite 55, 55 Shelbourne Road, Ballsbridge, Dublin",
    "latitude": 53.3301491,
    "longitude": -6.2320778,
    "rating": 3.4,
    "reviewCount": 319,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": false,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU5JU6Dywl1r3l1b1VRxmWqfGnrWCjJOao_nkA0yS1M2b7zl5UlzJy5maTVLBdA7kjkYYxFToFy-qilWbVvFUwzIlUwyPuanP6L6ix4-Ccas5m0mvlPBrQvrq6x9tFSjEIR1vKH1KoxAtfPtJ1PwkKfDMUMLgZCPW8bQxWLpGJ0rr-LCFX23G07Y5goBivOxQPVL4KRyIO1b0Rz5lNhBXCaudxLwRKeNlH-oyIgRI78Fr9ymCwP3qoem7vJ__5L65z5bxIfV6dzlUGec1SnQMrcilB0oio-ffYbZRhOzcUCPChw8tiDzLCl3gdVunMCMoBQnlo74usI&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_204",
    "name": "Mizzoni's Pizza - Phibsborough",
    "address": "15 Prospect Road, Phibsborough, Dublin",
    "latitude": 53.36542139999999,
    "longitude": -6.271425000000001,
    "rating": 3.4,
    "reviewCount": 117,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6ktLF2bA2h4tMNXkfrewkM3KgkJVJh9MtKAdoUWLj4bPNbNANaoYeF4O7Jn7pX9ZGWBHATnMM0_ZDoYiA6If3zFve570pNLuo1aQyLd7kcS5TxbMox9_vkH-3KfjlaQVYPH_pTRsOFiDNu14VI7lJfbUAM6yjNvrheI_hzUkWbemt50v2YzEX2B8ZOfYREHjiaKt_E1BdW3HS_R8igl4iB_EGkaPtxRdwBoLfaVOz9U0fcU9IiRVT8QcuB_2P3fo8uN467Aed1C9GSAcpWJrFfHA-5a4MRikgsJwcEAk_SAvAmuS-1dCtcFqYJdhdiu7CWmX2_h4o&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_27",
    "name": "The Gate Hotel",
    "address": "80/81 Parnell Street, Dublin 1",
    "latitude": 53.35277259999999,
    "longitude": -6.2606074,
    "rating": 3.3,
    "reviewCount": 598,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6xdkera0YUHCAoKzDyKEV7OfR9YdNAOr5uTqrEkEEaZLswJy8oWJjMfrBXLIMXzvnHe94AZq5Ic7Ibon2cLvZPk41Z36PjHkrTir865c-2CZG4P4O2vFkNGI_KqNvxWqKPiIgP5GZQhkwnwskeAVi3eu24NfkRh3vs6EIHPD6aC9sSYICH0nKWc1d8_DP3QrCc7_mOB2rPSJk3-0N0H3eatS_wbkACaI_ZuJaK1txInSvZuaf7BIcHfG4MUfrKgAt2yudC3zv9fv_VhywqTEdEO6F6NKOJ9xq9G3SQTBZ_Ah6erCpPVxwd8T3AFLAvLJpMU1xwcp0&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_194",
    "name": "McDonald's",
    "address": "144/145 Phibsborough Road, Dublin",
    "latitude": 53.3620773,
    "longitude": -6.2724843,
    "rating": 3.3,
    "reviewCount": 1196,
    "priceLevel": 1,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU4KaCXKzGri4XPhyn5dw55EvWL1QJFbB5ouRnel1CtyQCwY6_0UYQ_baqcSfmr6gSC15gaES4SDPk6K4HRd4LvKM2jasjIQMMGBc4IAkOKMvbWH0O3iWZJu8krBDc-YXprnU9CVjL20gUB5x3gr98NNBZhlp1LX2WRjhfjWkKfi5VOYFT4iYJF3l7-xkeygRPlEprXBec8grIrrb-su1uiBD9pJkg9X1Pg-baMqHoPE3_d-PmM6o2TL_YwNI96oWhPV7wLUafUP3EN43SpuqQlevpsIYcFuYTtzHylVZAOpQvuZjW2mCVzc6Rop_kT5sNKPeSgNsFrW-Q-DbISOgyl9RNwb0mgb8jpIQHPj3a-daeLiZMqB6NnE8WUC6t2jnPv9eQ3rW5D5QNEBD9tjEPkLx6XRx5qdsJWuC-9XTvl4lRpZiiUVjFEZicNR11xv583nlWNNaes_VOrZQtYj5OWWzE50LsnLSHgofK7xYgxJ0jyLG7X0WKq5sQgdGhzrJTqOwRWlSy6LP5YAMizMy6pYKscDC-SclZmSzsxxUQjurwSyHxtJMM9XExKQM0t8kbEjRayUfujTNNd5whUIPC1Lwy1OSEcOz62MBWFrDYxue1WHdCIEEeeWbV-5J_Y-Fz_OjDr-NRCqkkTlkFM2rL5N7Rg&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_240",
    "name": "The Iveagh Restaurant at Camden Court Hotel",
    "address": "Camden Street, Dublin 2",
    "latitude": 53.333144,
    "longitude": -6.263975599999999,
    "rating": 3.3,
    "reviewCount": 29,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7rFsuQFokeY6TC3lzJRii9SWwaoS8SHxmx3r5U46KPrB5bKz7-gucQ8mpr1NP2W4CclU5jRlIs5nL4EVQ6DfLKLcu8uZfvKn_wwABFpDsV8qwOkrkTw36N_BtrYkTagdYl3EWPKRZq_xeb0J31WbuWvpGFNTIJZjGkVWPeKE1O-rDCTtWC1JAX371ovu7SJ21uSPAX4N7_Vnf-2fuaQm_owvdn321LRSMkXTmhWQgpK7dlmru6PY8Ny-GXXM2e_cdD1LXBhsvjasKJ3qCzZ_h7paSD7wJBzV6PHygJrNB7Ijh9EN8Mipvp1JzkNJKPtyObWI0XXOE&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_17",
    "name": "Brambles",
    "address": "Jervis Street, Dublin 1",
    "latitude": 53.3480843,
    "longitude": -6.2661395,
    "rating": 2.3,
    "reviewCount": 176,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU42iQGCcREQdKKhoJs8aUhosfg93Z5Y1ceqabupswo-IVXguHUvO1pYatrXgsaC7cMqHqoeBk3IC-PYJtc_FD8R1H9Ou9O2efdF2-jOS41UUrUgd_x_y17qU1ydxOHq6QDP_TTMf-mmvrrkPgwYNusYgLcm9AaRqS6I4pNlH9aNYPlUP-ZQ1CPPsWBNLLr9RwNlq74enWXdL0OArdW4smIkQa4DvO0QW5ByAZi_OCu8DjP7OxtJ0yWh-qjg-cyZxqsct82c-Ocz_ZTDjXF2mS5RHYNo7lQ7cOpMh4_RRjxQ_PqcAqvXkrE2sjNZhkNPilKB-YkfIqL17F4NsYmI4Jfu3OEYBavhK6VEr-qMj1KAl__oFgadlIPlLpW03yI6ZpFFBQeo_9vc65uJCa587PAOjRJ0AATxEpcKig6lgB3OO1osvfiyLx3CyXZ3975ySv5slW2FlJu9QAHmO0zYZSnqnlh6J_CZH4ovrmwOGy_opU7jPvptq1JuRD_zTUjUCvGq8g9wkur1qoV4pRgiGF2FYItpZhyIOVNXqrzVPFSh3y-8A-WSIcRvz6f9B62NF22Foc4Hn9R-YNuBQrt-2bbooaaGuvBQFtskuU8A8waT_SIbo0WR13uDLroISfbETSP1vA&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_102",
    "name": "Just Eat Ireland",
    "address": "35 Shelbourne Road, Ballsbridge, Dublin 4",
    "latitude": 53.3311095,
    "longitude": -6.232089900000002,
    "rating": 1.4,
    "reviewCount": 248,
    "priceLevel": 2,
    "type": [
      "restaurant",
      "restaurant",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": false,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU7d-6-or7iPATbw5eqDgWAfDpAk9MZIKl5ewadmn_z7H_3QHlrzN3oEZ5zraNFsBbRxLl16tTcAeEIDi5MS0agweqgVRgGzGMqYa7p60NrV8VYy4CCX4D3P40wzMMe3I_Pot4A4qv3fpJMxW_wXanNN5ta9eHZ8ptAPHHwoJQipC4sEIN8jBveVaXNaP_saal4nXiSinAx9q2QEYwc43Tj5I85Z9Sdep0GSw3wN32Cg_o4ID5dhZv7EOnDKNt9ngzGitHFlQSVfnTlPJnEB-wBFwvD12pfCfYTsoWOjAiJupfiAJuF-sRIEzouve4_dsrtU4xbmqEc&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  },
  {
    "id": "venue_189",
    "name": "Aspretto",
    "address": "Unnamed Road, Dublin",
    "latitude": 53.35645,
    "longitude": -6.281591000000001,
    "rating": 1,
    "reviewCount": 1,
    "priceLevel": 2,
    "type": [
      "cafe",
      "restaurant"
    ],
    "openNow": true,
    "accessible": false,
    "sustainable": true,
    "lgbtqFriendly": true,
    "photos": [
      "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=AWn5SU6BdcxuImWXpHubzz4VmLWkkszWDNtwe2-a3tztjgwBTNct1HTYkS1m_vfww8A9GR0A3RBEzgIZ46rbr_yCx_f6EyvU4wWG7K-SLLGcmyBhBIgcb6cmnC7ZQDK9ExhFcpParRodCLztOhYSRw2LnBDVJbpqlZe9dM9T4jRVlc1rxdmJgAT14FMIzC8Cgb_RRX8twvcXjQRO1iY__95EfjaA4wD5TqMLwvv0HmUdqaj17ffXyjv3rOvjZu0k2L4d1-nYuNi-1urvG9-JmXdhz3nFncD4H_El_izxwcqQd8eO-g6QWYU2zcbjU7J7-9t29v-CrIqIJbdzSPplsAnZ7pjkQvNqP0Og3od4OZ-sKkYhCgfXMDDrZVTNRSLDr3HjPCggLmXmjOTxWbdeudMJGVKYgZnh-1dyMRaeEYqQcERuqmNfmxaAhMHISyMlG3cI9LPAkZXAtZGcuvXFS-0Ul6o_WGb-cxaFgVSYg3GUjR2TPVZbv5lOS3ZFdZJyqNSJE4VP-nDzGZrAglrKld2TBQmig5LJgnQ7kgM3FD6MX2-PBsx4zzUZ6Y4a5TUUis68oygJIjjDCiHcP6t4iDty8m1dHiSKz2sDKorLQJ50v4OGCSlDpjixeKdfX15jF4DsqZs_p3VD&key=AIzaSyCQggSzWHkxlADGQ6oCgTTCPm6qlMyjsKM"
    ]
  }
];

module.exports = {
  MOCK_VENUES,
  calculateDistance,
  getSpeedForMode
};
